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
const util_1 = require("@bfchain/util");
const core_helper_1 = require("@bfchain/core-helper");
const core_model_1 = require("@bfchain/core-model");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const ChainChannel_1 = require("./ChainChannel");
const { ResponseException, AbortException, NoFoundException, error } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "ChainChannelGroup");
exports.CHAIN_CHANNEL_GROUP_ARGS = {
    GROUP_NAME: Symbol("groupName"),
    CHANNEL_LIST: Symbol("channelList"),
    OPTIONS: Symbol("options"),
};
/**
 * 批量双工通讯管理器
 */
let ChainChannelGroup = class ChainChannelGroup extends ChainChannel_1.ChainChannelBase {
    constructor(chainChannelList, groupName = "", opts) {
        super();
        this.groupName = groupName;
        this.chainChannelSet = new Set();
        this.options = {};
        this._parallelTasksMap = new Map();
        /**
         * chainChannel autoRemove When Close ListenerRemover WeakMap
         */
        this._DAWCLWM = new WeakMap();
        if (opts) {
            Object.assign(this.options, opts);
        }
        /**
         * 添加节点并跟随事件
         */
        chainChannelList.forEach(dh => {
            this.addChainChannel_(dh, this.options);
        });
    }
    get size() {
        return this.chainChannelSet.size;
    }
    forEach(hanlder) {
        let i = 0;
        for (const chainChannel of this.chainChannelSet) {
            hanlder(chainChannel, i++);
        }
    }
    include(chainChannel) {
        return this.chainChannelSet.has(chainChannel);
    }
    [Symbol.iterator]() {
        return this.chainChannelSet[Symbol.iterator]();
    }
    /**开始一个节点并发任务 */
    startParallelTask(task_id) {
        const chainChannelList = [...this.chainChannelSet.values()];
        //#region 可用节点的队列管理
        const freeChainChannelList = chainChannelList.slice();
        const busyChainChannelList = [];
        const queneChainChannelList = [];
        /**获取空闲的节点 */
        const getFreeChainChannel = () => {
            const chainChannel = freeChainChannelList.shift();
            if (chainChannel) {
                return chainChannel;
            }
            const waiter = new util_1.PromiseOut();
            queneChainChannelList.push(waiter);
            return waiter.promise;
        };
        /**释放节点到空闲状态 */
        const freeChainChannel = (chainChannel) => {
            const waiter = queneChainChannelList.shift();
            if (waiter) {
                // 如果有等待队列，那么将可用的 handler 给等待队列
                waiter.resolve(chainChannel);
            }
            else {
                // 直接将可用的 handler 放置到空闲队列中
                freeChainChannelList.push(chainChannel);
            }
        };
        /**将节点放入繁忙队列中 */
        const busyChainChannel = (chainChannel) => {
            busyChainChannelList.push(chainChannel);
            if (busyChainChannelList.length > chainChannelList.length / 2) {
                // 如果繁忙的节点已经超过原有可用节点的一半以上了，那么尝试慢慢恢复节点的可用性
                setTimeout(() => {
                    const tryFreeChainChannel = busyChainChannelList.splice(Math.floor(busyChainChannelList.length * Math.random()), 1)[0];
                    freeChainChannel(tryFreeChainChannel);
                }, 1000);
            }
        };
        //#endregion
        this._parallelTasksMap.set(task_id, {
            freeChainChannelList,
            busyChainChannelList,
        });
        return { getFreeChainChannel, freeChainChannel, busyChainChannel };
    }
    /**释放并发任务 */
    releaseParallelTask(task_id) {
        const task = this._parallelTasksMap.get(task_id);
        if (!task) {
            return false;
        }
        this._parallelTasksMap.delete(task_id);
    }
    /**
     * 查询交易
     */
    queryTransactions(query, sort, opts, _resultGenerator) {
        /**异常时重试次数 */
        const RETRY_TIMES = 3;
        const { offset, limit: totalLength, ...baseQueryCondition } = query;
        const limit = totalLength || Infinity;
        const { getFreeChainChannel, freeChainChannel, busyChainChannel } = this.startParallelTask(new Date().toString() + ":" + Math.random().toString());
        const resultGenerator = _resultGenerator || new util_1.AsyncIteratorGenerator();
        /// 在异步任务中进行任务分发
        (async () => {
            /**发往每一台节点的查询数量 */
            const unitLength = 1; //totalLength ? Math.ceil(totalLength / chainChannelList.length) : 1;
            /**所有查询任务的链 */
            let task_chain = Promise.resolve();
            /**是否已经触碰到完结的边界了 */
            let query_done_offset = limit + offset;
            /**
             * 执行任务
             * @param task_offset
             * @param times
             */
            const doTask = async (task_offset, times) => {
                // 获取可用节点
                const chainChannel = await getFreeChainChannel();
                task_chain = task_chain.then(() => 
                // 开始执行查询
                chainChannel
                    .queryTransactions({
                    ...baseQueryCondition,
                    offset: task_offset,
                    limit: unitLength,
                }, sort, opts)
                    .then(res => {
                    if (res.status === core_model_1.RESPONSE_STATUS.success) {
                        // 确认节点的工作，让其继续下一个工作
                        freeChainChannel(chainChannel);
                        if (res.transactions.length === 0) {
                            query_done_offset = task_offset;
                        } /* else if (query_done_offset === task_offset) {
                        throw new ConsensusException("##节点之间有共识异常的问题！");
                      } */
                        else {
                            res.transactions.forEach((trs, i) => {
                                resultGenerator.push(trs, task_offset + i);
                            });
                            // task_result_list[task_offset] = res.transactions[0];
                        }
                    }
                    if (res.status === core_model_1.RESPONSE_STATUS.busy) {
                        // 将这个节点放入繁忙队列，暂时不使用
                        busyChainChannel(chainChannel);
                        // 重试任务，但是这个节点仍旧放在繁忙节点列表，暂时不信任
                        return doTask(task_offset, times + 1);
                    }
                    if (res.status === core_model_1.RESPONSE_STATUS.error) {
                        // 将这个节点放入繁忙队列，暂时不使用
                        busyChainChannel(chainChannel);
                        // 任务失败，抛出异常
                        throw res.error;
                    }
                })
                    .catch(err => {
                    if (AbortException.is(err)) {
                        // 如果被中断了任务，那么直接再次执行任务
                        return doTask(task_offset, times);
                    }
                    error(err, "[GROUP]:", this.groupName, "[QUERY]:", query, "[OFFSET]:", task_offset, "[TIMES]:", times);
                    if (times > RETRY_TIMES) {
                        // 存在异常，重试任务
                        return doTask(task_offset, times + 1);
                    }
                    throw err;
                }));
            };
            /// 分发任务
            for (let i = 0; i < limit; i += unitLength) {
                const task_offset = i + offset;
                if (task_offset >= query_done_offset) {
                    break;
                }
                await doTask(task_offset, 0);
            }
            // 等待所有查询任务完成
            await task_chain;
            // 结束
            resultGenerator.done();
        })().catch(resultGenerator.reject);
        return resultGenerator;
    }
    /**
     * 广播交易体
     */
    async broadcastTransaction(transaction, opts, event) {
        let initedArgs;
        const startTime = this.timeHelper.now();
        const resultList = [];
        try {
            const chainChannelList = [...this.chainChannelSet.values()];
            let is_break = event && (await event.emit("startBroadcasting", { chainChannelList }));
            if (is_break && is_break.break) {
                return;
            }
            const pp = new util_1.ParallelPool(opts && opts.max_parallel_num);
            // 将要广播的节点放置到广播队列中
            for (const chainChannel of chainChannelList) {
                pp.addTaskExecutor(async () => {
                    initedArgs || (initedArgs = chainChannel.initBroadcastTransactionArg(transaction, opts));
                    let is_error = false;
                    let result_or_error;
                    try {
                        result_or_error = await chainChannel._requestWithBinaryData(...initedArgs);
                    }
                    catch (error) {
                        result_or_error = error;
                        is_error = true;
                    }
                    const result = { error: is_error, result: result_or_error, chainChannel };
                    resultList.push({ chainChannel, result });
                    if (event) {
                        /**虽然这里不属于广播的逻辑，但还是await一下 */
                        is_break = await event.emit("broadcasted", result);
                    }
                });
            }
            /// 开始执行并行任务
            for await (var _ of pp.yieldResults({ ignore_error: true })) {
                if (is_break && is_break.break) {
                    break;
                }
            }
        }
        finally {
            const endTime = this.timeHelper.now();
            event && event.emit("endBroadcast", { duraction: endTime - startTime });
        }
        return resultList;
    }
    /**
     * 查询区块
     */
    async queryBlock(...args) {
        const sortedChainChannelList = [...this.chainChannelSet.values()]
            .sort((a, b) => {
            if (b.mayby_height === a.mayby_height) {
                return a.delay - b.delay;
            }
            return b.mayby_height - a.mayby_height;
        })
            .slice(0, 2);
        for (let chainChannel of sortedChainChannelList) {
            try {
                const result = await chainChannel.queryBlock(...args);
                if (result.status === core_model_1.RESPONSE_STATUS.busy) {
                    continue;
                }
                return result;
            }
            catch (err) {
                // TODO: 可能要拉黑这台连接,如果它处理不了合法的请求.看情况,可能这台出现了异常,发生了分叉
                error(err);
                continue;
            }
        }
        throw new ResponseException("queryBlock no peer response");
    }
    async findBlock(...args) {
        const queryResult = await this.queryBlock(...args);
        return queryResult.someBlock && queryResult.someBlock.block;
    }
    /**
     * 广播区块
     */
    async broadcastBlock(...args) {
        let initedArgs;
        return Promise.all([...this.chainChannelSet.values()].map(chainChannel => {
            initedArgs || (initedArgs = chainChannel.initBroadcastBlockArg(...args));
            return {
                chainChannel,
                result: chainChannel._requestWithBinaryData(...initedArgs),
            };
        }));
    }
    async getPeerInfo(...args) {
        let initedArgs;
        const peerInfoResponseList = await Promise.all([...this.chainChannelSet.values()].map(chainChannel => {
            initedArgs || (initedArgs = chainChannel.initGetPeerInfoArg(...args));
            return chainChannel._requestWithBinaryData(...initedArgs);
        }));
        const peerInfoList = [];
        for (const pir of peerInfoResponseList) {
            if (pir.peerInfo) {
                peerInfoList.push(pir.peerInfo);
            }
        }
        let maxHeightPeerInfo = peerInfoList.shift();
        if (maxHeightPeerInfo) {
            for (const pi of peerInfoList) {
                if (pi.height > maxHeightPeerInfo.height) {
                    maxHeightPeerInfo = pi;
                }
            }
        }
        return maxHeightPeerInfo;
    }
    addChainChannel(chainChannel, opts = this.options) {
        if (this.chainChannelSet.has(chainChannel)) {
            return false;
        }
        this.addChainChannel_(chainChannel, opts);
        return true;
    }
    removeChainChannel(chainChannel) {
        chainChannel.offEmit(this._eventFollower);
        const listenerRemover = this._DAWCLWM.get(chainChannel);
        if (listenerRemover) {
            this._DAWCLWM.delete(chainChannel);
            listenerRemover();
        }
        return this.chainChannelSet.delete(chainChannel);
    }
    _eventFollower(data) {
        return this.emit(data.eventname, data.arg);
    }
    addChainChannel_(chainChannel, opts = this.options) {
        this.chainChannelSet.add(chainChannel);
        if (!opts.disableAutoRemove) {
            const listenerRemover = chainChannel.onClose(err => {
                error("channel auto removed in [%s] by:", this.groupName, err);
                this.removeChainChannel(chainChannel);
            });
            this._DAWCLWM.set(chainChannel, listenerRemover);
        }
        chainChannel.onEmit(this._eventFollower);
    }
    destroy() {
        for (const conn of this.chainChannelSet) {
            this.removeChainChannel(conn);
        }
    }
};
__decorate([
    util_1.Inject(core_helper_1.BaseHelper),
    __metadata("design:type", core_helper_1.BaseHelper)
], ChainChannelGroup.prototype, "baseHelper", void 0);
__decorate([
    util_1.Inject(core_helper_1.BaseHelper),
    __metadata("design:type", core_helper_1.ConfigHelper)
], ChainChannelGroup.prototype, "config", void 0);
__decorate([
    util_1.Inject(core_helper_1.ChainTimeHelper),
    __metadata("design:type", core_helper_1.ChainTimeHelper)
], ChainChannelGroup.prototype, "timeHelper", void 0);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChainChannelGroup.prototype, "_eventFollower", null);
ChainChannelGroup = __decorate([
    __param(0, util_1.Inject(exports.CHAIN_CHANNEL_GROUP_ARGS.CHANNEL_LIST)),
    __param(1, util_1.Inject(exports.CHAIN_CHANNEL_GROUP_ARGS.GROUP_NAME, { optional: true })),
    __param(2, util_1.Inject(exports.CHAIN_CHANNEL_GROUP_ARGS.OPTIONS, { optional: true })),
    __metadata("design:paramtypes", [Array, Object, Object])
], ChainChannelGroup);
exports.ChainChannelGroup = ChainChannelGroup;
//# sourceMappingURL=ChainChannelGroup.js.map