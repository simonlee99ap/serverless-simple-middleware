"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var simple_staging_1 = require("simple-staging");
var ts_enum_util_1 = require("ts-enum-util");
var misc_1 = require("./misc");
var LogLevel;
(function (LogLevel) {
    LogLevel["Error"] = "error";
    LogLevel["Warn"] = "warn";
    LogLevel["Info"] = "info";
    LogLevel["Debug"] = "debug";
    LogLevel["Verbose"] = "verbose";
    LogLevel["Silly"] = "silly";
    LogLevel["Stupid"] = "stupid";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var severity = function (level) {
    switch (level) {
        case LogLevel.Error:
            return 100;
        case LogLevel.Warn:
            return 200;
        case LogLevel.Info:
            return 300;
        case LogLevel.Debug:
            return 400;
        case LogLevel.Verbose:
            return 500;
        case LogLevel.Silly:
            return 600;
        case LogLevel.Stupid:
            return 700;
        default:
            return 1000;
    }
};
exports.currentLogLevel = ts_enum_util_1.$enum(LogLevel).asValueOrDefault(process.env.LOG_LEVEL, simple_staging_1.envDefault.level !== simple_staging_1.StagingLevel.Release
    ? LogLevel.Verbose
    : LogLevel.Debug);
var Logger = /** @class */ (function () {
    function Logger(name, level) {
        var _this = this;
        if (level === void 0) { level = exports.currentLogLevel; }
        this.log = function (level, message) {
            if (_this.severity >= severity(level)) {
                console.log("[" + new Date().toISOString() + "][" + level.toUpperCase() + "][" + _this.name + "] " + (message instanceof Error ? misc_1.stringifyError(message) : message));
            }
            return message;
        };
        this.error = function (message) { return _this.log(LogLevel.Error, message); };
        this.warn = function (message) { return _this.log(LogLevel.Warn, message); };
        this.info = function (message) { return _this.log(LogLevel.Info, message); };
        this.debug = function (message) { return _this.log(LogLevel.Debug, message); };
        this.verbose = function (message) { return _this.log(LogLevel.Verbose, message); };
        this.silly = function (message) { return _this.log(LogLevel.Silly, message); };
        this.stupid = function (message, object, replacer) {
            _this.log(LogLevel.Stupid, message + ": " + JSON.stringify(object, replacer));
            return object;
        };
        this.name = name;
        this.severity = severity(level);
    }
    return Logger;
}());
exports.Logger = Logger;
var loggers = {};
exports.getLogger = function (fileName, level) {
    var name = path_1.basename(fileName);
    if (loggers[name] === undefined) {
        loggers[name] = new Logger(name, level);
    }
    return loggers[name];
};
