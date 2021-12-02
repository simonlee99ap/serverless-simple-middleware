"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cross_fetch_1 = require("cross-fetch");
var fs = require("fs");
var SimpleAWSConfig = /** @class */ (function () {
    function SimpleAWSConfig(configs) {
        var _this = this;
        this.get = function (service) {
            return _this.configs ? _this.configs[service] : undefined;
        };
        this.configs = configs;
    }
    return SimpleAWSConfig;
}());
exports.SimpleAWSConfig = SimpleAWSConfig;
exports.loadAWSConfig = function (newConfigsOrUrl) {
    if (typeof newConfigsOrUrl === 'string') {
        if (/^http.*json$/.test(newConfigsOrUrl)) {
            return cross_fetch_1.default(newConfigsOrUrl)
                .then(function (r) { return r.json(); })
                .then(exports.loadAWSConfig);
        }
        else if (/json$/.test(newConfigsOrUrl)) {
            return exports.loadAWSConfig(JSON.parse(fs.readFileSync(newConfigsOrUrl, 'utf-8')));
        }
        return exports.loadAWSConfig(JSON.parse(newConfigsOrUrl));
    }
    return Promise.resolve(new SimpleAWSConfig(newConfigsOrUrl));
};
