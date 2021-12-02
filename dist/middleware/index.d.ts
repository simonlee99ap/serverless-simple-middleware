export declare const middleware: {
    build: <Aux extends import("./base").HandlerAuxBase>(plugins: import("./base").HandlerPluginBase<any>[]) => (handler: import("./base").Handler<Aux>) => (event: any, context: any, callback: any) => void;
    aws: (options?: import("./aws").AWSPluginOptions | undefined) => import("./aws").AWSPlugin;
    trace: (options: import("./trace").TracerPluginOptions) => import("./trace").TracerPlugin;
    logger: (options: import("./logger").LoggerPluginOptions) => import("./logger").LoggerPlugin;
    mysql: (options: import("./mysql").MySQLPluginOptions) => import("./mysql").MySQLPlugin;
};
export * from './base';
export * from './aws';
export * from './trace';
export * from './logger';
export * from './mysql';
