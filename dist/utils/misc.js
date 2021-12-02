"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyError = function (err, replacer, space) {
    var plainObject = {};
    Object.getOwnPropertyNames(err).forEach(function (key) {
        plainObject[key] = err[key];
    });
    return JSON.stringify(plainObject, replacer, space);
};
