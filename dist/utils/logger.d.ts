export declare enum LogLevel {
    Error = "error",
    Warn = "warn",
    Info = "info",
    Debug = "debug",
    Verbose = "verbose",
    Silly = "silly",
    Stupid = "stupid"
}
export declare const currentLogLevel: LogLevel;
declare type LogMessage = string | Error;
export declare class Logger {
    private name;
    private severity;
    constructor(name: string, level?: LogLevel);
    log: (level: LogLevel, message: LogMessage) => LogMessage;
    error: (message: LogMessage) => LogMessage;
    warn: (message: LogMessage) => LogMessage;
    info: (message: LogMessage) => LogMessage;
    debug: (message: LogMessage) => LogMessage;
    verbose: (message: LogMessage) => LogMessage;
    silly: (message: LogMessage) => LogMessage;
    stupid: <T>(message: string, object: T, replacer?: ((key: string, value: T) => T) | undefined) => T;
}
export declare const getLogger: (fileName: string, level?: LogLevel | undefined) => Logger;
export {};
