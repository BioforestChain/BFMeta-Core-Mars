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
  EasyMap,
  ModuleStroge,
  safePromiseThen,
  safePromiseOffThen,
  OnInit,
  $safeEnd,
} from "@bfchain/util";
import {
  Block,
  CommonBlock,
  RESPONSE_STATUS,
  TransactionInBlock,
  NewBlockArgModel,
  DUPLEX_API_CMD,
  NewBlockReturn,
  NewTransactionReturnModel,
  QueryBlockReturnModel,
  QueryTransactionReturnModel,
  IndexTransactionReturnModel,
  DownloadTransactionReturnModel,
} from "@bfchain/core-model";
import { ChainChannelHelper } from "./chainChannelHelper";
import { ChainChannel, ChainChannelBase } from "./chainChannel";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import {
  GroupQueryTransactionsBuilder,
  GroupQueryBlockBuilder,
  GroupRequesterBuilder,
  GroupDownloadTransactionsBuilder,
  GroupIndexTransactionsBuilder,
} from "./GroupRequesterBuilder";
import { BaseHelper, ChainTimeHelper, ConfigHelper, TransactionHelper } from "@bfchain/core-helper";
import type { PromiseTimeout } from "./PromiseTimeout";
import { IntSet } from "./IntSet";

const { AbortException, InterruptedException, error, success, info, warn, log, TimeOutException } =
  CoreExceptionGenerator("channel", "chainChannelGroup");

export const CHAIN_CHANNEL_GROUP_ARGS = {
  GROUP_NAME: Symbol("groupName"),
  CHANNEL_LIST: Symbol("channelList"),
  OPTIONS: Symbol("options"),
};

/**
 * 批量双工通讯管理器
 */
@Resolvable()
export class ChainChannelGroup<DH extends BFChainCore.SimpleChainChannel = ChainChannel>
  extends ChainChannelBase
  implements BFChainCore.ChainChannelGroup<DH>, AfterInit, OnInit
{
  get canQueryTransactions() {
    for (const cc of this.chainChannelSet) {
      if (cc.canQueryTransactions) {
        return true;
      }
    }
    return false;
  }
  get canIndexTransaction() {
    for (const cc of this.chainChannelSet) {
      if (cc.canIndexTransactions) {
        return true;
      }
    }
    return false;
  }
  get canDownloadTransaction() {
    for (const cc of this.chainChannelSet) {
      if (cc.canDownloadTransactions) {
        return true;
      }
    }
    return false;
  }
  get canQueryBlock() {
    for (const cc of this.chainChannelSet) {
      if (cc.canQueryBlock) {
        return true;
      }
    }
    return false;
  }
  get canBroadcastTransaction() {
    for (const cc of this.chainChannelSet) {
      if (cc.canBroadcastTransaction) {
        return true;
      }
    }
    return false;
  }
  get canBroadcastBlock() {
    for (const cc of this.chainChannelSet) {
      if (cc.canBroadcastBlock) {
        return true;
      }
    }
    return false;
  }
  get limitQueryTransactions() {
    let limit = 0;
    for (const cc of this.chainChannelSet) {
      const { limitQueryTransactions: ccLimit } = cc;
      if (ccLimit > limit) {
        limit = ccLimit;
      }
    }
    return limit;
  }
  get limitIndexTransactions() {
    let limit = 0;
    for (const cc of this.chainChannelSet) {
      const { limitIndexTransactions: ccLimit } = cc;
      if (ccLimit > limit) {
        limit = ccLimit;
      }
    }
    return limit;
  }
  get limitDownloadTransactions() {
    let limit = 0;
    for (const cc of this.chainChannelSet) {
      const { limitDownloadTransactions: ccLimit } = cc;
      if (ccLimit > limit) {
        limit = ccLimit;
      }
    }
    return limit;
  }

  getApiMaybeQueueTime(cmd: DUPLEX_API_CMD): number {
    let queue = Infinity;
    for (let cc of this.chainChannelSet) {
      queue = Math.min(cc.getApiMaybeQueueTime(cmd), queue);
      if (queue === 0) {
        break;
      }
    }
    // if(queue===Infinity){
    //   queue = 0
    // }
    return queue;
  }

  bfOnInit() {
    /// 先遍历一下当下的节点
    let curMaxMaybeHeight = this._maybeHeight;
    for (const cc of this.chainChannelSet) {
      curMaxMaybeHeight = Math.max(cc.maybeHeight, curMaxMaybeHeight);
    }
    this._tryChangeMaybeHeight(curMaxMaybeHeight);
  }
  bfAfterInit() {
    this._initMaybeHeightWatcher();
  }
  @Inject(BaseHelper) protected baseHelper!: BaseHelper;
  @Inject(ConfigHelper) protected config!: ConfigHelper;
  @Inject(ModuleStroge) private moduleMap!: ModuleStroge;
  @Inject(ChainTimeHelper) private timeHelper!: ChainTimeHelper;
  @Inject(ChainChannelHelper) private helper!: ChainChannelHelper;
  @Inject(TransactionHelper) private transactionHelper!: TransactionHelper;

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
    BFChainCore.ChainChannelGroup.ParallelTaskCache<DH>
  >();
  /**节点的工作量 */
  private _workCountWM = new EasyWeakMap<DH, number>((_) => 0);
  /**开始一个节点并发任务 */
  $requestParallelTask(
    task_id: string,
    opts: BFChainCore.ChainChannelGroup.ParallelTaskOptions<DH> = {},
  ): BFChainCore.ChainChannelGroup.ParallelTaskCache<DH> {
    let cache = this._parallelTasksMap.get(task_id);
    if (cache) {
      return cache;
    }

    const { channelFilter, abortWhenNoChainChannel } = opts;
    const WCWM = this._workCountWM;
    const { taskResponseCmd } = opts;
    const sorter =
      taskResponseCmd !== undefined
        ? (a: DH, b: DH) =>
            a.delay * WCWM.forceGet(a) +
            a.getApiMaybeQueueTime(taskResponseCmd) -
            (b.delay * WCWM.forceGet(b) + b.getApiMaybeQueueTime(taskResponseCmd))
        : (a: DH, b: DH) => a.delay * WCWM.forceGet(a) - b.delay * WCWM.forceGet(b);

    //#region 可用节点的队列管理
    /**空闲节点列表
     * 基于工作量与延迟来进行排序
     */
    const freeChainChannelList = [...this.chainChannelSet.values()]
      .filter(channelFilter ? channelFilter : Boolean)
      .sort(sorter);
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
      if (abortWhenNoChainChannel && this.size === 0) {
        throw new AbortException(`${task_id} abort because the size is zero`);
      }
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
    const requestChainChannel = async <R>(
      cb: (event: BFChainCore.RequestChainChannelEvent<DH>) => Promise<R>,
      autoFreeChainChannel = true,
    ) => {
      const chainChannel = await getFreeChainChannel();
      busyChainChannel(chainChannel);
      const event: BFChainCore.RequestChainChannelEvent<DH> = {
        chainChannel,
        autoFreeChainChannel,
      };
      try {
        return await cb(event);
      } finally {
        if (event.autoFreeChainChannel) {
          freeChainChannel(chainChannel);
        }
      }
    };
    /**
     * 但繁忙节点增加或者可用节点减少的时候，自动进行释放工作
     */
    const _tryFreeChainChannel = () => {
      if (busyChainChannels.size > freeChainChannelList.length) {
        /**
         * @FIXME 因为 tiTasks.size 目前只用在这里，所以可以简单地这样去判断
         */
        if (busyChainChannels.size <= tiTasks.size) {
          return;
        }
        /// 如果繁忙的节点已经超过原有可用节点的一半以上了，那么尝试慢慢恢复节点的可用性，这里的策略是随机恢复
        const ti = sleep(1000, () => {
          tiTasks.delete(ti);
          if (busyChainChannels.size === 0) {
            return;
          }
          /// 随机获取繁忙列表中的一个节点
          const iterator = busyChainChannels.values();
          let i = Math.floor(busyChainChannels.size * Math.random());
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
    const helpers: BFChainCore.ChainChannelGroup.ParallelTaskHelpers<DH> = {
      hasFreeChainChannel,
      getFreeChainChannel,
      freeChainChannel,
      busyChainChannel,
      requestChainChannel,
    };
    cache = {
      freeChainChannelList,
      busyChainChannels,
      queneChainChannelList,
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
      helpers,
      refs: new Set(),
    };
    this._parallelTasksMap.set(task_id, cache);
    return cache;
  }
  /**开始一个节点并发任务 */
  $startParallelTask(
    task_id: string,
    opts: BFChainCore.ChainChannelGroup.ParallelTaskOptions<DH> = {},
  ) {
    return this.$requestParallelTask(task_id, opts).helpers;
  }
  /**释放并发任务 */
  $releaseParallelTask(task_id: string) {
    const task = this._parallelTasksMap.get(task_id);
    if (!task) {
      return false;
    }
    this._parallelTasksMap.delete(task_id);

    task.onDestroy();
  }
  async wrapParallelTask<R>(
    runner: (
      helpers: BFChainCore.ChainChannelGroup.ParallelTaskHelpers<DH>,
    ) => BFChainUtil.PromiseOne<R>,
    task_id = "unknowParallelTask",
    opts: BFChainCore.ChainChannelGroup.ParallelTaskOptions<DH> = {},
  ) {
    const task = this.$requestParallelTask(task_id, opts);
    task.refs.add(runner);
    try {
      return await runner(task.helpers);
    } finally {
      task.refs.delete(runner);
      if (task.refs.size === 0) {
        this.$releaseParallelTask(task_id);
      }
    }
  }
  wrapCbParallelTask<R>(
    callback: (helpers: BFChainCore.ChainChannelGroup.ParallelTaskHelpers<DH>, cb: () => void) => R,
    task_id = "unknowParallelTask",
    opts: BFChainCore.ChainChannelGroup.ParallelTaskOptions<DH> = {},
  ) {
    const task = this.$requestParallelTask(task_id, opts);
    task.refs.add(callback);
    return callback(task.helpers, () => {
      task.refs.delete(callback);
      if (task.refs.size === 0) {
        this.$releaseParallelTask(task_id);
      }
    });
  }
  async *wrapAgParallelTask<T = unknown, TReturn = any, TNext = unknown>(
    agRunner: (
      helpers: BFChainCore.ChainChannelGroup.ParallelTaskHelpers<DH>,
    ) => AsyncGenerator<T, TReturn, TNext>,
    task_id = "unknowParallelTask",
    opts: BFChainCore.ChainChannelGroup.ParallelTaskOptions<DH> = {},
  ): AsyncGenerator<T, TReturn, TNext> {
    const task = this.$requestParallelTask(task_id, opts);
    task.refs.add(agRunner);
    try {
      return yield* agRunner(task.helpers);
    } finally {
      task.refs.delete(agRunner);
      if (task.refs.size === 0) {
        this.$releaseParallelTask(task_id);
      }
    }
  }
  /**
   * 查询交易
   */
  @bindThis
  queryTransactions<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH>,
    _resultGenerator?: AsyncIteratorGenerator<TransactionInBlock<T>>,
  ) {
    // /**异常时重试次数 */
    // const RETRY_TIMES = 3;
    const { offset, limit: totalLength, ...baseQueryCondition } = query;
    const limit = baseQueryCondition.signature ? 1 : totalLength || Infinity;

    const parallelTaskId = `Group(${this.groupName}) queryTransactions-${
      Date.now() + Math.random()
    }`;
    const customChannelFilter = opts?.channelFilter || (() => true);
    const { requestChainChannel } = this.$startParallelTask(parallelTaskId, {
      channelFilter: (cc) => cc.canQueryTransactions && customChannelFilter(cc),
      abortWhenNoChainChannel: opts?.abortWhenNoChainChannel,
      taskResponseCmd: DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN,
    });

    const resultPo =
      opts &&
      this.helper.parserAborterOptions(opts, {
        channelGroup: this as BFChainCore.ChainChannelGroup<DH>,
      });

    const resultGenerator = _resultGenerator || new AsyncIteratorGenerator<TransactionInBlock<T>>();

    const resultPromise = resultPo && resultPo.promise;
    if (resultPromise) {
      safePromiseThen(resultPromise, undefined, resultGenerator.reject);
      const offCatch = (_: unknown, next: () => void) => {
        safePromiseOffThen(resultPromise, undefined, resultGenerator.reject);
        next();
      };
      resultGenerator.on("done", offCatch);
      resultGenerator.on("error", offCatch);
    }

    type QueryTransactionAddChainChannelOptions = _AddChainChannelOptions<
      DH,
      GroupQueryTransactionsBuilder<DH, T>,
      { offset: number; limit: number }
    >;
    const _addChainChannelOptionsExmBuilder = {
      timeout: (self: QueryTransactionAddChainChannelOptions, cc: DH) =>
        `peer(${cc.address}) queryTransactions(<offset:${self.data.offset},limit:${self.data.limit}>) timeout.` +
        `\n[query:]${JSON.stringify(self.requester.query)}` +
        `\n[sort:]${JSON.stringify(self.requester.sort)}`,
    };

    const requesterMap = EasyMap.from<
      { offset: number; limit: number },
      {
        requester: GroupQueryTransactionsBuilder<DH, T>;
        options: QueryTransactionAddChainChannelOptions;
      },
      string
    >({
      transformKey: (query) => `${query.offset}-${query.limit}`,
      creater: (query) => {
        const requester = GroupQueryTransactionsBuilder.create<DH, T>(
          this.moduleMap,
          { ...baseQueryCondition, ...query },
          sort,
        );
        return {
          requester: requester,
          options: new _AddChainChannelOptions(
            _addChainChannelOptionsExmBuilder,
            query,
            requester,
            this.helper.getChainChannelTimeout,
            resultPo,
          ),
        };
      },
    });

    const queryUnitLength = opts?.queryUnitLength;

    /**发往每一台节点的查询数量 */
    const unitLength =
      queryUnitLength || (totalLength ? totalLength / (this.chainChannelSet.size || 1) : 100);

    /// 在异步任务中进行任务分发
    (async () => {
      /**所有查询任务的链 */
      let taskChain = Promise.resolve();
      /**是否已经触碰到完结的边界了 */
      let queryDoneOffset = limit + offset;
      /**更新边界,同时会释放迭代锁 */
      const setQueryDoneOffset = (newOffset: number) => {
        queryDoneOffset = newOffset;
        freeIteratorLock();
      };

      /**迭代锁 */
      let iteratorLock: PromiseOut<void> | undefined; //= new PromiseOut<void>();
      /**释放迭代锁 */
      const freeIteratorLock = () => {
        if (iteratorLock) {
          iteratorLock.resolve();
          iteratorLock = undefined;
        }
      };
      /**触发迭代锁的条件 */
      let maxOffset = -1;

      //#region 请求模式

      /// 是要全部请求
      resultGenerator.on("requestAll", (_, next) => {
        freeIteratorLock();
        maxOffset = Infinity;
        next();
      });
      /// 还是一个个请求
      resultGenerator.on("requestItem", (index, next) => {
        const queryOffset = index + offset;
        if (queryOffset > maxOffset) {
          maxOffset = queryOffset;
          freeIteratorLock();
        }
        next();
      });
      //#endregion

      /**
       * 执行任务
       * @param task_offset
       * @param times 希望请求下来的条数
       * @returns 最终去执行请求的条数
       */
      const doTask = (task_offset: number, default_task_limit: number) => {
        /**
         * 失败次数
         */
        let times = 0;
        // const waitUseableChainChannel = new PromiseOut<void>();
        taskChain = taskChain.then(
          async () => {
            do {
              const finished = await requestChainChannel(async (event) => {
                /**
                 * @FIXME 这里有可能会出现节点的limitQueryTransactions少于default_task_limit，导致查询量少了出现问题。需要后续做补充查询
                 */
                const chain_task_limit = Math.min(
                  event.chainChannel.limitQueryTransactions,
                  default_task_limit,
                );
                const { requester: queryer, options } = requesterMap.forceGet({
                  offset: task_offset,
                  limit: chain_task_limit,
                });
                waitUseableChainChannel.resolve(chain_task_limit);
                // 开始执行查询
                try {
                  const res = await queryer.addChainChannel(event.chainChannel, options);

                  if (res.status === RESPONSE_STATUS.success) {
                    // 保存查询结果
                    res.transactions.forEach((trs, i) => {
                      const index = task_offset - offset + i;
                      if (resultGenerator.canPush(index)) {
                        resultGenerator.push(trs);
                      }
                    });
                    if (res.transactions.length < chain_task_limit) {
                      /// 如果是高度最高的那个节点返回空列表，那么基本就是空列表没跑了
                      const resultChannelMaybeHeight =
                        queryer.getChainChannelByResult(res)?.maybeHeight;
                      if (
                        resultChannelMaybeHeight &&
                        resultChannelMaybeHeight >= this.maybeHeight
                      ) {
                        /// 得到了查询终点
                        setQueryDoneOffset(task_offset);
                        // 确认节点的工作，让其继续下一个工作
                        event.autoFreeChainChannel = true;
                        /// 中断这次查询
                        return true;
                      } else {
                        // 移除无效的结果
                        queryer.removeChainChannelByResult(res);
                        // 重试任务，但是这个节点因为高度过低，暂时不用它来查询
                        times++;
                        return false;
                      }
                    } else {
                      // 任务完成
                      queryer.finish();
                      // 确认节点的工作，让其继续下一个工作
                      event.autoFreeChainChannel = true;
                      return true;
                    }
                  } else if (res.status === RESPONSE_STATUS.busy) {
                    // 移除无效的结果
                    queryer.removeChainChannelByResult(res);
                    // 重试任务，但是这个节点仍旧放在繁忙节点列表，暂时不信任
                    times++;
                    return false;
                  } else if (res.status === RESPONSE_STATUS.error) {
                    // 移除无效的结果
                    queryer.removeChainChannelByResult(res);
                    // 任务失败，抛出异常
                    throw res.error;
                  } else if (res.status === RESPONSE_STATUS.idempotentError) {
                    // 移除无效的结果
                    queryer.removeChainChannelByResult(res);
                    // 任务失败，抛出异常
                    throw res.error;
                  }

                  res.status;
                } catch (err) {
                  queryer.removeChainChannelByResult(err);
                  if (AbortException.is(err) || resultGenerator.is_done) {
                    // 如果被中断了任务，那么直接结束任务
                    throw err;
                  }
                  if (!TimeOutException.is(err)) {
                    /// 如果时超时，默认不打印，因为超时时本地没收到数据的问题
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
                  }

                  /// 如果异常次数过多，那么有必要终结这个查询
                  return times++ > 100;
                }
              }, /**默认不释放节点 */ false);
              if (finished) {
                break;
              }
            } while (true);
          },
          (err) => waitUseableChainChannel.reject(err),
        );
        return waitUseableChainChannel.promise;
      };

      /**节点锁
       * 同一时间内节点只会由一个请求在执行
       */
      let waitUseableChainChannel: PromiseOut<number>;

      /// 分发任务
      const default_task_limit = Math.min(unitLength, limit);
      for (let i = 0, task_limit = default_task_limit; i < limit; i += task_limit) {
        const task_offset = i + offset;
        while (task_offset > maxOffset) {
          /// 因为query_done_offset影响着整个循环的生命周期,所以这里允许使用 query_done_offset 来控制进度锁
          if (task_offset >= queryDoneOffset) {
            break;
          }
          if (!iteratorLock) {
            iteratorLock = new PromiseOut();
            await iteratorLock.promise;
          }
        }
        if (task_offset >= queryDoneOffset) {
          break;
        }
        waitUseableChainChannel = new PromiseOut();
        task_limit = await doTask(task_offset, default_task_limit);

        if (i + task_limit > limit) {
          task_limit = i + task_limit - limit;
          if (task_limit <= 0) {
            break;
          }
        }
      }
      // 等待所有查询任务完成
      await taskChain;
      // 结束
      await resultGenerator.done();
    })()
      .catch(resultGenerator.reject)
      .finally(() => {
        this.$releaseParallelTask(parallelTaskId);
      });

    return resultGenerator;
  }

  @bindThis
  indexTransactions(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH>,
    _resultGenerator?: AsyncIteratorGenerator<BFChainCore.TransactionIndexJSON>,
  ) {
    // /**异常时重试次数 */
    // const RETRY_TIMES = 3;
    const { offset, limit: totalLength, ...baseQueryCondition } = query;
    const limit = baseQueryCondition.signature ? 1 : totalLength || Infinity;

    const parallelTaskId = `Group(${this.groupName}) indexTransactions-${
      Date.now() + Math.random()
    }`;
    const customChannelFilter = opts?.channelFilter || (() => true);
    const { requestChainChannel } = this.$startParallelTask(parallelTaskId, {
      channelFilter: (cc) => cc.canIndexTransactions && customChannelFilter(cc),
      abortWhenNoChainChannel: opts?.abortWhenNoChainChannel,
      taskResponseCmd: DUPLEX_API_CMD.INDEX_TRANSACTION_RETURN,
    });

    const resultPo =
      opts &&
      this.helper.parserAborterOptions(opts, {
        channelGroup: this as BFChainCore.ChainChannelGroup<DH>,
      });

    const resultGenerator =
      _resultGenerator || new AsyncIteratorGenerator<BFChainCore.TransactionIndexJSON>();

    const resultPromise = resultPo && resultPo.promise;
    if (resultPromise) {
      safePromiseThen(resultPromise, undefined, resultGenerator.reject);
      const offCatch = (_: unknown, next: () => void) => {
        safePromiseOffThen(resultPromise, undefined, resultGenerator.reject);
        next();
      };
      resultGenerator.on("done", offCatch);
      resultGenerator.on("error", offCatch);
    }

    type IndexTransactionAddChainChannelOptions = _AddChainChannelOptions<
      DH,
      GroupIndexTransactionsBuilder<DH>,
      { offset: number; limit: number }
    >;
    const _addChainChannelOptionsExmBuilder = {
      timeout: (self: IndexTransactionAddChainChannelOptions, cc: DH) =>
        `peer(${cc.address}) indexTransactions(<offset:${self.data.offset},limit:${self.data.limit}>) timeout.` +
        `\n[query:]${JSON.stringify(self.requester.query)}` +
        `\n[sort:]${JSON.stringify(self.requester.sort)}`,
    };
    const queryerMap = EasyMap.from<
      { offset: number; limit: number },
      {
        requester: GroupIndexTransactionsBuilder<DH>;
        options: IndexTransactionAddChainChannelOptions;
      },
      string
    >({
      transformKey: (query) => `${query.offset}-${query.limit}`,
      creater: (query) => {
        const requester = GroupIndexTransactionsBuilder.create<DH>(
          this.moduleMap,
          { ...baseQueryCondition, ...query },
          sort,
        );
        return {
          requester: requester,
          options: new _AddChainChannelOptions(
            _addChainChannelOptionsExmBuilder,
            query,
            requester,
            this.helper.getChainChannelTimeout,
            resultPo,
          ),
        };
      },
    });

    const queryUnitLength = opts?.queryUnitLength;

    /**发往每一台节点的查询数量 */
    const unitLength =
      queryUnitLength || (totalLength ? totalLength / (this.chainChannelSet.size || 1) : 100);

    /// 在异步任务中进行任务分发
    (async () => {
      /**所有查询任务的链 */
      let taskChain = Promise.resolve();
      /**是否已经触碰到完结的边界了 */
      let queryDoneOffset = limit + offset;
      /**更新边界,同时会释放迭代锁 */
      const setQueryDoneOffset = (newOffset: number) => {
        queryDoneOffset = newOffset;
        freeIteratorLock();
      };

      /**迭代锁 */
      let iteratorLock: PromiseOut<void> | undefined; //= new PromiseOut<void>();
      /**释放迭代锁 */
      const freeIteratorLock = () => {
        if (iteratorLock) {
          iteratorLock.resolve();
          iteratorLock = undefined;
        }
      };
      /**触发迭代锁的条件 */
      let maxOffset = -1;

      //#region 请求模式

      /// 是要全部请求
      resultGenerator.on("requestAll", (_, next) => {
        freeIteratorLock();
        maxOffset = Infinity;
        next();
      });
      /// 还是一个个请求
      resultGenerator.on("requestItem", (index, next) => {
        const queryOffset = index + offset;
        if (queryOffset > maxOffset) {
          maxOffset = queryOffset;
          freeIteratorLock();
        }
        next();
      });
      //#endregion

      /**
       * 执行任务
       * @param task_offset
       * @param times 希望请求下来的条数
       * @returns 最终去执行请求的条数
       */
      const doTask = (task_offset: number, default_task_limit: number) => {
        /**
         * 失败次数
         */
        let times = 0;
        // const waitUseableChainChannel = new PromiseOut<void>();
        taskChain = taskChain.then(
          async () => {
            do {
              const finished = await requestChainChannel(async (event) => {
                /**
                 * @FIXME 这里有可能会出现节点的limitQueryTransactions少于default_task_limit，导致查询量少了出现问题。需要后续做补充查询
                 */
                const chain_task_limit = Math.min(
                  event.chainChannel.limitQueryTransactions,
                  default_task_limit,
                );
                const { requester: queryer, options } = queryerMap.forceGet({
                  offset: task_offset,
                  limit: chain_task_limit,
                });
                waitUseableChainChannel.resolve(chain_task_limit);
                // 开始执行查询
                try {
                  const res = await queryer.addChainChannel(event.chainChannel, options);

                  if (res.status === RESPONSE_STATUS.success) {
                    // 保存查询结果
                    res.tIndexes.forEach((ti, i) => {
                      const index = task_offset - offset + i;
                      if (resultGenerator.canPush(index)) {
                        resultGenerator.push(ti);
                      }
                    });
                    if (res.tIndexes.length < chain_task_limit) {
                      /// 如果是高度最高的那个节点返回空列表，那么基本就是空列表没跑了
                      const resultChannelMaybeHeight =
                        queryer.getChainChannelByResult(res)?.maybeHeight;
                      if (
                        resultChannelMaybeHeight &&
                        resultChannelMaybeHeight >= this.maybeHeight
                      ) {
                        /// 得到了查询终点
                        setQueryDoneOffset(task_offset);
                        // 确认节点的工作，让其继续下一个工作
                        event.autoFreeChainChannel = true;
                        /// 中断这次查询
                        return true;
                      } else {
                        // 移除无效的结果
                        queryer.removeChainChannelByResult(res);
                        // 重试任务，但是这个节点因为高度过低，暂时不用它来查询
                        times++;
                        return false;
                      }
                    } else {
                      // 任务完成
                      queryer.finish();
                      // 确认节点的工作，让其继续下一个工作
                      event.autoFreeChainChannel = true;
                      return true;
                    }
                  } else if (res.status === RESPONSE_STATUS.busy) {
                    // 移除无效的结果
                    queryer.removeChainChannelByResult(res);
                    // 重试任务，但是这个节点仍旧放在繁忙节点列表，暂时不信任
                    times++;
                    return false;
                  } else if (res.status === RESPONSE_STATUS.error) {
                    // 移除无效的结果
                    queryer.removeChainChannelByResult(res);
                    // 任务失败，抛出异常
                    throw res.error;
                  } else if (res.status === RESPONSE_STATUS.idempotentError) {
                    // 移除无效的结果
                    queryer.removeChainChannelByResult(res);
                    // 任务失败，抛出异常
                    throw res.error;
                  }

                  $safeEnd(res.status);
                } catch (err) {
                  queryer.removeChainChannelByResult(err);
                  if (AbortException.is(err) || resultGenerator.is_done) {
                    // 如果被中断了任务，那么直接结束任务
                    throw err;
                  }
                  if (!TimeOutException.is(err)) {
                    /// 如果时超时，默认不打印，因为超时时本地没收到数据的问题
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
                  }

                  /// 如果异常次数过多，那么有必要终结这个查询
                  return times++ > 100;
                }
              }, /**默认不释放节点 */ false);
              if (finished) {
                break;
              }
            } while (true);
          },
          (err) => waitUseableChainChannel.reject(err),
        );
        return waitUseableChainChannel.promise;
      };

      /**节点锁
       * 同一时间内节点只会由一个请求在执行
       */
      let waitUseableChainChannel: PromiseOut<number>;

      /// 分发任务
      const default_task_limit = Math.min(unitLength, limit);
      for (let i = 0, task_limit = default_task_limit; i < limit; i += task_limit) {
        const task_offset = i + offset;
        while (task_offset > maxOffset) {
          /// 因为query_done_offset影响着整个循环的生命周期,所以这里允许使用 query_done_offset 来控制进度锁
          if (task_offset >= queryDoneOffset) {
            break;
          }
          if (!iteratorLock) {
            iteratorLock = new PromiseOut();
            await iteratorLock.promise;
          }
        }
        if (task_offset >= queryDoneOffset) {
          break;
        }
        waitUseableChainChannel = new PromiseOut();
        task_limit = await doTask(task_offset, default_task_limit);

        if (i + task_limit > limit) {
          task_limit = i + task_limit - limit;
          if (task_limit <= 0) {
            break;
          }
        }
      }
      // 等待所有查询任务完成
      await taskChain;
      // 结束
      await resultGenerator.done();
    })()
      .catch(resultGenerator.reject)
      .finally(() => {
        this.$releaseParallelTask(parallelTaskId);
      });

    return resultGenerator;
  }

  private _formatHiList(hiList: { height: number; index: number }[]) {
    /**这里预先将tIndex全部展开，因为可能存在重复的清空
     * 这里利用array的特性，它length
     */
    const loose_fi_List: number[] = [];
    /**每个高度之间都会有一个空白的元素间隔，使它们不连续 */
    const height_fiStart_EM = new EasyMap<number, number>((height) => loose_fi_List.length + 1);
    /**按照height进行排序，这样相同height的一并处理完，然后进入下一个height的处理
     * 无需在意相同height中index的排序，因为它们会依次展开在有序的tIndexList数组中，可以理解成同样height的并发，不同height的串行
     */
    for (const hi of hiList.slice().sort((a, b) => a.height - b.height)) {
      const fiStart = height_fiStart_EM.forceGet(hi.height);
      const fi = fiStart + hi.index;
      loose_fi_List[fi] = fi;
    }
    /// 将宽松数字转为紧凑数组
    const fi_List: number[] = [];
    loose_fi_List.forEach((v) => (fi_List[fi_List.length] = v));

    const fi_Set = new IntSet(fi_List);
    const height_fiStart_List: {
      baseIndex: number;
      height: number;
    }[] = [];
    for (const item of height_fiStart_EM) {
      height_fiStart_List[height_fiStart_List.length] = {
        height: item[0],
        baseIndex: item[1],
      };
    }

    /**
     * 当前搜索的起点，因为是有顺序的，所以遍历过的就可以不再遍历
     */
    let curr_HAFBIL_Index = 0;
    return fi_Set.getRangeSet(Infinity).map((range) => {
      const nextIndex = height_fiStart_List.findIndex(
        (item) => item.baseIndex > range.start,
        curr_HAFBIL_Index,
      );
      curr_HAFBIL_Index = nextIndex === -1 ? height_fiStart_List.length - 1 : nextIndex - 1;
      const heightBaseIndexInfo = height_fiStart_List[curr_HAFBIL_Index];
      const height = heightBaseIndexInfo.height;
      const index = range.start - heightBaseIndexInfo.baseIndex;
      const length = range.length;
      return {
        height,
        index,
        length,
      };
    });
  }
  /**批量下载区块链事件
   * 📖📖📖📖📖📖
   * 目前的tIndexe格式本质是height+Index+length，也就是一个个height+index的组合，所以以下简写成hi，hi是一个对象，有height和index属性。
   *    同时，his代表着字符串版本的hi，就是`${height}-${index}`
   * flatIndex和tIndex是类似，都是hi的纯数字版，但hi是虚拟出来的，不是准确的ti，以下简写fi
   * 📖📖📖📖📖📖
   */
  @bindThis
  downloadTransactions<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    tIndexes: BFChainCore.DownloadTransactionArgJSON["tIndexes"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH> & { maxParallelNum?: number },
    _resultGenerator?: AsyncIteratorGenerator<TransactionInBlock<T>>,
  ) {
    /**发往每一台节点的最大查询数量
     * 如果 MAX_PARALLEL_NUM = 1
     * 那么意味着一次性更这个节点进行查询全部的数据
     * 虽然可能意味着阻塞，但由于对自己来说，因为MAX_PARALLEL_NUM=1，
     * 往往也就意味着与自己连接的节点就是1个，由此网络中的节点可能极少，与我互相隔离
     * 为此我不需要取在乎其它节点的资源消耗。我只需要自私的去尽可能一次性获取全部就好
     *
     * 而如果MAX_PARALLEL_NUM>1，说明网络中还有其它可用资源，
     * 我可以减少一次性的获取数量，来共同维护网络的稳定性
     */
    const MAX_UNIT_LIMIT = Math.min(
      Math.ceil((this.limitDownloadTransactions || 1) / Math.SQRT2),
      1,
    );

    type HIS = `${number}-${number}`;
    /**展开所有的tIndexe成heightIndex，并保持最原始的请求顺序的同时，剔除重复存在的请求
     * 这里使用map的特性，重复插入的不会重新排序
     */
    const his_hi_Map = new Map<HIS, { height: number; index: number }>();
    const addHisHi = (height: number, index: number) => {
      his_hi_Map.set(`${height}-${index}` as const, { height, index });
    };
    for (const ti of tIndexes) {
      if (ti.length > 1) {
        for (let i = 0; i < ti.length; ++i) {
          addHisHi(ti.height, ti.index + i);
        }
      } else {
        addHisHi(ti.height, ti.index);
      }
    }
    const hi_List = [...his_hi_Map.values()];
    const totalDownloadCount = hi_List.length;

    const resultPo =
      opts &&
      this.helper.parserAborterOptions(opts, {
        channelGroup: this,
      });

    const resultGenerator = _resultGenerator || new AsyncIteratorGenerator();

    const parallelTaskId = `Group(${this.groupName}) downloadTransactions-${
      Date.now() + Math.random()
    }`;
    const customChannelFilter = opts?.channelFilter || (() => true);
    const { requestChainChannel } = this.$startParallelTask(parallelTaskId, {
      channelFilter: (cc) => cc.canDownloadTransactions && customChannelFilter(cc),
      abortWhenNoChainChannel: opts?.abortWhenNoChainChannel,
      taskResponseCmd: DUPLEX_API_CMD.DOWNLOAD_TRANSACTION_RETURN,
    });

    type DownloadTransactionAddChainChannelOptions = _AddChainChannelOptions<
      DH,
      GroupDownloadTransactionsBuilder<DH, T>,
      BFChainCore.TransactionIndexJSON[]
    >;
    const _addChainChannelOptionsExmBuilder = {
      timeout: (self: DownloadTransactionAddChainChannelOptions, cc: DH) =>
        `peer(${cc.address}) downloadTransactions(<${self.data
          .map((ti) => `${ti.height}/${ti.index}:${ti.length}`)
          .join(",")}) timeout.`,
    };
    const requesterMap = EasyMap.from<
      BFChainCore.TransactionIndexJSON[],
      {
        requester: GroupDownloadTransactionsBuilder<DH, T>;
        options: DownloadTransactionAddChainChannelOptions;
      },
      string
    >({
      transformKey: (tIndexes) =>
        tIndexes.map((ti) => `${ti.height}/${ti.index}:${ti.length}`).join(","),
      creater: (tIndexes) => {
        const requester = GroupDownloadTransactionsBuilder.create<DH, T>(this.moduleMap, tIndexes);

        return {
          requester,
          options: new _AddChainChannelOptions(
            _addChainChannelOptionsExmBuilder,
            tIndexes,
            requester,
            this.helper.getChainChannelTimeout,
            resultPo,
          ),
        };
      },
    });

    (async () => {
      /**迭代锁 */
      let iteratorLock: PromiseOut<void> | undefined; //= new PromiseOut<void>();
      /**释放迭代锁 */
      const freeIteratorLock = () => {
        if (iteratorLock) {
          iteratorLock.resolve();
          iteratorLock = undefined;
        }
      };
      /**触发迭代锁的条件 */
      let yieldIndex = resultGenerator.requestProcess;

      //#region 请求模式

      /// 是要全部请求
      resultGenerator.on("requestAll", (_, next) => {
        freeIteratorLock();
        yieldIndex = Infinity;
        next();
      });
      /// 还是一个个请求
      resultGenerator.on("requestItem", (index, next) => {
        if (index > yieldIndex) {
          yieldIndex = index;
          freeIteratorLock();
        }
        next();
      });
      //#endregion
      /**
       * 当前查询的进度
       */
      let curr_hi_index = 0;
      const doTask = async () => {
        do {
          const hi_slice = hi_List.slice(curr_hi_index, (curr_hi_index += MAX_UNIT_LIMIT));
          if (hi_slice.length === 0) {
            break;
          }
          /**hi数组转化成tIndexs，节省请求指令的数据包大小 */
          const tindexSlice = this._formatHiList(hi_slice);
          const totalLength = hi_slice.length;
          const needHeight = hi_slice[hi_slice.length - 1].height;
          /**
           * 失败次数
           */
          let times = 0;
          while (true) {
            const finished = await requestChainChannel(async (event) => {
              /// 节点高度不满足查询条件
              if (event.chainChannel.maybeHeight < needHeight) {
                return false;
              }

              const { requester, options } = requesterMap.forceGet(tindexSlice);
              try {
                const res = await requester.addChainChannel(event.chainChannel, options);
                if (res.status === RESPONSE_STATUS.success) {
                  /**
                   * @TODO 这里应该判定 tIndexsSlice 所请求的数量跟返回的数量是否一致
                   */
                  if (res.transactions.length < totalLength) {
                    // 移除无效的结果
                    requester.removeChainChannelByResult(res);
                    // 重试任务，但是这个节点仍旧放在繁忙节点列表，暂时不信任
                    times++;
                    return false;
                  } else {
                    /// 将查询的结果用hi_List的顺序进行排列
                    const tib_hiIndex_List = res.transactions
                      .map((tib) => {
                        return {
                          tib,
                          hiIndex: hi_List.findIndex(
                            (hi) => hi.height === tib.height && hi.index === tib.index,
                          ),
                        };
                      })
                      .sort((a, b) => a.hiIndex - b.hiIndex);
                    for (const item of tib_hiIndex_List) {
                      if (resultGenerator.canPush(resultGenerator.list.length)) {
                        resultGenerator.push(item.tib);
                      }
                    }
                    return true;
                  }
                } else if (res.status === RESPONSE_STATUS.busy) {
                  // 移除无效的结果
                  requester.removeChainChannelByResult(res);
                  // 重试任务，但是这个节点仍旧放在繁忙节点列表，暂时不信任
                  times++;
                  return false;
                } else if (res.status === RESPONSE_STATUS.error) {
                  // 移除无效的结果
                  requester.removeChainChannelByResult(res);
                  // 任务失败，抛出异常
                  throw res.error;
                } else if (res.status === RESPONSE_STATUS.idempotentError) {
                  // 移除无效的结果
                  requester.removeChainChannelByResult(res);
                  // 任务失败，抛出异常
                  throw res.error;
                }
              } catch (err) {
                requester.removeChainChannelByResult(err);
                if (AbortException.is(err) || resultGenerator.is_done) {
                  // 如果被中断了任务，那么直接结束任务
                  throw err;
                }
                if (!TimeOutException.is(err)) {
                  /// 如果时超时，默认不打印，因为超时时本地没收到数据的问题
                  error(
                    err,
                    "[GROUP]:",
                    this.groupName,
                    "[TINDEXES]:",
                    hi_slice,
                    "[TIMES]:",
                    times,
                  );
                }

                /// 如果异常次数过多，那么有必要终结这个查询
                return times++ > 100;
              }
            });
            if (finished) {
              break;
            }
          }
        } while (true);
      };

      for (let i = 0; i < totalDownloadCount; i += MAX_UNIT_LIMIT) {
        while (i >= yieldIndex) {
          if (!iteratorLock) {
            iteratorLock = new PromiseOut();
          }
          await iteratorLock.promise;
        }
        await doTask();
      }
      await resultGenerator.done();
    })();

    return resultGenerator;
  }

  @bindThis
  queryTransactionsV2<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH> & { maxParallelNum?: number },
    hiRG: AsyncIteratorGenerator<BFChainCore.TransactionIndexJSON> = new AsyncIteratorGenerator(),
    tibRG: AsyncIteratorGenerator<TransactionInBlock<T>> = new AsyncIteratorGenerator(),
  ) {
    /// 联动传递 for await 、await 、break 等信号
    let hiWalk = { i: 0, count: 0 };
    tibRG.on("requestItem", (index, next) => {
      if (index < hiWalk.count) {
        return next();
      }
      do {
        if (hiWalk.i < hiRG.list.length) {
          do {
            const hi = hiRG.list[hiWalk.i];
            if (hi === undefined) {
              hiRG.emit("requestItem", hiWalk.i);
              return next();
            }
            hiWalk.count += hi.length;
            ++hiWalk.i;
          } while (hiWalk.i < hiRG.list.length);
        } else {
          hiRG.emit("requestItem", hiWalk.i);
          return next();
        }
      } while (hiWalk.count <= index);
    });
    tibRG.on("requestAll", (_, next) => (hiRG.emit("requestAll", undefined), next()));
    tibRG.on("done", (_, next) => (hiRG.done(), next()));

    /// 下载锁，用于确保前一个下载完成并插入到ag后，再去插入下一个数据
    type DownloadLock = PromiseOut<void>;
    const downloadLockList: (DownloadLock | true)[] = [];
    const getDownloadLock = (index: number) => {
      if (index < 0) {
        return;
      }
      let donwloadLock = downloadLockList[index];
      if (donwloadLock === undefined) {
        donwloadLock = downloadLockList[index] = new PromiseOut();
        donwloadLock.onFinished(() => (downloadLockList[index] = true)); /// 使用true替代PromiseOut，节省内存
      }
      if (donwloadLock === true || donwloadLock.is_finished) {
        return;
      }
      return donwloadLock;
    };

    /// 得到索引数据后，开始进行下载，并且依次进行保存
    hiRG.on("push", async (item, next) => {
      const currDownloadLock = getDownloadLock(item.index);
      if (currDownloadLock === undefined) {
        tibRG.throw(new Error(`could not push tibs, when:${item.index}`));
        return next();
      }
      try {
        const tibs = await this.downloadTransactions([item.item], opts);
        /// 等待前一个任务插入完成
        const prevDownloadLock = getDownloadLock(item.index - 1);
        if (prevDownloadLock) {
          await prevDownloadLock.promise;
        }

        if (tibRG.is_done === false) {
          for (const tib of tibs) {
            tibRG.push(tib as TransactionInBlock<T>);
          }
        }
        currDownloadLock.resolve();
      } catch (err) {
        tibRG.throw(err);
        currDownloadLock.reject(err);
      }
      /// 如果所有的任务都已经完成，那么完结tibRG
      if (
        hiRG.is_done &&
        downloadLockList.every(
          (lock) => lock === true || (lock instanceof PromiseOut && lock.is_finished),
        )
      ) {
        tibRG.done();
      }
      return next();
    });
    // 如果没有查询到任何结果，那么直接完结
    hiRG.on("done", (_, next) => {
      if (hiRG.list.length === 0) {
        tibRG.done();
      }
      return next();
    });
    /// 开启索引查询
    this.indexTransactions(query, sort, opts, hiRG);

    return tibRG;
  }

  /**
   * 广播交易体
   */
  async broadcastTransaction(
    transaction: BFChainCore.NewTransactionArgJSON["transaction"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH> & { max_parallel_num?: number },
    event?: QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<DH>>,
  ) {
    let initedArgs:
      | readonly [
          DUPLEX_API_CMD,
          Uint8Array,
          (params: Uint8Array | ArrayBuffer) => NewTransactionReturnModel,
          BFChainCore.ChannelRequestOptions<DH> | undefined,
        ]
      | undefined;
    const startTime = this.timeHelper.now();
    const resultList = [] as BFChainCore.BroadcastNewTransactionEvents<DH>["broadcasted"]["in"][];

    let resultPo: PromiseTimeout<void> | undefined;
    try {
      let chainChannelList: DH[] = [];
      if (opts && opts.directAddress && opts.directAddress.size > 0) {
        const directAddress = opts.directAddress;
        for (const DH of this.chainChannelSet.values()) {
          if (directAddress.has(DH.address)) {
            chainChannelList.push(DH);
          }
        }
      } else {
        chainChannelList = [...this.chainChannelSet.values()];
      }
      let is_break = event && (await event.emit("startBroadcasting", { chainChannelList }));
      if (is_break && is_break.break) {
        return [];
      }
      const pp = new ParallelPool<void>(opts && opts.max_parallel_num);

      resultPo =
        opts &&
        this.helper.parserAborterOptions(opts, {
          channelGroup: this as BFChainCore.ChainChannelGroup<DH>,
        });
      // 将要广播的节点放置到广播队列中
      for (const chainChannel of chainChannelList) {
        pp.addTaskExecutor(async () => {
          const requestArgs =
            initedArgs ||
            (initedArgs = await chainChannel.initBroadcastTransactionArg(transaction, {
              timeout: (env) => this.helper.getChainChannelTimeout(env.chainChannel),
              rejected: resultPo?.promise,
            }));
          let result: BFChainCore.BroadcastNewTransactionEvents<DH>["broadcasted"]["in"];
          try {
            /// 算出相对事件是否满足条件
            const needWaitTime = -chainChannel.calcDiffTimeToTargetTime(
              this.timeHelper.getTimeByTimestamp(transaction.timestamp),
            );

            if (needWaitTime > 0) {
              log(
                "chainChannel(%s) seems in feature. need wait %dms then broadcast.",
                chainChannel.address,
                needWaitTime,
              );
              /// 如果需要等待的事件已经超过了最大等待时间，那么这里是一定会超时的，所以这里考虑不将这个chainChannel纳入返回结果的处理中
              if (
                resultPo &&
                resultPo.sleepTime > 0 &&
                needWaitTime +
                  chainChannel.delay / 2 /* 这里只考虑发送的时长，所以只需要一般的延迟 */ >
                  resultPo.sleepTime
              ) {
                log("chainChannel(%s) need wait too much time, so skip in resultList.");
                /// 这里直接独立去作业
                sleep(needWaitTime, async () => {
                  try {
                    result = {
                      error: false,
                      result: await chainChannel._requestWithBinaryData(...requestArgs),
                      chainChannel,
                    };
                  } catch (error) {
                    result = { error: true, result: error, chainChannel };
                  }
                  if (event) {
                    /**虽然这里不属于广播的逻辑，但还是await一下 */
                    await event.emit("broadcasted", result);
                  }
                });
                return;
              }

              await sleep(needWaitTime);
            }
            resultList.push(
              (result = {
                error: false,
                result: await chainChannel._requestWithBinaryData(...requestArgs),
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
      resultPo?.resolve(undefined);
    } catch (err) {
      resultPo?.reject(err);
    } finally {
      const endTime = this.timeHelper.now();
      event && event.emit("endBroadcast", { duraction: endTime - startTime });
    }
    let successCount = 0;
    let errorCount = 0;
    resultList.forEach((result) => {
      if (result.error) {
        errorCount += 1;
      } else {
        successCount += 1;
      }
    });
    (successCount === 0 && errorCount > 0 ? error : success)(
      "chainChannelGroup(%s) broadcasted Transaction(%s), successed: %d, fail: %d",
      this.groupName,
      this.transactionHelper.getTypeName(transaction.type),
      successCount,
      errorCount,
      transaction.asset,
    );
    return resultList;
  }
  async fastBroadcastTransaction(
    transaction: BFChainCore.NewTransactionArgJSON["transaction"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH> & { max_parallel_num?: number },
    event?: QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<DH>>,
  ) {
    let initedArgs:
      | readonly [
          DUPLEX_API_CMD,
          Uint8Array,
          (params: Uint8Array | ArrayBuffer) => NewTransactionReturnModel,
          BFChainCore.ChannelRequestOptions<DH> | undefined,
        ]
      | undefined;

    let chainChannelList: DH[] = [];
    if (opts && opts.directAddress && opts.directAddress.size > 0) {
      const directAddress = opts.directAddress;
      for (const DH of this.chainChannelSet.values()) {
        if (directAddress.has(DH.address)) {
          chainChannelList.push(DH);
        }
      }
    } else {
      for (const DH of this.chainChannelSet.values()) {
        if (DH.canBroadcastTransaction) {
          chainChannelList.push(DH);
        }
      }
      // chainChannelList = [...this.chainChannelSet.values()];
    }
    let is_break = event && (await event.emit("startBroadcasting", { chainChannelList }));
    let broadCount = 0;
    if (is_break && is_break.break) {
      return broadCount;
    }
    const startTime = this.timeHelper.now();
    /// 开始广播
    for (const chainChannel of chainChannelList) {
      if (chainChannel.isRefusePushNewTransaction) {
        continue;
      }
      initedArgs || (initedArgs = await chainChannel.initBroadcastTransactionArg(transaction));
      try {
        broadCount++;
        chainChannel._sendWithBinaryData(initedArgs[0], initedArgs[1]);
      } catch (err) {}
    }
    const endTime = this.timeHelper.now();
    event && event.emit("endBroadcast", { duraction: endTime - startTime });
    return broadCount;
  }
  /**
   * 查询区块
   */
  async queryBlock<B extends Block = CommonBlock>(
    query: BFChainCore.QueryBlockArgJSON["query"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH>,
    event?: QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<DH>>,
  ): Promise<B | undefined> {
    const parallelTaskId = `Group(${this.groupName}) queryBlock-${Date.now() + Math.random()}`;
    const { requestChainChannel } = this.$startParallelTask(parallelTaskId, {
      channelFilter: opts?.channelFilter,
      abortWhenNoChainChannel: opts?.abortWhenNoChainChannel,
      taskResponseCmd: DUPLEX_API_CMD.QUERY_BLOCK_RETURN,
    });

    //#region 外部控制器

    const resultPo =
      opts &&
      this.helper.parserAborterOptions(opts, {
        channelGroup: this as BFChainCore.ChainChannelGroup<DH>,
      });

    let is_rejected = false;
    const resultPromise = resultPo?.promise;
    let offCatchResultPo: undefined | (() => void);
    if (resultPromise) {
      /// 有一个默认的错误捕捉
      const catchResultPo = (err: unknown) => {
        warn(err);
        is_rejected = true;
      };
      safePromiseThen(resultPromise, undefined, catchResultPo);
      offCatchResultPo = () => {
        safePromiseOffThen(resultPromise, undefined, catchResultPo);
      };
    }
    //#endregion

    try {
      const RETRY_TIMES = Math.min(Math.max(this.size, 2), 5);

      const queryer = GroupQueryBlockBuilder.create<DH, QueryBlockReturnModel<B>>(
        this.moduleMap,
        query,
      );

      const options: BFChainCore.ChannelRequestOptions<DH> = {
        rejected: resultPromise,
        timeout: (env) => {
          return this.helper.getChainChannelTimeout(env.chainChannel);
        },
      };
      {
        const exCache = new EasyMap<DH, Error>(
          (cc) =>
            new TimeOutException("peer({peerId}) queryBlock({query}) timeout.", {
              query: JSON.stringify(queryer.query),
              peerId: cc.address,
            }),
        );
        options.timeoutException = (env) => {
          return exCache.forceGet(env.chainChannel);
        };
      }

      let retryTimes = 0;
      let block: B | undefined;
      do {
        if (is_rejected) {
          return;
        }
        await requestChainChannel(async (event) => {
          try {
            const result = await queryer.addChainChannel(event.chainChannel, options);
            if (result.status === RESPONSE_STATUS.error) {
              queryer.removeChainChannelByResult(result);
              throw result.error;
            }
            if (result.status === RESPONSE_STATUS.busy) {
              /// 失败，移除失败的节点，继续请求新节点进行查询
              queryer.removeChainChannelByResult(result);
              /// 抛出到异常处理函数去处理
              throw undefined;
            }
            block = result.someBlock?.block;
            if (!block) {
              /**
               * result.status === RESPONSE_STATUS.success
               * 查询返回成功，却被告之没有区块，说明对方没有所需的区块
               * 如果这是最高节点的返回，那么说明这个查询条件就是查询不到了，可以直接返回
               * @TODO 这是不靠谱的，可能会遇到恶意返回，应该从底层协议去解决这个问题
               */
              const resultChannelMaybeHeight = queryer.getChainChannelByResult(result)?.maybeHeight;
              if (resultChannelMaybeHeight && resultChannelMaybeHeight >= this.maybeHeight) {
                is_rejected = true;
                return;
              }
            }
            /// 完成任务
            queryer.finish();
          } catch (err) {
            if (is_rejected) {
              return;
            }
            queryer.removeChainChannelByResult(err);
            err && warn(err);
            retryTimes += 1;
            if (retryTimes >= RETRY_TIMES) {
              is_rejected = true;
              return;
            }
          }
        }, /**默认不自动释放节点 */ false);
      } while (!block);
      return block;
    } finally {
      /// 释放并发
      this.$releaseParallelTask(parallelTaskId);
      offCatchResultPo && offCatchResultPo();
    }
  }

  findBlock<B extends Block = CommonBlock>(
    query: BFChainCore.QueryBlockArgJSON["query"],
    opts?: BFChainCore.ChannelGroupRequestOptions<DH>,
  ) {
    return this.queryBlock<B>(query, opts);
  }
  /**
   * 广播区块
   */
  async broadcastBlock(
    blockInfo: BFChainCore.NewBlockArgJSON,
    opts?: BFChainCore.ChannelGroupRequestOptions<DH>,
  ) {
    let initedArgs:
      | readonly [
          DUPLEX_API_CMD,
          Uint8Array,
          (params: Uint8Array | ArrayBuffer) => NewBlockReturn,
          BFChainCore.ChannelRequestOptions<DH> | undefined,
        ]
      | undefined;
    let chainChannelList: DH[] = [];
    if (opts && opts.directAddress && opts.directAddress.size > 0) {
      const directAddress = opts.directAddress;
      for (const DH of this.chainChannelSet.values()) {
        if (directAddress.has(DH.address)) {
          chainChannelList.push(DH);
        }
      }
    } else {
      chainChannelList = [...this.chainChannelSet.values()];
    }

    const resultPo =
      opts &&
      this.helper.parserAborterOptions(opts, {
        channelGroup: this as BFChainCore.ChainChannelGroup<DH>,
      });

    const resultList = await Promise.all(
      chainChannelList.map((chainChannel) => {
        initedArgs ||
          (initedArgs = chainChannel.initBroadcastBlockArg(blockInfo, {
            timeout: (env) => this.helper.getChainChannelTimeout(env.chainChannel),
            rejected: resultPo?.promise,
          }));

        return {
          chainChannel,
          result: chainChannel._requestWithBinaryData(...initedArgs),
        };
      }),
    );
    let successCount = 0;
    let errorCount = 0;
    await Promise.all(
      resultList.map(async (result) => {
        try {
          const res = await result.result;
          if (res.error) {
            errorCount += 1;
          } else {
            successCount += 1;
          }
        } catch (err) {
          errorCount += 1;
        }
      }),
    );

    (successCount === 0 && errorCount > 0 ? error : success)(
      "chainChannelGroup(%s) broadcasted Block(%d), successed: %d, fail: %d",
      this.groupName,
      blockInfo.height,
      successCount,
      errorCount,
    );
    return resultList;
  }
  async fastBroadcastBlock(
    blockInfo: BFChainCore.NewBlockArgJSON,
    opts?: BFChainCore.ChannelGroupRequestOptions<DH>,
  ) {
    let initedArgs:
      | readonly [
          DUPLEX_API_CMD,
          Uint8Array,
          (params: Uint8Array | ArrayBuffer) => NewBlockReturn,
          BFChainCore.ChannelRequestOptions<DH> | undefined,
        ]
      | undefined;

    let chainChannelList: DH[] = [];
    if (opts && opts.directAddress && opts.directAddress.size > 0) {
      const directAddress = opts.directAddress;
      for (const DH of this.chainChannelSet.values()) {
        if (directAddress.has(DH.address)) {
          chainChannelList.push(DH);
        }
      }
    } else {
      for (const DH of this.chainChannelSet.values()) {
        if (DH.canBroadcastBlock) {
          chainChannelList.push(DH);
        }
      }
      // chainChannelList = [...this.chainChannelSet.values()];
    }
    let broadCount = 0;
    /// 开始广播
    for (const chainChannel of chainChannelList) {
      initedArgs || (initedArgs = chainChannel.initBroadcastBlockArg(blockInfo));
      try {
        broadCount++;
        chainChannel._sendWithBinaryData(initedArgs[0], initedArgs[1]);
      } catch (err) {}
    }
    return broadCount;
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
  /**最高的补丁共识版本 */
  protected _lastConsensusVersion = 1;
  get lastConsensusVersion() {
    return this._lastConsensusVersion;
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

  private _tryChangeMaybeHeight(newMaybeHeight: number, version?: number) {
    if (this._maybeHeight !== newMaybeHeight) {
      this._maybeHeight = newMaybeHeight;
      this._chainChannelEvents.emit("maybeHeightChanged", newMaybeHeight, version);
    }
  }
  private _tryChangeConsensusVersion(consensusVersion: number) {
    if (this._lastConsensusVersion !== consensusVersion) {
      this._lastConsensusVersion = consensusVersion;
      this._chainChannelEvents.emit("consensusVersionChanged", consensusVersion);
    }
  }
  private _initMaybeHeightWatcher() {
    const onChainChannelNewBlock: BFChainUtil.EventHandler<
      NewBlockArgModel,
      BFChainCore.NewBlockReturnParams | undefined
    > = (newBlockArg, next) => {
      if (newBlockArg.height > this._maybeHeight) {
        this._tryChangeMaybeHeight(newBlockArg.height, newBlockArg.version);
      }
      return next();
    };
    /// 先遍历一下当下的节点
    let curMaxMaybeHeight = this._maybeHeight;
    for (const cc of this.chainChannelSet) {
      curMaxMaybeHeight = Math.max(cc.maybeHeight, curMaxMaybeHeight);
    }
    this._tryChangeMaybeHeight(curMaxMaybeHeight);

    /// 如果有新的节点加入,那么检查它的高度是否最高
    this._chainChannelEvents.on("addChainChannel", (chainChannel) => {
      if (this._maybeHeight < chainChannel.maybeHeight) {
        this._tryChangeMaybeHeight(chainChannel.maybeHeight);
      }
      if (this._lastConsensusVersion < chainChannel.lastConsensusVersion) {
        this._tryChangeConsensusVersion(chainChannel.lastConsensusVersion);
      }
      /// 监听其高度的变化来跟随其maybeHeight
      chainChannel.on("onNewBlock", onChainChannelNewBlock);
    });
    /// 如果有节点移除, 那么获取其余最高的节点
    this._chainChannelEvents.on("removeChainChannel", (chainChannel) => {
      /// 移除监听
      chainChannel.off("onNewBlock", onChainChannelNewBlock);
      if (chainChannel.maybeHeight < this._maybeHeight) {
        return;
      }
      let newMaybeHeight = 1;
      /// 最高的值发生了改变,那么就要遍历寻找第二高的值
      for (const cc of this.chainChannelSet) {
        newMaybeHeight = Math.max(cc.maybeHeight, newMaybeHeight);
        if (newMaybeHeight >= chainChannel.maybeHeight) {
          /// 存在更最高节点一样高的节点, 无需改变
          return;
        }
      }
      this._tryChangeMaybeHeight(newMaybeHeight);
    });
  }
  //#endregion
}
/**私有内部类 */
class _AddChainChannelOptions<
  DH extends BFChainCore.SimpleChainChannel,
  GR extends GroupRequesterBuilder<DH, any>,
  DATA extends {},
> implements BFChainCore.ChannelRequestOptions<DH>
{
  constructor(
    private exmBuilder: {
      timeout: (self: _AddChainChannelOptions<DH, GR, DATA>, cc: DH) => string;
    },
    readonly data: DATA,
    readonly requester: GR,
    readonly getChainChannelTimeout: (
      chainChannel: BFChainCore.SimpleChainChannel,
      baseTime?: number,
    ) => number,
    private resultPo?: PromiseOut<unknown>,
  ) {}
  @cacheGetter
  private get _exm() {
    return new EasyMap<DH, Error>((cc) => new TimeOutException(this.exmBuilder.timeout(this, cc)));
  }
  @bindThis
  timeoutException(env: BFChainCore.ChannelRequestEnv<DH>) {
    return this._exm.forceGet(env.chainChannel);
  }
  timeout(env: BFChainCore.ChannelRequestEnv<DH>) {
    return this.getChainChannelTimeout(env.chainChannel);
  }
  get rejected() {
    return this.resultPo?.promise;
  }
}
