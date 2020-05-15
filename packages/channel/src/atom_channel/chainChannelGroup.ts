import {
  AsyncIteratorGenerator,
  bindThis,
  Inject,
  ParallelPool,
  PromiseOut,
  QueneEventEmitter,
  Resolvable,
  cacheGetter,
  EasyWeakMap,
  sleep,
  unsleep,
  EventEmitter,
  AfterInit,
} from "@bfchain/util";
import { BaseHelper, ChainTimeHelper, ConfigHelper } from "@bfchain/core-helper";
import {
  Block,
  CommonBlock,
  PeerInfoModel,
  RESPONSE_STATUS,
  TransactionInBlock,
  NewBlockArgModel,
  NewTransactionReturnModel,
} from "@bfchain/core-model";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { ChainChannel, ChainChannelBase } from "./chainChannel";
const {
  ResponseException,
  AbortException,
  InterruptedException,
  error,
  info,
} = CoreExceptionGenerator("channel", "chainChannelGroup");
export const CHAIN_CHANNEL_GROUP_ARGS = {
  GROUP_NAME: Symbol("groupName"),
  CHANNEL_LIST: Symbol("channelList"),
  OPTIONS: Symbol("options"),
};
/**
 * 批量双工通讯管理器
 */
@Resolvable()
export class ChainChannelGroup<DH extends BFChainCore.ChainChannel = ChainChannel>
  extends ChainChannelBase
  implements BFChainCore.ChainChannelGroup<DH>, AfterInit {
  bfAfterInit() {
    this._initMaybeHeightWatcher();
  }
  @Inject(BaseHelper) protected baseHelper!: BaseHelper;
  @Inject(ConfigHelper) protected config!: ConfigHelper;
  @Inject(ChainTimeHelper) private timeHelper!: ChainTimeHelper;

  protected chainChannelSet = new Set<DH>();
  get size() {
    return this.chainChannelSet.size;
  }
  forEach(hanlder: (chainChannel: DH, i: number) => any) {
    let i = 0;
    for (const chainChannel of this.chainChannelSet) {
      hanlder(chainChannel, i++);
    }
  }
  include(chainChannel: DH) {
    return this.chainChannelSet.has(chainChannel);
  }
  [Symbol.iterator]() {
    return this.chainChannelSet[Symbol.iterator]();
  }

  public options: { disableAutoRemove?: boolean } = {};

  constructor(
    @Inject(CHAIN_CHANNEL_GROUP_ARGS.CHANNEL_LIST) chainChannelList: Iterable<DH>,
    @Inject(CHAIN_CHANNEL_GROUP_ARGS.GROUP_NAME, { optional: true })
    public groupName = "",
    @Inject(CHAIN_CHANNEL_GROUP_ARGS.OPTIONS, { optional: true })
    opts?: Partial<ChainChannelGroup["options"]>,
  ) {
    super();
    if (opts) {
      Object.assign(this.options, opts);
    }

    /**
     * 添加节点并跟随事件
     */
    for (const dh of chainChannelList) {
      this.addChainChannel_(dh, this.options);
    }
  }
  private _parallelTasksMap = new Map<
    string,
    {
      freeChainChannelList: DH[];
      busyChainChannels: Set<DH>;
      tiTasks: Set<Promise<void>>;
      onDestroy: () => unknown;
    }
  >();
  /**节点的工作量 */
  private _workCountWM = new EasyWeakMap<DH, number>((_) => 0);
  /**开始一个节点并发任务 */
  startParallelTask(task_id: string, channelFilter?: BFChainCore.ChannelFilter) {
    const WCWM = this._workCountWM;

    //#region 可用节点的队列管理
    /**空闲节点列表
     * 基于工作量与延迟来进行排序
     */
    const freeChainChannelList = [...this.chainChannelSet.values()]
      .filter(channelFilter ? channelFilter : Boolean)
      .sort((a, b) => a.delay * WCWM.forceGet(a) - b.delay * WCWM.forceGet(b));
    /**繁忙节点列表 */
    const busyChainChannels = new Set<DH>();
    /**请求排队列表 */
    const queneChainChannelList: PromiseOut<DH>[] = [];
    /**定时任务集合 */
    const tiTasks = new Set<Promise<void>>();
    /**是否存在空闲节点 */
    const hasFreeChainChannel = () => {
      return freeChainChannelList.length > 0;
    };
    /**获取空闲的节点 */
    const getFreeChainChannel = () => {
      const chainChannel = freeChainChannelList.shift();
      if (chainChannel) {
        return chainChannel;
      }
      const waiter = new PromiseOut<DH>();
      queneChainChannelList.push(waiter);
      return waiter.promise;
    };
    /**释放节点的繁忙状态 */
    const freeChainChannel = (chainChannel: DH) => {
      /// 标记工作量减少
      WCWM.set(chainChannel, WCWM.forceGet(chainChannel) - 1);
      if (busyChainChannels.delete(chainChannel)) {
        tryAddChainChannelToFree(chainChannel);
        return true;
      }
      return false;
    };
    /// 将节点放入繁忙队列中
    const busyChainChannel = (chainChannel: DH) => {
      /// 标记工作量增加
      WCWM.set(chainChannel, WCWM.forceGet(chainChannel) + 1);

      if (busyChainChannels.has(chainChannel)) {
        return false;
      }
      busyChainChannels.add(chainChannel);

      _tryFreeChainChannel();
      return true;
    };
    /**
     * 但繁忙节点增加或者可用节点减少的时候，自动进行释放工作
     */
    const _tryFreeChainChannel = () => {
      if (busyChainChannels.size > freeChainChannelList.length) {
        /// 如果繁忙的节点已经超过原有可用节点的一半以上了，那么尝试慢慢恢复节点的可用性，这里的策略是随机恢复
        const ti = sleep(1000, () => {
          tiTasks.delete(ti);
          /// 随机获取繁忙列表中的一个节点
          let i = Math.floor(busyChainChannels.size * Math.random());
          const iterator = busyChainChannels.values();
          let tryFreeChainChannel: DH | undefined;
          while (i >= 0) {
            tryFreeChainChannel = iterator.next().value;
            i--;
          }
          if (tryFreeChainChannel) {
            freeChainChannel(tryFreeChainChannel);
          }
        });
        tiTasks.add(ti);
      }
    };
    //#endregion

    //#region 监听节点列表的变更

    /**节点可用，尝试分配任务 */
    const tryAddChainChannelToFree = (chainChannel: DH) => {
      const waiter = queneChainChannelList.shift();
      if (waiter) {
        // 如果有等待队列，那么将可用的 handler 给等待队列
        waiter.resolve(chainChannel);
      } else {
        // 直接将可用的 handler 放置到空闲队列中
        freeChainChannelList.push(chainChannel);
      }
    };
    /// 如果有新的节点，那么添加进来
    this.onAddChainChannel(tryAddChainChannelToFree);

    const tryRemoveChainChannelFromList = (chainChannel: DH) => {
      busyChainChannels.delete(chainChannel);
      const index = freeChainChannelList.indexOf(chainChannel);
      index >= 0 && freeChainChannelList.splice(index, 1);
      WCWM.delete(chainChannel);
      _tryFreeChainChannel();
    };
    /// 如果有节点被移除了，那么从列表中移除
    this.onRemoveChainChannel(tryRemoveChainChannelFromList);
    //#endregion
    this._parallelTasksMap.set(task_id, {
      freeChainChannelList,
      busyChainChannels,
      tiTasks,
      onDestroy: () => {
        freeChainChannelList.length = 0;
        busyChainChannels.clear();
        for (const ti of tiTasks) {
          unsleep(ti);
        }
        tiTasks.clear();

        this.offAddChainChannel(tryAddChainChannelToFree);
        this.offRemoveChainChannel(tryRemoveChainChannelFromList);
      },
    });
    return { hasFreeChainChannel, getFreeChainChannel, freeChainChannel, busyChainChannel };
  }
  /**释放并发任务 */
  releaseParallelTask(task_id: string) {
    const task = this._parallelTasksMap.get(task_id);
    if (!task) {
      return false;
    }
    this._parallelTasksMap.delete(task_id);

    task.onDestroy();
  }
  /**
   * 查询交易
   */
  queryTransactions(
    query: BFChainUtil.FirstArgument<DH["queryTransactions"]>,
    sort?: BFChainUtil.SecondArgument<DH["queryTransactions"]>,
    opts?: BFChainUtil.ThirdArgument<DH["queryTransactions"]>,
    _resultGenerator?: AsyncIteratorGenerator<TransactionInBlock>,
  ) {
    /**异常时重试次数 */
    const RETRY_TIMES = 3;
    const { offset, limit: totalLength, ...baseQueryCondition } = query;
    const limit = totalLength || Infinity;

    const parallelTaskId = new Date().toString() + ":" + Math.random().toString();
    const {
      getFreeChainChannel,
      freeChainChannel,
      busyChainChannel,
      hasFreeChainChannel,
    } = this.startParallelTask(parallelTaskId, opts?.channelFilter);

    const resultGenerator = _resultGenerator || new AsyncIteratorGenerator<TransactionInBlock>();
    if (!hasFreeChainChannel()) {
      /// 这里就不去等待了，虽然可以去等节点加入，当没必要
      resultGenerator.done();
      return resultGenerator;
    }

    /// 在异步任务中进行任务分发
    (async () => {
      /**发往每一台节点的查询数量 */
      const unitLength = 1; // totalLength ? Math.ceil(totalLength / chainChannelList.length) : 1;
      /**所有查询任务的链 */
      let task_chain = Promise.resolve();
      /**是否已经触碰到完结的边界了 */
      let query_done_offset = limit + offset;
      /**
       * 执行任务
       * @param task_offset
       * @param times
       */
      const doTask = (task_offset: number, times: number) => {
        // const waitUseableChainChannel = new PromiseOut<void>();
        task_chain = task_chain.then(
          async () => {
            // 获取可用节点
            const chainChannel = await getFreeChainChannel();
            waitUseableChainChannel.resolve();
            // 将这个节点放入繁忙队列，暂时不使用
            busyChainChannel(chainChannel);
            // 开始执行查询
            return chainChannel
              .queryTransactions(
                {
                  ...baseQueryCondition,
                  offset: task_offset,
                  limit: unitLength,
                },
                sort,
                opts,
              )
              .then((res) => {
                if (res.status === RESPONSE_STATUS.success) {
                  // 确认节点的工作，让其继续下一个工作
                  freeChainChannel(chainChannel);
                  if (res.transactions.length === 0) {
                    query_done_offset = task_offset;
                  } else {
                    res.transactions.forEach((trs, i) => {
                      resultGenerator.push(trs, task_offset - offset + i);
                    });
                    // task_result_list[task_offset] = res.transactions[0];
                  }
                }
                if (res.status === RESPONSE_STATUS.busy) {
                  // 重试任务，但是这个节点仍旧放在繁忙节点列表，暂时不信任
                  doTask(task_offset, times + 1);
                  return;
                }
                if (res.status === RESPONSE_STATUS.error) {
                  // 任务失败，抛出异常
                  throw res.error;
                }
              })
              .catch((err) => {
                if (AbortException.is(err)) {
                  // 如果被中断了任务，那么直接再次执行任务
                  doTask(task_offset, times);
                  return;
                }
                error(
                  err,
                  "[GROUP]:",
                  this.groupName,
                  "[QUERY]:",
                  query,
                  "[OFFSET]:",
                  task_offset,
                  "[TIMES]:",
                  times,
                );
                if (times < RETRY_TIMES) {
                  // 存在异常，重试任务
                  doTask(task_offset, times + 1);
                  return;
                }
                throw err;
              });
          },
          (err) => waitUseableChainChannel.reject(err),
        );
        return waitUseableChainChannel.promise;
      };

      let waitUseableChainChannel: PromiseOut<void>;
      /// 分发任务
      for (let i = 0; i < limit; i += unitLength) {
        const task_offset = i + offset;
        if (task_offset >= query_done_offset) {
          break;
        }
        waitUseableChainChannel = new PromiseOut();
        await doTask(task_offset, 0);
      }
      // 等待所有查询任务完成
      await task_chain;
      // 结束
      await resultGenerator.done();
    })()
      .catch(resultGenerator.reject)
      .finally(() => {
        this.releaseParallelTask(parallelTaskId);
      });

    return resultGenerator;
  }
  /**
   * 广播交易体
   */
  async broadcastTransaction(
    transaction: BFChainCore.NewTransactionArgJSON["transaction"],
    opts?: BFChainCore.ChannelRequestOptions & { max_parallel_num?: number },
    event?: QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<DH>>,
  ) {
    let initedArgs:
      | undefined
      | BFChainUtil.PromiseReturnType<ChainChannel["initBroadcastTransactionArg"]>;
    const startTime = this.timeHelper.now();
    const resultList = [] as BFChainCore.BroadcastNewTransactionEvents<DH>["broadcasted"]["in"][];
    try {
      const chainChannelList = [...this.chainChannelSet.values()];
      let is_break = event && (await event.emit("startBroadcasting", { chainChannelList }));
      if (is_break && is_break.break) {
        return [];
      }
      const pp = new ParallelPool<void>(opts && opts.max_parallel_num);
      // 将要广播的节点放置到广播队列中
      for (const chainChannel of chainChannelList) {
        pp.addTaskExecutor(async () => {
          initedArgs ||
            (initedArgs = await chainChannel.initBroadcastTransactionArg(transaction, opts));
          let result: BFChainCore.BroadcastNewTransactionEvents<DH>["broadcasted"]["in"];
          try {
            /// 算出相对事件是否满足条件
            const needWaitTime = -chainChannel.calcDiffTimeToTargetTime(
              this.timeHelper.getTimeByTimestamp(transaction.timestamp),
            );

            if (needWaitTime > 0) {
              await sleep(needWaitTime);
            }
            resultList.push(
              (result = {
                error: false,
                result: await chainChannel._requestWithBinaryData(...initedArgs),
                chainChannel,
              }),
            );
          } catch (error) {
            resultList.push((result = { error: true, result: error, chainChannel }));
          }
          if (event) {
            /**虽然这里不属于广播的逻辑，但还是await一下 */
            is_break = await event.emit("broadcasted", result);
          }
        });
      }
      /// 开始执行并行任务
      for await (const _ of pp.yieldResults({ ignoreError: true })) {
        if (is_break && is_break.break) {
          break;
        }
      }
    } finally {
      const endTime = this.timeHelper.now();
      event && event.emit("endBroadcast", { duraction: endTime - startTime });
    }
    return resultList;
  }
  /**
   * 查询区块
   */
  async queryBlock(...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>) {
    const sortedChainChannelList = [...this.chainChannelSet.values()]
      .sort((a, b) => {
        if (b.maybeHeight === a.maybeHeight) {
          return a.delay - b.delay;
        }
        return b.maybeHeight - a.maybeHeight;
      })
      .slice(0, 2);
    for (const chainChannel of sortedChainChannelList) {
      try {
        const result = await chainChannel.queryBlock(...args);
        if (result.status === RESPONSE_STATUS.busy) {
          continue;
        }
        return result;
      } catch (err) {
        // TODO: 可能要拉黑这台连接,如果它处理不了合法的请求.看情况,可能这台出现了异常,发生了分叉
        error(err);
        continue;
      }
    }
    throw new ResponseException("queryBlock no peer response");
  }
  async findBlock<B extends Block = CommonBlock>(
    ...args: BFChainUtil.AllArgument<ChainChannel["queryBlock"]>
  ) {
    const queryResult = await this.queryBlock(...args);
    return queryResult.someBlock && (queryResult.someBlock.block as B);
  }
  /**
   * 广播区块
   */
  async broadcastBlock(...args: BFChainUtil.AllArgument<ChainChannel["broadcastBlock"]>) {
    let initedArgs: undefined | ReturnType<ChainChannel["initBroadcastBlockArg"]>;
    return Promise.all(
      [...this.chainChannelSet.values()].map((chainChannel) => {
        initedArgs || (initedArgs = chainChannel.initBroadcastBlockArg(...args));
        return {
          chainChannel,
          result: chainChannel._requestWithBinaryData(...initedArgs),
        };
      }),
    );
  }
  /**
   * chainChannel autoRemove When Close ListenerRemover WeakMap
   */
  private _DAWCLWM = new WeakMap<DH, BFChainCore.EventListenerRemover>();
  addChainChannel(chainChannel: DH, opts = this.options) {
    if (this.chainChannelSet.has(chainChannel)) {
      return false;
    }
    this.addChainChannel_(chainChannel, opts);
    this._chainChannelEvents.emit("addChainChannel", chainChannel);
    return true;
  }
  addChainChannels(chainChannels: DH | BFChainCore.ChainChannelGroup<DH>) {
    let ADD = 0;
    let FAIL = 0;
    const ccs = "size" in chainChannels ? chainChannels : [chainChannels];
    for (const cc of ccs) {
      if (this.addChainChannel(cc)) {
        ADD += 1;
      } else {
        FAIL += 1;
      }
    }
    return { ADD, FAIL };
  }
  removeChainChannel(chainChannel: DH) {
    chainChannel.offEmit(this._eventFollower);
    const listenerRemover = this._DAWCLWM.get(chainChannel);
    if (listenerRemover) {
      this._DAWCLWM.delete(chainChannel);
      listenerRemover();
    }
    if (this.chainChannelSet.delete(chainChannel)) {
      this._chainChannelEvents.emit("removeChainChannel", chainChannel);
      return true;
    }
    return false;
  }
  @cacheGetter
  private get _chainChannelEvents() {
    return new EventEmitter<BFChainCore.ChainChannelGroupEventMap<DH>>();
  }

  @cacheGetter
  get onAddChainChannel(): (
    handler: BFChainUtil.MutArgEventHandler<
      BFChainCore.ChainChannelGroupEventMap<DH>["addChainChannel"]
    >,
    opts?: BFChainUtil.EventOptions,
  ) => void {
    return this._chainChannelEvents.on.bind(this._chainChannelEvents, "addChainChannel");
  }
  get offAddChainChannel(): (
    handler: BFChainUtil.MutArgEventHandler<
      BFChainCore.ChainChannelGroupEventMap<DH>["addChainChannel"]
    >,
  ) => void {
    return this._chainChannelEvents.off.bind(this._chainChannelEvents, "addChainChannel");
  }
  @cacheGetter
  get onRemoveChainChannel(): (
    handler: BFChainUtil.MutArgEventHandler<
      BFChainCore.ChainChannelGroupEventMap<DH>["removeChainChannel"]
    >,
    opts?: BFChainUtil.EventOptions,
  ) => void {
    return this._chainChannelEvents.on.bind(this._chainChannelEvents, "removeChainChannel");
  }
  @cacheGetter
  get offRemoveChainChannel(): (
    handler: BFChainUtil.MutArgEventHandler<
      BFChainCore.ChainChannelGroupEventMap<DH>["removeChainChannel"]
    >,
  ) => void {
    return this._chainChannelEvents.off.bind(this._chainChannelEvents, "removeChainChannel");
  }

  @bindThis
  private _eventFollower(
    data: BFChainUtil.InnerAnyInOutHandlerArg<BFChainCore.ChainChannelHanlderEventMap>[0],
  ) {
    return this.emit(data.eventname, data.args);
  }
  private addChainChannel_(chainChannel: DH, opts = this.options) {
    this.chainChannelSet.add(chainChannel);
    if (!opts.disableAutoRemove) {
      const listenerRemover = chainChannel.onClose((err) => {
        if (InterruptedException.is(err)) {
          info("channel auto removed in [%s], reason:", this.groupName, err.message);
        } else {
          error("channel auto removed in [%s], reason:", this.groupName, err);
        }
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

  //#region maybeHeight 可以用来参考获取这组节点的最高高度

  /**对方节点可能的高度 */
  private _maybeHeight = 1;
  get maybeHeight() {
    return this._maybeHeight;
  }
  @cacheGetter
  get onMaybeHeightChanged(): (
    handler: BFChainUtil.MutArgEventHandler<
      BFChainCore.ChainChannelGroupEventMap<DH>["maybeHeightChanged"]
    >,
    opts?: BFChainUtil.EventOptions,
  ) => void {
    return this._chainChannelEvents.on.bind(this._chainChannelEvents, "maybeHeightChanged");
  }
  @cacheGetter
  get offMaybeHeightChanged(): (
    handler: BFChainUtil.MutArgEventHandler<
      BFChainCore.ChainChannelGroupEventMap<DH>["maybeHeightChanged"]
    >,
  ) => void {
    return this._chainChannelEvents.off.bind(this._chainChannelEvents, "maybeHeightChanged");
  }
  private _initMaybeHeightWatcher() {
    const tryChangeMaybeHeight = (newMaybeHeight: number) => {
      if (this._maybeHeight !== newMaybeHeight) {
        this._maybeHeight = newMaybeHeight;
        this._chainChannelEvents.emit("maybeHeightChanged", newMaybeHeight);
      }
    };
    const onChainChannelNewBlock: BFChainUtil.EventHandler<
      NewBlockArgModel,
      BFChainCore.NewBlockReturnParams | undefined
    > = (newBlockArg, next) => {
      if (newBlockArg.height > this._maybeHeight) {
        tryChangeMaybeHeight(newBlockArg.height);
      }
      return next();
    };

    /// 先遍历一下当下的节点
    let curMaxMaybeHeight = this._maybeHeight;
    for (const cc of this.chainChannelSet) {
      curMaxMaybeHeight = Math.max(cc.maybeHeight, curMaxMaybeHeight);
    }
    tryChangeMaybeHeight(curMaxMaybeHeight);

    /// 如果有新的节点加入,那么检查它的高度是否最高
    this._chainChannelEvents.on("addChainChannel", (chainChannel) => {
      if (this._maybeHeight < chainChannel.maybeHeight) {
        tryChangeMaybeHeight(chainChannel.maybeHeight);
      }
      /// 监听其高度的变化来跟随其maybeHeight
      chainChannel.on("onNewBlock", onChainChannelNewBlock);
    });
    /// 如果有节点移除, 那么获取其余最高的节点
    this._chainChannelEvents.on("removeChainChannel", (chainChannel) => {
      let newMaybeHeight = 1;
      if (chainChannel.maybeHeight >= this._maybeHeight) {
        /// 最高的值发生了改变,那么就要遍历寻找第二高的值
        for (const cc of this.chainChannelSet) {
          newMaybeHeight = Math.max(cc.maybeHeight, newMaybeHeight);
          if (newMaybeHeight >= chainChannel.maybeHeight) {
            /// 存在更最高节点一样高的节点, 无需改变
            return;
          }
        }
      }
      tryChangeMaybeHeight(newMaybeHeight);
      /// 移除监听
      chainChannel.off("onNewBlock", onChainChannelNewBlock);
    });
  }
  //#endregion
}
