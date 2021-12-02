import * as AWS from 'aws-sdk';
import { SimpleAWSConfig } from './config';
import { S3SignedUrlParams, S3SignedUrlResult, SQSMessageBody } from './define';
export declare class SimpleAWS {
    private queueUrls;
    private config;
    private lazyS3;
    private lazySqs;
    private lazyDynamodb;
    private lazyDynamodbAdmin;
    constructor(config?: SimpleAWSConfig);
    readonly s3: AWS.S3;
    readonly sqs: AWS.SQS;
    readonly dynamodb: AWS.DynamoDB.DocumentClient;
    readonly dynamodbAdmin: AWS.DynamoDB;
    getQueueUrl: (queueName: string) => Promise<string>;
    enqueue: (queueName: string, data: any) => Promise<number>;
    dequeue: <T>(queueName: string, fetchSize?: number, waitSeconds?: number, visibilityTimeout?: number) => Promise<SQSMessageBody<T>[]>;
    dequeueAll: <T>(queueName: string, limitSize?: number, visibilityTimeout?: number) => Promise<SQSMessageBody<T>[]>;
    retainMessage: (queueName: string, handle: string, seconds: number) => Promise<string>;
    completeMessage: (queueName: string, handle: string) => Promise<string>;
    completeMessages: (queueName: string, handles: string[]) => Promise<string[]>;
    download: (bucketName: string, key: string, localPath: string) => Promise<string>;
    upload: (bucketName: string, localPath: string, key: string) => Promise<string>;
    getSignedUrl: (bucketName: string, key: string, operation?: "getObject" | "putObject", params?: S3SignedUrlParams | undefined) => S3SignedUrlResult;
    getSignedCookie: (keyPairId: string, privateKey: string, url: string, expires: number) => AWS.CloudFront.Signer.CustomPolicy;
    getAttachmentUrl: (bucketName: string, key: string, fileName: string, params?: S3SignedUrlParams | undefined) => S3SignedUrlResult;
    getDynamoDbItem: <T>(tableName: string, key: {
        [keyColumn: string]: string;
    }, defaultValue?: T | undefined) => Promise<T | undefined>;
    updateDynamoDbItem: (tableName: string, key: {
        [keyColumn: string]: string;
    }, columnValues: {
        [column: string]: any;
    }) => Promise<import("aws-sdk/lib/request").PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>;
    setupQueue: (queueName: string) => Promise<boolean>;
    setupStorage: (bucketName: string, cors: {
        methods: ("DELETE" | "GET" | "HEAD" | "POST" | "PUT")[];
        origins: string[];
    }) => Promise<boolean>;
    setupDynamoDb: (tableName: string, keyColumn: string) => Promise<boolean>;
}
