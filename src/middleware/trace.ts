import { loadAWSConfig, SimpleAWS, SimpleAWSConfigLoadParam } from '../aws';
import { getLogger, stringifyError } from '../utils';

import { HandlerAuxBase, HandlerContext, HandlerPluginBase } from './base';

const logger = getLogger(__filename);

export class TracerLog {
  public route: string;
  public timestamp: number;
  public key: string;
  public system: string;
  public action: string;
  public attribute: string;
  public body: string;
  public error: boolean;

  constructor(
    route: string,
    key: string,
    system: string,
    action: string,
    attribute: string,
    body: string,
    error: boolean = false,
  ) {
    this.route = route;
    this.timestamp = Date.now();
    this.key = key;
    this.system = system;
    this.action = action;
    this.attribute = attribute;
    this.body = body;
    this.error = error;
  }
}

export class Tracer {
  private queueName: string;
  private aws: SimpleAWS;
  private buffer: TracerLog[];

  constructor(queueName: string, aws: SimpleAWS) {
    this.queueName = queueName;
    this.aws = aws;
    this.buffer = [];
  }

  public push = (log: TracerLog) => this.buffer.push(log);

  public flush = async () => {
    if (this.buffer.length === 0) {
      return;
    }
    try {
      const eventQueueUrl = await this.aws.getQueueUrl(this.queueName);
      const chunkSize = 10;
      let messageSerial = 0;
      for (let begin = 0; begin < this.buffer.length; begin += chunkSize) {
        const end = Math.min(this.buffer.length, begin + chunkSize);
        const subset = this.buffer.slice(begin, end);
        const sendBatchResult = await this.aws.sqs
          .sendMessageBatch({
            QueueUrl: eventQueueUrl,
            Entries: subset.map(each => ({
              Id: `${each.key}_${each.timestamp}_${++messageSerial}`,
              MessageBody: JSON.stringify(each),
            })),
          })
          .promise();
        logger.stupid(`sendBatchResult`, sendBatchResult);
      }
    } catch (error) {
      logger.warn(`Error in eventSource: ${error}`);
    }
  };
}

class TracerWrapper {
  private tracer: Tracer;
  private route: string;
  private system: string;
  private key: string;
  private action: string;

  constructor(
    tracer: Tracer,
    route: string,
    system: string,
    key: string,
    action: string,
  ) {
    this.tracer = tracer;
    this.route = route;
    this.system = system;
    this.key = key;
    this.action = action;
  }

  public push = (attribute: string, body: string, error: boolean = false) => {
    this.tracer.push(
      new TracerLog(
        this.route,
        this.key,
        this.system,
        this.action,
        attribute,
        body,
        error,
      ),
    );
  };
}

export interface TracerPluginOptions {
  route: string;
  queueName: string;
  system: string;
  awsConfig?: SimpleAWSConfigLoadParam;
}

export interface TracerPluginAux extends HandlerAuxBase {
  tracer: (key: string, action: string) => TracerWrapper;
}

export class TracerPlugin extends HandlerPluginBase<TracerPluginAux> {
  private tracer: Tracer;
  private options: TracerPluginOptions;
  private last: { key: string; action: string };

  constructor(options: TracerPluginOptions) {
    super();
    this.options = options;
    this.last = {
      key: 'nothing',
      action: 'unknown',
    };
  }

  public create = async () => {
    const awsConfig = this.options.awsConfig
      ? await loadAWSConfig(this.options.awsConfig)
      : undefined;
    const aws = new SimpleAWS(awsConfig);

    this.tracer = new Tracer(this.options.queueName, aws);
    const tracer = (key: string, action: string) => {
      this.last = { key, action };
      return new TracerWrapper(
        this.tracer,
        this.options.route,
        this.options.system,
        key,
        action,
      );
    };
    return { tracer };
  };

  public end = () => this.tracer.flush();

  public error = ({ request, aux }: HandlerContext<TracerPluginAux>) => {
    if (!aux) {
      console.warn('Aux is not initialized');
      return;
    }
    if (!request.lastError) {
      return;
    }

    const { key, action } = this.last;
    aux
      .tracer(key, action)
      .push(
        'error',
        typeof request.lastError === 'string'
          ? request.lastError
          : stringifyError(request.lastError),
        true,
      );
  };
}

const build = (options: TracerPluginOptions) => new TracerPlugin(options);
export default build;
