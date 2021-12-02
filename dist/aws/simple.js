"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk"); // tslint:disable-line
var fs = require("fs");
var utils_1 = require("../utils");
var config_1 = require("./config");
var define_1 = require("./define");
var logger = utils_1.getLogger(__filename);
var SimpleAWS = /** @class */ (function () {
    function SimpleAWS(config) {
        var _this = this;
        this.getQueueUrl = function (queueName) { return __awaiter(_this, void 0, void 0, function () {
            var urlResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.queueUrls[queueName] !== undefined) {
                            return [2 /*return*/, this.queueUrls[queueName]];
                        }
                        return [4 /*yield*/, this.sqs
                                .getQueueUrl({
                                QueueName: queueName,
                            })
                                .promise()];
                    case 1:
                        urlResult = _a.sent();
                        logger.stupid("urlResult", urlResult);
                        if (!urlResult.QueueUrl) {
                            throw new Error("No queue url with name[" + queueName + "]");
                        }
                        return [2 /*return*/, (this.queueUrls[queueName] = urlResult.QueueUrl)];
                }
            });
        }); };
        this.enqueue = function (queueName, data) { return __awaiter(_this, void 0, void 0, function () {
            var queueUrl, sendResult, attrResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Send message[" + data.key + "] to queue.");
                        logger.stupid("data", data);
                        return [4 /*yield*/, this.getQueueUrl(queueName)];
                    case 1:
                        queueUrl = _a.sent();
                        return [4 /*yield*/, this.sqs
                                .sendMessage({
                                QueueUrl: queueUrl,
                                MessageBody: JSON.stringify(data),
                                DelaySeconds: 0,
                            })
                                .promise()];
                    case 2:
                        sendResult = _a.sent();
                        logger.stupid("sendResult", sendResult);
                        return [4 /*yield*/, this.sqs
                                .getQueueAttributes({
                                QueueUrl: queueUrl,
                                AttributeNames: ['ApproximateNumberOfMessages'],
                            })
                                .promise()];
                    case 3:
                        attrResult = _a.sent();
                        logger.stupid("attrResult", attrResult);
                        if (!attrResult.Attributes) {
                            return [2 /*return*/, 0];
                        }
                        return [2 /*return*/, +attrResult.Attributes.ApproximateNumberOfMessages];
                }
            });
        }); };
        this.dequeue = function (queueName, fetchSize, waitSeconds, visibilityTimeout) {
            if (fetchSize === void 0) { fetchSize = 1; }
            if (waitSeconds === void 0) { waitSeconds = 1; }
            if (visibilityTimeout === void 0) { visibilityTimeout = 15; }
            return __awaiter(_this, void 0, void 0, function () {
                var queueUrl, receiveResult, data, _i, _a, each, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            logger.debug("Receive message from queue[" + queueName + "].");
                            return [4 /*yield*/, this.getQueueUrl(queueName)];
                        case 1:
                            queueUrl = _b.sent();
                            return [4 /*yield*/, this.sqs
                                    .receiveMessage({
                                    QueueUrl: queueUrl,
                                    MaxNumberOfMessages: fetchSize,
                                    WaitTimeSeconds: waitSeconds,
                                    VisibilityTimeout: visibilityTimeout,
                                })
                                    .promise()];
                        case 2:
                            receiveResult = _b.sent();
                            logger.stupid("receiveResult", receiveResult);
                            if (receiveResult.Messages === undefined ||
                                receiveResult.Messages.length === 0) {
                                return [2 /*return*/, []];
                            }
                            data = [];
                            for (_i = 0, _a = receiveResult.Messages; _i < _a.length; _i++) {
                                each = _a[_i];
                                if (!each.ReceiptHandle) {
                                    logger.warn("No receipt handler: " + JSON.stringify(each));
                                    continue;
                                }
                                message = {
                                    handle: each.ReceiptHandle,
                                    body: each.Body ? JSON.parse(each.Body) : undefined,
                                };
                                data.push(message);
                            }
                            logger.verbose("Receive a message[" + JSON.stringify(data) + "] from queue");
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        this.dequeueAll = function (queueName, limitSize, visibilityTimeout) {
            if (limitSize === void 0) { limitSize = Number.MAX_VALUE; }
            if (visibilityTimeout === void 0) { visibilityTimeout = 15; }
            return __awaiter(_this, void 0, void 0, function () {
                var messages, maxFetchSize, eachOfMessages, _i, eachOfMessages_1, each;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            messages = [];
                            maxFetchSize = 10;
                            _a.label = 1;
                        case 1:
                            if (!(messages.length < limitSize)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.dequeue(queueName, Math.min(limitSize - messages.length, maxFetchSize), 0, visibilityTimeout)];
                        case 2:
                            eachOfMessages = _a.sent();
                            if (!eachOfMessages || eachOfMessages.length === 0) {
                                return [3 /*break*/, 3];
                            }
                            for (_i = 0, eachOfMessages_1 = eachOfMessages; _i < eachOfMessages_1.length; _i++) {
                                each = eachOfMessages_1[_i];
                                messages.push(each);
                            }
                            return [3 /*break*/, 1];
                        case 3:
                            logger.stupid("messages", messages);
                            return [2 /*return*/, messages];
                    }
                });
            });
        };
        this.retainMessage = function (queueName, handle, seconds) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            logger.debug("Change visibilityTimeout of " + handle + " to " + seconds + "secs.");
                            this.getQueueUrl(queueName)
                                .then(function (queueUrl) {
                                _this.sqs.changeMessageVisibility({
                                    QueueUrl: queueUrl,
                                    ReceiptHandle: handle,
                                    VisibilityTimeout: seconds,
                                }, function (err, changeResult) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        logger.stupid("changeResult", changeResult);
                                        resolve(handle);
                                    }
                                });
                            })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        }); };
        this.completeMessage = function (queueName, handle) { return __awaiter(_this, void 0, void 0, function () {
            var queueUrl, deleteResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Complete a message with handle[" + handle + "]");
                        return [4 /*yield*/, this.getQueueUrl(queueName)];
                    case 1:
                        queueUrl = _a.sent();
                        return [4 /*yield*/, this.sqs
                                .deleteMessage({
                                QueueUrl: queueUrl,
                                ReceiptHandle: handle,
                            })
                                .promise()];
                    case 2:
                        deleteResult = _a.sent();
                        logger.stupid("deleteResult", deleteResult);
                        return [2 /*return*/, handle];
                }
            });
        }); };
        this.completeMessages = function (queueName, handles) { return __awaiter(_this, void 0, void 0, function () {
            var chunkSize, index, start, end, sublist, queueUrl, deletesResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Complete a message with handle[" + handles + "]");
                        if (!handles) {
                            return [2 /*return*/, handles];
                        }
                        chunkSize = 10;
                        index = 0;
                        start = 0;
                        _a.label = 1;
                    case 1:
                        if (!(start < handles.length)) return [3 /*break*/, 5];
                        end = Math.min(start + chunkSize, handles.length);
                        sublist = handles.slice(start, end);
                        return [4 /*yield*/, this.getQueueUrl(queueName)];
                    case 2:
                        queueUrl = _a.sent();
                        return [4 /*yield*/, this.sqs
                                .deleteMessageBatch({
                                QueueUrl: queueUrl,
                                Entries: sublist.map(function (handle) { return ({
                                    Id: (++index).toString(),
                                    ReceiptHandle: handle,
                                }); }),
                            })
                                .promise()];
                    case 3:
                        deletesResult = _a.sent();
                        logger.stupid("deleteResult", deletesResult);
                        _a.label = 4;
                    case 4:
                        start += chunkSize;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, handles];
                }
            });
        }); };
        this.download = function (bucketName, key, localPath) { return __awaiter(_this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                logger.debug("Get a stream of item[" + key + "] from bucket[" + bucketName + "]");
                stream = this.s3
                    .getObject({
                    Bucket: bucketName,
                    Key: key,
                })
                    .createReadStream();
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        return stream
                            .pipe(fs.createWriteStream(localPath))
                            .on('finish', function () { return resolve(localPath); })
                            .on('error', function (error) { return reject(error); });
                    })];
            });
        }); };
        this.upload = function (bucketName, localPath, key) { return __awaiter(_this, void 0, void 0, function () {
            var putResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Upload item[" + key + "] into bucket[" + bucketName + "]");
                        return [4 /*yield*/, this.s3
                                .upload({
                                Bucket: bucketName,
                                Key: key,
                                Body: fs.createReadStream(localPath),
                            })
                                .promise()];
                    case 1:
                        putResult = _a.sent();
                        logger.stupid("putResult", putResult);
                        return [2 /*return*/, key];
                }
            });
        }); };
        this.getSignedUrl = function (bucketName, key, operation, params) {
            if (operation === void 0) { operation = 'getObject'; }
            return {
                key: key,
                url: _this.s3.getSignedUrl(operation, __assign({ Bucket: bucketName, Key: key, Expires: 60 * 10 }, (params || {}))),
            };
        };
        this.getSignedCookie = function (keyPairId, privateKey, url, expires) {
            var signer = new AWS.CloudFront.Signer(keyPairId, privateKey);
            var policy = {
                Statement: [
                    {
                        Resource: url,
                        Condition: {
                            DateLessThan: { 'AWS:EpochTime': expires },
                        },
                    },
                ],
            };
            var ret = signer.getSignedCookie({ policy: JSON.stringify(policy) });
            return ret;
        };
        this.getAttachmentUrl = function (bucketName, key, fileName, params) {
            return _this.getSignedUrl(bucketName, key, 'getObject', __assign({}, params, { ResponseContentDisposition: "attachment; filename=\"" + fileName + "\"" }));
        };
        this.getDynamoDbItem = function (tableName, key, defaultValue) { return __awaiter(_this, void 0, void 0, function () {
            var getResult, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Read an item with key[" + JSON.stringify(key) + "] from " + tableName + ".");
                        return [4 /*yield*/, this.dynamodb
                                .get({
                                TableName: tableName,
                                Key: key,
                            })
                                .promise()];
                    case 1:
                        getResult = _a.sent();
                        logger.stupid("getResult", getResult);
                        item = getResult !== undefined && getResult.Item !== undefined
                            ? getResult.Item // Casts forcefully.
                            : defaultValue;
                        logger.stupid("item", item);
                        return [2 /*return*/, item];
                }
            });
        }); };
        this.updateDynamoDbItem = function (tableName, key, columnValues) { return __awaiter(_this, void 0, void 0, function () {
            var expressions, attributeValues, updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("Update an item with key[" + JSON.stringify(key) + "] to " + tableName);
                        logger.stupid("keyValues", columnValues);
                        expressions = Object.keys(columnValues)
                            .map(function (column) { return column + " = :" + column; })
                            .join(', ');
                        attributeValues = Object.keys(columnValues)
                            .map(function (column) { return [":" + column, columnValues[column]]; })
                            .reduce(function (obj, pair) {
                            var _a;
                            return (__assign({}, obj, (_a = {}, _a[pair[0]] = pair[1], _a)));
                        }, {});
                        logger.stupid("expressions", expressions);
                        logger.stupid("attributeValues", attributeValues);
                        return [4 /*yield*/, this.dynamodb
                                .update({
                                TableName: tableName,
                                Key: key,
                                UpdateExpression: "set " + expressions,
                                ExpressionAttributeValues: attributeValues,
                            })
                                .promise()];
                    case 1:
                        updateResult = _a.sent();
                        logger.stupid("updateResult", updateResult);
                        return [2 /*return*/, updateResult];
                }
            });
        }); };
        // Setup
        this.setupQueue = function (queueName) { return __awaiter(_this, void 0, void 0, function () {
            var listResult, _i, _a, queueUrl, error_1, createResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sqs
                                .listQueues({
                                QueueNamePrefix: queueName,
                            })
                                .promise()];
                    case 1:
                        listResult = _b.sent();
                        if (listResult.QueueUrls) {
                            for (_i = 0, _a = listResult.QueueUrls; _i < _a.length; _i++) {
                                queueUrl = _a[_i];
                                if (queueUrl.endsWith(queueName)) {
                                    logger.debug("Queue[" + queueName + " => " + queueUrl + "] already exists.");
                                    return [2 /*return*/, true];
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger.debug("No Queue[" + queueName + "] exists due to " + error_1);
                        return [3 /*break*/, 3];
                    case 3:
                        logger.debug("Create a queue[" + queueName + "] newly.");
                        return [4 /*yield*/, this.sqs
                                .createQueue({
                                QueueName: queueName,
                            })
                                .promise()];
                    case 4:
                        createResult = _b.sent();
                        logger.stupid("createResult", createResult);
                        return [2 /*return*/, true];
                }
            });
        }); };
        this.setupStorage = function (bucketName, cors) { return __awaiter(_this, void 0, void 0, function () {
            var listResult, error_2, createResult, corsResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.s3.listBuckets().promise()];
                    case 1:
                        listResult = _a.sent();
                        if (listResult.Buckets &&
                            listResult.Buckets.map(function (each) { return each.Name; }).includes(bucketName)) {
                            logger.debug("Bucket[" + bucketName + "] already exists.");
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger.debug("No bucket[" + bucketName + "] exists due to " + error_2);
                        return [3 /*break*/, 3];
                    case 3:
                        logger.debug("Create a bucket[" + bucketName + "] newly.");
                        return [4 /*yield*/, this.s3
                                .createBucket({
                                Bucket: bucketName,
                            })
                                .promise()];
                    case 4:
                        createResult = _a.sent();
                        logger.stupid("createResult", createResult);
                        if (!cors) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.s3
                                .putBucketCors({
                                Bucket: bucketName,
                                CORSConfiguration: {
                                    CORSRules: [
                                        {
                                            AllowedHeaders: ['*'],
                                            AllowedMethods: cors.methods,
                                            AllowedOrigins: cors.origins,
                                        },
                                    ],
                                },
                            })
                                .promise()];
                    case 5:
                        corsResult = _a.sent();
                        logger.stupid("corsResult", corsResult);
                        _a.label = 6;
                    case 6: return [2 /*return*/, true];
                }
            });
        }); };
        this.setupDynamoDb = function (tableName, keyColumn) { return __awaiter(_this, void 0, void 0, function () {
            var listResult, error_3, createResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.dynamodbAdmin.listTables().promise()];
                    case 1:
                        listResult = _a.sent();
                        if (listResult.TableNames && listResult.TableNames.includes(tableName)) {
                            logger.debug("Table[" + tableName + "] already exists.");
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger.debug("No table[" + tableName + "] exists due to " + error_3);
                        return [3 /*break*/, 3];
                    case 3:
                        logger.debug("Create a table[" + tableName + "] newly.");
                        return [4 /*yield*/, this.dynamodbAdmin
                                .createTable({
                                TableName: tableName,
                                KeySchema: [{ AttributeName: keyColumn, KeyType: 'HASH' }],
                                AttributeDefinitions: [
                                    { AttributeName: keyColumn, AttributeType: 'S' },
                                ],
                                ProvisionedThroughput: {
                                    ReadCapacityUnits: 30,
                                    WriteCapacityUnits: 10,
                                },
                            })
                                .promise()];
                    case 4:
                        createResult = _a.sent();
                        logger.stupid("createResult", createResult);
                        return [2 /*return*/, true];
                }
            });
        }); };
        this.config = config || new config_1.SimpleAWSConfig();
        /**
         * The simple cache for { queueName: queueUrl }.
         * It can help in the only case of launching this project as offline.
         * @type { { [queueName: string]: string } }
         */
        this.queueUrls = {};
    }
    Object.defineProperty(SimpleAWS.prototype, "s3", {
        get: function () {
            if (this.lazyS3 === undefined) {
                this.lazyS3 = new AWS.S3(this.config.get(define_1.AWSComponent.s3));
            }
            return this.lazyS3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleAWS.prototype, "sqs", {
        get: function () {
            if (this.lazySqs === undefined) {
                this.lazySqs = new AWS.SQS(this.config.get(define_1.AWSComponent.sqs));
            }
            return this.lazySqs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleAWS.prototype, "dynamodb", {
        get: function () {
            if (this.lazyDynamodb === undefined) {
                this.lazyDynamodb = new AWS.DynamoDB.DocumentClient(this.config.get(define_1.AWSComponent.dynamodb));
            }
            return this.lazyDynamodb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleAWS.prototype, "dynamodbAdmin", {
        get: function () {
            if (this.lazyDynamodbAdmin === undefined) {
                this.lazyDynamodbAdmin = new AWS.DynamoDB(this.config.get(define_1.AWSComponent.dynamodb));
            }
            return this.lazyDynamodbAdmin;
        },
        enumerable: true,
        configurable: true
    });
    return SimpleAWS;
}());
exports.SimpleAWS = SimpleAWS;
