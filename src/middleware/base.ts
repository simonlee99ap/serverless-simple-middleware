import { getLogger } from '../utils/logger';

const logger = getLogger(__filename);

export interface RequestAuxBase {
  [pluginName: string]: any;
}

export class HandlerRequest {
  public event: any;
  public context: any;
  public lastError: Error | string | undefined;

  private lazyBody?: any;

  constructor(event: any, context: any) {
    this.event = event;
    this.context = context;
    this.lastError = undefined;
  }

  get body() {
    if (!this.event.body) {
      return {};
    }
    if (this.lazyBody === undefined) {
      this.lazyBody = JSON.parse(this.event.body);
    }
    return this.lazyBody || {};
  }

  get path(): { [key: string]: string } {
    return this.event.pathParameters || {};
  }

  get query(): { [key: string]: string } {
    return this.event.queryStringParameters || {};
  }

  public records<T, U>(selector?: (each: T) => U) {
    const target = (this.event.Records || []) as T[];
    return selector === undefined ? target : target.map(selector);
  }
}

export class HandlerResponse {
  public callback: any;
  public completed: boolean;
  public result: any | Promise<any> | undefined;

  private corsHeaders: { [header: string]: any };

  constructor(callback: any) {
    this.callback = callback;
    this.completed = false;
    this.corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };
  }

  public ok(body = {}, code = 200) {
    logger.stupid(`ok`, body);
    const result = this.callback(null, {
      statusCode: code,
      headers: this.corsHeaders,
      body: JSON.stringify(body),
    });
    this.completed = true;
    return result;
  }

  public fail(body = {}, code = 500) {
    logger.stupid(`fail`, body);
    const result = this.callback(null, {
      statusCode: code,
      headers: this.corsHeaders,
      body: JSON.stringify(body),
    });
    this.completed = true;
    return result;
  }
}

export interface HandlerAuxBase {
  [key: string]: any;
}

export type Handler<A extends HandlerAuxBase> = (
  request: HandlerRequest,
  response: HandlerResponse,
  aux: A,
) => any | Promise<any> | undefined;

export interface HandlerPlugin<A extends HandlerAuxBase> {
  create: () => Promise<A> | A;
  begin: Handler<A>;
  end: Handler<A>;
  error: Handler<A>;
}

export class HandlerPluginBase<A extends HandlerAuxBase>
  implements HandlerPlugin<A> {
  public create = (): Promise<A> | A => {
    throw new Error('Not yet implemented');
  };
  public begin = (
    request: HandlerRequest,
    response: HandlerResponse,
    aux: A,
  ) => {
    // do nothing
  };
  public end = (request: HandlerRequest, response: HandlerResponse, aux: A) => {
    // do nothing
  };
  public error = (
    request: HandlerRequest,
    response: HandlerResponse,
    aux: A,
  ) => {
    // do nothing
  };
}