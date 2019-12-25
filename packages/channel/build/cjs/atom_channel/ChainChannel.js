"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_helper_1 = require("@bfchain/core-helper");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const core_model_1 = require("@bfchain/core-model");
const protobuf_1 = require("@bfchain/protobuf");
const chainChannelHelper_1 = require("./chainChannelHelper");
const util_1 = require("@bfchain/util");
const { ArgumentFormatException, NoFoundException, error, TimeOutException, } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "ChainChannel");
class ChainChannelBase extends util_1.QueneEventEmitterPro {
}
exports.ChainChannelBase = ChainChannelBase;
/**
 * 为数据收发处理器包装数据处理
 */
let ChainChannel = class ChainChannel extends ChainChannelBase {
    constructor(endpoint) {
        super();
        this.endpoint = endpoint;
        /**对方节点可能的高度 */
        this.mayby_height = 1;
        /**存储延迟的历史记录 */
        this._delay_histroy_list = new Float32Array(32);
        /**请求的响应回调缓存 */
        this.req_response_map = new Map();
        /**请求ID累加器 */
        this._req_id_acc = new Uint32Array(1); // 使用Uint32类型，在超过过2**32后自动归零
        this.initOnMessage();
    }
    onClose(handler, once) {
        if (once) {
            const remover = this.endpoint.onClose(err => {
                handler(err);
                remover();
            });
            return remover;
        }
        else {
            return this.endpoint.onClose(handler);
        }
    }
    /**关闭双工连接 */
    close(reason) {
        return this.endpoint.close(reason);
    }
    get delay() {
        const { _delay_histroy_list } = this;
        var acc_delay = 0;
        let len = _delay_histroy_list.length;
        for (var i = 0; i < _delay_histroy_list.length; i += 1) {
            var _d = _delay_histroy_list[i];
            if (_d) {
                acc_delay += _d;
            }
            else {
                len -= 1;
            }
        }
        return acc_delay / len;
    }
    /**存储延迟记录 */
    pushDelayHistroy(delay) {
        const { _delay_histroy_list } = this;
        const LEN = _delay_histroy_list.length;
        // 列表左移动一位
        _delay_histroy_list.set(_delay_histroy_list.subarray(1, LEN), 0);
        // 将新的数据放置到最后
        _delay_histroy_list[LEN - 1] = delay;
    }
    _request(cmd, data, ResonseBoxer, options) {
        return this._requestWithBinaryData(cmd, this._requestDataToBinary(data), ResonseBoxer, options);
    }
    _requestDataToBinary(data) {
        return new Uint8Array(data.constructor.encode(data).finish());
    }
    async _requestWithBinaryData(cmd, binary, ResonseBoxer, options) {
        const req_id = this._req_id_acc[0]++;
        this.postResponseMessage(req_id, cmd, binary);
        const req_task = new util_1.PromiseOut();
        if (options && this.baseHelper.isPositiveFloatNotContainZero(options.timeout)) {
            const timeoutTask = util_1.sleep(options.timeout, () => {
                req_task.reject(new TimeOutException(`Chain Channel Timeout, cmd:{cmd}, binary:{binary}`, {
                    endpoint: this.endpoint,
                    cmd: core_model_1.DUPLEX_API_CMD[cmd],
                    binary,
                }));
            });
            req_task.promise.finally(() => {
                util_1.unsleep(timeoutTask);
            });
        }
        this.req_response_map.set(req_id, req_task);
        const res = await req_task.promise;
        return ResonseBoxer(res);
    }
    /**发送响应数据 */
    postResponseMessage(req_id, cmd, binary) {
        return this.endpoint.postMessage(core_model_1.ResponseModel.encode(core_model_1.ResponseModel.fromObject({
            version: this.config.version,
            req_id,
            cmd,
            binary,
        })).finish());
    }
    /**查询交易 */
    queryTransactions(query, sort, opts) {
        const arg = core_model_1.QueryTransactionArgModel.fromObject({
            query: core_model_1.TransactionQueryOptions.fromObject(query),
            sort: core_model_1.TransactionSortOptions.fromObject(sort || {}),
        });
        return this._request(core_model_1.DUPLEX_API_CMD.QUERY_TRANSACTION, arg, this.chainChannelHelper.boxQueryTransactionReturn, opts);
    }
    initBroadcastTransactionArg(transaction, opts = {}) {
        const arg = core_model_1.NewTransactionArgModel.fromObject({
            transaction: transaction instanceof protobuf_1.Message
                ? transaction
                : this.transactionCore.recombineTransaction(transaction),
            grabSecret: opts.grabSecret,
        });
        return [
            core_model_1.DUPLEX_API_CMD.NEW_TRANSACTION,
            this._requestDataToBinary(arg),
            this.chainChannelHelper.boxNewTransactionReturn,
            opts,
        ];
    }
    /**广播交易体 */
    async broadcastTransaction(transaction, opts) {
        return this._requestWithBinaryData(...this.initBroadcastTransactionArg(transaction, opts));
    }
    /**查询区块 */
    queryBlock(query, opts) {
        const arg = core_model_1.QueryBlockArgModel.fromObject({
            query: core_model_1.BlockQueryOptionsModel.fromObject(query),
        });
        return this._request(core_model_1.DUPLEX_API_CMD.QUERY_BLOCK, arg, this.chainChannelHelper.boxQueryBlockReturn, opts);
    }
    async findBlock(...args) {
        const queryResult = await this.queryBlock(...args);
        return queryResult.someBlock && queryResult.someBlock.block;
    }
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(blockInfo, opts) {
        const arg = core_model_1.NewBlockArgModel.fromObject(blockInfo);
        arg.generatorPublicKey = blockInfo.generatorPublicKey;
        return [
            core_model_1.DUPLEX_API_CMD.NEW_BLOCK,
            this._requestDataToBinary(arg),
            this.chainChannelHelper.boxNewBlockReturn,
            opts,
        ];
    }
    /**广播区块 */
    broadcastBlock(blockInfo, opts) {
        return this._requestWithBinaryData(...this.initBroadcastBlockArg(blockInfo, opts));
    }
    /**获取节点信息 的传播参数 */
    initGetPeerInfoArg(uid, opts) {
        const arg = core_model_1.GetPeerInfoArgModel.fromObject({ uid });
        return [
            core_model_1.DUPLEX_API_CMD.GET_PEER_INFO,
            this._requestDataToBinary(arg),
            this.chainChannelHelper.boxGetPeerInfoReturn,
            opts,
        ];
    }
    /**获取节点信息
     * 顺带统计延迟
     */
    async getPeerInfo(uid, opts) {
        /**
         * 这里是要要计算延迟,所以不需要用`this.timeHelper.now()`
         */
        const start_time = Date.now();
        const res = await this._requestWithBinaryData(...this.initGetPeerInfoArg(uid, opts));
        this.pushDelayHistroy(Date.now() - start_time);
        return res;
    }
    /**处理接收到数据时的响应 */
    initOnMessage() {
        this.endpoint.onMessage(async (message) => {
            /* 测试了socket-io：
             * 使用client发送ArrayBuffer后，nodejs中server接收到的是Buffer。
             * 使用server发送ArrayBuffer，nodejs中client接收到的是Buffer，browser中client接收到的是ArrayBuffer
             * 其中 Buffer instanceof Uint8Array
             */
            try {
                let req_id;
                let cmd;
                let binary;
                try {
                    const msg = core_model_1.ResponseModel.decode(message);
                    req_id = msg.req_id;
                    cmd = msg.cmd;
                    binary = msg.binary;
                }
                catch {
                    throw new ArgumentFormatException("message type error");
                }
                /**通用的响应对象 */
                let taskResult;
                const commonHandle = (response, err) => {
                    response.status = core_model_1.RESPONSE_STATUS.error;
                    response.error = core_model_1.ErrorMessage.fromException(err);
                    return response;
                };
                try {
                    switch (cmd) {
                        /// 查询交易
                        case core_model_1.DUPLEX_API_CMD.QUERY_TRANSACTION: {
                            /**查询交易的响应，默认为繁忙 */
                            const response = core_model_1.QueryTransactionReturnModel.fromObject({
                                status: core_model_1.RESPONSE_STATUS.busy,
                            });
                            // 发送查询任务
                            const queryResult = this.has("onQueryTransaction")
                                ? await this.emit("onQueryTransaction", this.chainChannelHelper.boxQueryTransactionArg(binary))
                                : undefined;
                            /// 查询成功
                            if (queryResult) {
                                response.status = core_model_1.RESPONSE_STATUS.success;
                                response.transactions = queryResult.transactions.map(tib => core_model_1.TransactionInBlock.fromObject(tib));
                            }
                            // 绑定返回结果
                            taskResult = response;
                            break;
                        }
                        /// 广播交易
                        case core_model_1.DUPLEX_API_CMD.NEW_TRANSACTION: {
                            /**广播交易的响应，默认为繁忙 */
                            const response = core_model_1.NewTransactionReturnModel.fromObject({
                                status: core_model_1.RESPONSE_STATUS.busy,
                            });
                            const broadcastResult = this.has("onNewTransaction")
                                ? await this.emit("onNewTransaction", this.chainChannelHelper.boxNewTransactionArg(binary))
                                : undefined;
                            /// 广播成功
                            if (broadcastResult) {
                                response.status = core_model_1.RESPONSE_STATUS.success;
                                response.minFee = broadcastResult.minFee;
                                response.newTrsStatus = broadcastResult.newTrsStatus;
                                response.refuseReason = broadcastResult.refuseReason;
                            }
                            // 绑定返回结果
                            taskResult = response;
                            break;
                        }
                        /// 查询区块
                        case core_model_1.DUPLEX_API_CMD.QUERY_BLOCK: {
                            /**广播交易的响应，默认为繁忙 */
                            const response = core_model_1.QueryBlockReturnModel.fromObject({
                                status: core_model_1.RESPONSE_STATUS.busy,
                            });
                            const queryResult = this.has("onQueryBlock")
                                ? await this.emit("onQueryBlock", this.chainChannelHelper.boxQueryBlockArg(binary))
                                : undefined;
                            /// 查询成功
                            if (queryResult && queryResult.block) {
                                response.status = core_model_1.RESPONSE_STATUS.success;
                                const block = queryResult.block;
                                // 强制不传输交易
                                block.transactions = [];
                                response.someBlock = core_model_1.SomeBlockModel.fromObject({
                                    block: core_model_1.Block.fromObject(block),
                                });
                            }
                            taskResult = response;
                            break;
                        }
                        /// 广播区块
                        case core_model_1.DUPLEX_API_CMD.NEW_BLOCK: {
                            /**广播区块的响应，默认为繁忙 */
                            const response = core_model_1.NewBlockReturn.fromObject({
                                status: core_model_1.RESPONSE_STATUS.busy,
                            });
                            const newBlockArg = this.chainChannelHelper.boxNewBlockArg(binary);
                            // 将节点广播过来的区块高度进行缓存
                            this.mayby_height = newBlockArg.height;
                            const broadcastResult = this.has("onNewBlock")
                                ? await this.emit("onNewBlock", newBlockArg)
                                : undefined;
                            /// 广播成功
                            if (broadcastResult) {
                                response.status = core_model_1.RESPONSE_STATUS.success;
                            }
                            taskResult = response;
                            break;
                        }
                        /// 节点信息
                        case core_model_1.DUPLEX_API_CMD.GET_PEER_INFO: {
                            /**节点信息的响应，默认为繁忙 */
                            const response = core_model_1.GetPeerInfoReturnModel.fromObject({
                                status: core_model_1.RESPONSE_STATUS.busy,
                            });
                            const infoResult = this.has("onGetPeerInfo")
                                ? await this.emit("onGetPeerInfo", this.chainChannelHelper.boxGetPeerInfoArg(binary))
                                : undefined;
                            /// 获取成功
                            if (infoResult && infoResult.peerInfo) {
                                response.status = core_model_1.RESPONSE_STATUS.success;
                                response.peerInfo = core_model_1.PeerInfoModel.fromObject(infoResult.peerInfo);
                            }
                            taskResult = response;
                            break;
                        }
                        /// 响应信息
                        case core_model_1.DUPLEX_API_CMD.RESPONSE: {
                            const task = this.req_response_map.get(req_id);
                            if (!task) {
                                error(new NoFoundException("onMessage get invalid req_id", {
                                    req_id,
                                }));
                                return;
                            }
                            this.req_response_map.delete(req_id);
                            task.resolve(binary);
                            // let exception: Exception | undefined;
                            // if (data) {
                            //   if (data.status === RESPONSE_STATUS.busy) {
                            //     exception = new BusyException("peer in busy status", data);
                            //   } else if (data.stauts === RESPONSE_STATUS.error) {
                            //     exception = new ResponseException("peer response error", data);
                            //   }
                            // }
                            break;
                        }
                        default: {
                            throw new ArgumentFormatException("invalid message cmd", { cmd });
                        }
                    }
                }
                catch (error) {
                    const errorResponse = commonHandle(core_model_1.CommonResponse.fromObject({
                        status: core_model_1.RESPONSE_STATUS.error,
                    }), error);
                    this.postResponseMessage(req_id, core_model_1.DUPLEX_API_CMD.RESPONSE, core_model_1.CommonResponse.encode(errorResponse).finish());
                    // 继续向外抛出错误
                    throw error;
                }
                if (taskResult) {
                    this.postResponseMessage(req_id, core_model_1.DUPLEX_API_CMD.RESPONSE, 
                    // 将对象解析成二进制进行传输
                    taskResult.constructor.encode(taskResult).finish());
                }
            }
            catch (err) {
                this.emit("handleMessageError", err);
            }
        });
    }
};
__decorate([
    util_1.Inject("bfchain-core:TransactionCore"),
    __metadata("design:type", Object)
], ChainChannel.prototype, "transactionCore", void 0);
__decorate([
    util_1.Inject(chainChannelHelper_1.ChainChannelHelper),
    __metadata("design:type", chainChannelHelper_1.ChainChannelHelper)
], ChainChannel.prototype, "chainChannelHelper", void 0);
__decorate([
    util_1.Inject(core_helper_1.ConfigHelper),
    __metadata("design:type", core_helper_1.ConfigHelper)
], ChainChannel.prototype, "config", void 0);
__decorate([
    util_1.Inject(core_helper_1.BaseHelper),
    __metadata("design:type", core_helper_1.BaseHelper)
], ChainChannel.prototype, "baseHelper", void 0);
__decorate([
    util_1.Inject(core_helper_1.ChainTimeHelper),
    __metadata("design:type", core_helper_1.ChainTimeHelper)
], ChainChannel.prototype, "timeHelper", void 0);
ChainChannel = __decorate([
    __param(0, util_1.Inject(core_model_1.CHANNEL_ARGS.ENDPOINT)),
    __metadata("design:paramtypes", [Object])
], ChainChannel);
exports.ChainChannel = ChainChannel;
//# sourceMappingURL=ChainChannel.js.map