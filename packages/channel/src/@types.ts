declare namespace BFChainCore {
  //#region ChannelHelper
  type BroadcastNewTransactionEvents<DH extends SimpleChainChannel> = {
    startBroadcasting: BFChainUtil.EventInOut<{ chainChannelList: DH[] }, { break: boolean }>;
    broadcasted: BFChainUtil.EventInOut<
      | {
          error: false;
          result: import("@bfchain/core-model-channel").NewTransactionReturnModel;
          chainChannel: DH;
        }
      | {
          error: true;
          result: unknown;
          chainChannel: DH;
        },
      { break: boolean }
    >;
    endBroadcast: BFChainUtil.EventInOut<{ duraction: number }, any>;
  };
  type ChainChannelHanlderEventMap = {
    afterRequestWithBinaryData: BFChainUtil.EventInOut<
      { cmd: import("@bfchain/core-model").DUPLEX_API_CMD; query: Uint8Array; res: any },
      void
    >;
    handleMessageError: {
      in: { handleName: string; error: Error };
      out: undefined;
    };
    onQueryTransaction: {
      in: import("@bfchain/core-model").QueryTransactionArgModel;
      out: QueryTransactionReturnParams | undefined;
    };
    onQueryTransactionBinary: {
      in: import("@bfchain/core-model").QueryTransactionArgModel;
      out: Uint8Array | undefined;
    };
    onIndexTransaction: {
      in: import("@bfchain/core-model").IndexTransactionArgModel;
      out: IndexTransactionReturnParams | undefined;
    };
    onIndexTransactionBinary: {
      in: import("@bfchain/core-model").IndexTransactionArgModel;
      out: Uint8Array | undefined;
    };
    onDownloadTransaction: {
      in: import("@bfchain/core-model").DownloadTransactionArgModel;
      out: DownloadTransactionReturnParams | undefined;
    };
    onDownloadTransactionBinary: {
      in: import("@bfchain/core-model").DownloadTransactionArgModel;
      out: Uint8Array | undefined;
    };
    onNewTransaction: {
      in: import("@bfchain/core-model").NewTransactionArgModel;
      out: NewTransactionReturnParams | undefined;
    };
    onOpenBlob: {
      in: import("@bfchain/core-model").OpenBlobArgModel;
      out: OpenBlobReturnParams | undefined;
    };
    onReadBlob: {
      in: import("@bfchain/core-model").ReadBlobArgModel;
      out: ReadBlobReturnParams | undefined;
    };
    onCloseBlob: {
      in: import("@bfchain/core-model").CloseBlobArgModel;
      out: CloseBlobReturnParams | undefined;
    };
    onQueryBlock: {
      in: import("@bfchain/core-model").QueryBlockArgModel;
      out: QueryBlockReturnParams | undefined;
    };
    onQueryBlockBinary: {
      in: import("@bfchain/core-model").QueryBlockArgModel;
      out: Uint8Array | undefined;
    };
    onNewBlock: {
      in: import("@bfchain/core-model").NewBlockArgModel;
      out: NewBlockReturnParams | undefined;
    };
    onGetPeerInfo: {
      in: import("@bfchain/core-model").GetPeerInfoArgModel;
      out: GetPeerInfoReturnParams | undefined;
    };
    /**如果打破了请求限制的规整 */
    onBreakRequestLimit: {
      in: {
        cmd: import("@bfchain/core-model").DUPLEX_API_CMD;
        requestLimitStrategy: import("@bfchain/core-model").REQUEST_LIMIT_STRATEGY;
        requestLimitInfo?: ReqresLimitInfo;
      };
      out:
        | { requestLimitStrategy: import("@bfchain/core-model").REQUEST_LIMIT_STRATEGY }
        | undefined;
    };
    /**返回响应限制信息 */
    onGetResponseLimitConfig: {
      in: {
        cmd: import("@bfchain/core-model").DUPLEX_API_CMD;
        requestLimitInfo?: ReqresLimitInfo;
      };
      out: LimitConfig | undefined;
    };
  };

  /**收到请求时，关于接口限制的一些信息 */
  type ReqresLimitInfo = {
    /**上一次响应的时间 */
    preResponseTime: number;
    /**上一次拒绝响应的时间 */
    preRefuseTime: number;
    /**承诺的拒绝响应的累计时间 */
    preResponseLimitConfig: LimitConfig;
  };

  /**返回响应时，关于接口限制的一些信息 */
  type LimitConfig = {
    lockTimespan: number;
    refuseTimespan: number;
  };

  /**请求中断器 */
  type AborterOptions<ENV = undefined> = {
    /**禁用下面的所有关于aborter的项 */
    disabledAborterOptions?: boolean;
    /**最终时间 */
    deadlineTime?: number;
    /**超时 */
    timeout?: number | ((env: ENV) => number);
    /**自定义超时的异常 */
    timeoutException?: Error | string | ((env: ENV) => Error);
    /**主动中断信号 */
    aborter?: BFChainUtil.Aborter;
    /**主动中断的promise */
    rejected?: Promise<unknown>;
  };

  type ChannelGroupRequestEnv<CC extends SimpleChainChannel> = {
    // chainChannel: CC;
    channelGroup: ChainChannelGroup<CC>;
  };
  type ChannelRequestEnv<CC extends SimpleChainChannel> = {
    chainChannel: CC;
  };
  type ChannelGroupRequestOptions<CC extends SimpleChainChannel> = AborterOptions<
    ChannelGroupRequestEnv<CC>
  > &
    ChannelRequestBaseOptions<CC> & {
      abortWhenNoChainChannel?: boolean;
      queryUnitLength?: number;
    };
  type ChannelRequestOptions<CC extends SimpleChainChannel> = AborterOptions<
    ChannelRequestEnv<CC>
  > &
    ChannelRequestBaseOptions<CC>;

  /**请求的基本可选项 */
  interface ChannelRequestBaseOptions<CC extends SimpleChainChannel> {
    /**红包的密码 */
    grabSecret?: string;
    /**节点过滤器 */
    channelFilter?: ChannelFilter<CC>;
    directAddress?: Set<string>;
  }
  type ChannelFilter<CC extends BFChainCore.SimpleChainChannel> = (channel: CC) => boolean;
  //#endregion

  type QueneEventEmitterPro<EM extends BFChainUtil.EventInOutMap> =
    import("@bfchain/util").QueneEventEmitterPro<EM>;

  interface SimpleChainChannel
    extends ChainChannelBase,
      QueneEventEmitterPro<ChainChannelHanlderEventMap> {
    delay: number;
    /**
     * 与远程节点通道的相对时间差别
     * 对方的time = 我本地的time + diffTime
     * <0 说明对方的时间比我们慢
     * >0 说明对方的时间比我们快
     */
    readonly diffTime: number;
    /**节点的地址身份 */
    address: string;
    /**
     * 计算要到达某一个时间的差异时间
     * 如果返回值T<0，说明相对于远程节点来说，它们还差T才能到达对应的targetTime
     */
    calcDiffTimeToTargetTime(targetTime: number): number;

    onClose(
      handler: (error: BFChainUtil.InterruptedException) => any,
      once?: boolean,
    ): EventListenerRemover;

    /**发送响应数据 */
    postChainChannelMessage(
      req_id: number,
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
    ): Promise<void>;
    /**查询交易 */
    queryTransactions<T extends Transaction = Transaction>(
      query: QueryTransactionArgJSON["query"],
      sort?: QueryTransactionArgJSON["sort"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").QueryTransactionReturnModel<T>>;
    /**查询交易索引 */
    indexTransactions(
      query: IndexTransactionArgJSON["query"],
      sort?: IndexTransactionArgJSON["sort"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").IndexTransactionReturnModel>;
    /**下载交易 */
    downloadTransactions<T extends Transaction = Transaction>(
      tIndexes: DownloadTransactionArgJSON["tIndexes"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").DownloadTransactionReturnModel<T>>;
    initBroadcastTransactionArg(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<
      readonly [
        import("@bfchain/core-model").DUPLEX_API_CMD.NEW_TRANSACTION,
        Uint8Array,
        (
          params: Uint8Array | ArrayBuffer,
        ) => import("@bfchain/core-model").NewTransactionReturnModel,
        ChannelRequestOptions<any> | undefined,
      ]
    >;
    /**广播交易体 */
    broadcastTransaction(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").NewTransactionReturnModel>;

    openBlob(
      openArg: OpenBlobArgJSON,
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").OpenBlobReturnModel>;

    readBlob(
      readArg: ReadBlobArgJSON,
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").ReadBlobReturnModel>;

    closeBlob(
      closeArg: CloseBlobArgJSON,
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").CloseBlobReturnModel>;

    readonly isRefusePushNewTransaction: boolean;
    readonly canQueryTransactions: boolean;
    readonly canIndexTransactions: boolean;
    readonly canDownloadTransactions: boolean;
    readonly blobSupportAlgorithms: readonly BFChainCore.OpenBlobArgJSON.Algorithm[];
    readonly canQueryBlock: boolean;
    readonly canBroadcastTransaction: boolean;
    readonly canBroadcastBlock: boolean;

    readonly limitQueryTransactions: number;
    readonly limitIndexTransactions: number;
    readonly limitDownloadTransactions: number;

    fastBroadcastTransaction(transaction: NewTransactionArgJSON["transaction"]): Promise<number>;
    /**查询区块 */
    queryBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel<B>>;
    findBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelRequestOptions<any>,
    ): Promise<B | undefined>;
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelRequestOptions<any>,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.NEW_BLOCK,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewBlockReturn,
      ChannelRequestOptions<any> | undefined,
    ];
    /**广播区块 */
    broadcastBlock(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelRequestOptions<any>,
    ): Promise<import("@bfchain/core-model").NewBlockReturn>;

    /**处理接收到数据时的响应 */
    initOnMessage(): void;

    _requestWithBinaryData<T>(
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
      ResonseBoxer: (bytes: Uint8Array) => T,
      opts?: ChannelRequestOptions<any>,
    ): Promise<T>;
    _sendWithBinaryData(
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
    ): Promise<void>;
  }

  interface ChainChannel<THIS extends SimpleChainChannel = SimpleChainChannel>
    extends SimpleChainChannel {
    defaultReqOptions?: ChannelRequestOptions<THIS>;
    delay: number;
    /**
     * 与远程节点通道的相对时间差别
     * 对方的time = 我本地的time + diffTime
     * <0 说明对方的时间比我们慢
     * >0 说明对方的时间比我们快
     */
    readonly diffTime: number;
    /**节点的地址身份 */
    address: string;
    /**
     * 计算要到达某一个时间的差异时间
     * 如果返回值T<0，说明相对于远程节点来说，它们还差T才能到达对应的targetTime
     */
    calcDiffTimeToTargetTime(targetTime: number): number;

    onClose(
      handler: (error: BFChainUtil.InterruptedException) => any,
      once?: boolean,
    ): EventListenerRemover;

    /**发送响应数据 */
    postChainChannelMessage(
      req_id: number,
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
    ): Promise<void>;
    /**查询交易 */
    queryTransactions<T extends Transaction = Transaction>(
      query: QueryTransactionArgJSON["query"],
      sort?: QueryTransactionArgJSON["sort"],
      opts?: ChannelRequestOptions<THIS>,
    ): Promise<import("@bfchain/core-model").QueryTransactionReturnModel<T>>;
    initBroadcastTransactionArg(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelRequestOptions<THIS>,
    ): Promise<
      readonly [
        import("@bfchain/core-model").DUPLEX_API_CMD.NEW_TRANSACTION,
        Uint8Array,
        (
          params: Uint8Array | ArrayBuffer,
        ) => import("@bfchain/core-model").NewTransactionReturnModel,
        ChannelRequestOptions<THIS> | undefined,
      ]
    >;
    /**广播交易体 */
    broadcastTransaction(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelRequestOptions<THIS>,
    ): Promise<import("@bfchain/core-model").NewTransactionReturnModel>;
    fastBroadcastTransaction(transaction: NewTransactionArgJSON["transaction"]): Promise<number>;
    /**查询区块 */
    queryBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelRequestOptions<THIS>,
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel<B>>;
    findBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelRequestOptions<THIS>,
    ): Promise<B | undefined>;
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelRequestOptions<THIS>,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.NEW_BLOCK,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewBlockReturn,
      ChannelRequestOptions<THIS> | undefined,
    ];
    /**广播区块 */
    broadcastBlock(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelRequestOptions<THIS>,
    ): Promise<import("@bfchain/core-model").NewBlockReturn>;

    /**处理接收到数据时的响应 */
    initOnMessage(): void;

    _requestWithBinaryData<T>(
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
      ResonseBoxer: (bytes: Uint8Array) => T,
      options?: ChannelRequestOptions<THIS> | undefined,
    ): Promise<T>;
  }

  interface ChainChannelGroup<CC extends SimpleChainChannel> extends ChainChannelBase {
    defaultReqOptions?: ChannelRequestOptions<CC>;
    groupName: string;
    forEach(hanlder: (chainChannel: CC, i: number) => any): void;

    /**开始一个节点并发任务 */
    $startParallelTask(
      task_id: string,
      opts?: ChainChannelGroup.ParallelTaskOptions<CC>,
    ): ChainChannelGroup.ParallelTaskHelpers<CC>;
    /**释放并发任务 */
    $releaseParallelTask(task_id: string): false | undefined;

    wrapParallelTask<R>(
      runner: (helpers: ChainChannelGroup.ParallelTaskHelpers<CC>) => BFChainUtil.PromiseOne<R>,
      task_id?: string,
      opts?: ChainChannelGroup.ParallelTaskOptions<CC>,
    ): Promise<BFChainUtil.PromiseType<R>>;
    wrapCbParallelTask<R>(
      callback: (helpers: ChainChannelGroup.ParallelTaskHelpers<CC>, cb: () => void) => R,
      task_id?: string,
      opts?: ChainChannelGroup.ParallelTaskOptions<CC>,
    ): unknown;
    wrapAgParallelTask<T = unknown, TReturn = any, TNext = unknown>(
      agRunner: (
        helpers: ChainChannelGroup.ParallelTaskHelpers<CC>,
      ) => AsyncGenerator<T, TReturn, TNext>,
      task_id?: string,
      opts?: ChainChannelGroup.ParallelTaskOptions<CC>,
    ): AsyncGenerator<T, TReturn, TNext>;
    /**
     * 查询交易
     */
    queryTransactions<T extends Transaction = Transaction>(
      query: QueryTransactionArgJSON["query"],
      sort?: QueryTransactionArgJSON["sort"],
      opts?: ChannelGroupRequestOptions<CC>,
      _resultGenerator?: import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock<T>>,
    ): import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock<T>>;
    /**查询交易索引 */
    indexTransactions(
      query: IndexTransactionArgJSON["query"],
      sort?: IndexTransactionArgJSON["sort"],
      opts?: ChannelGroupRequestOptions<CC>,
      _resultGenerator?: import("@bfchain/util").AsyncIteratorGenerator<BFChainCore.TransactionIndexJSON>,
    ): import("@bfchain/util").AsyncIteratorGenerator<BFChainCore.TransactionIndexJSON>;
    /**下载交易 */
    downloadTransactions<T extends Transaction = Transaction>(
      tIndexes: DownloadTransactionArgJSON["tIndexes"],
      opts?: ChannelGroupRequestOptions<CC>,
      _resultGenerator?: import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock<T>>,
    ): import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock<T>>;
    /**
     * 广播交易体
     */
    broadcastTransaction(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelGroupRequestOptions<CC> & {
        max_parallel_num?: number;
      },
      event?: BFChainUtil.QueneEventEmitter<BroadcastNewTransactionEvents<CC>>,
    ): Promise<
      (
        | {
            error: false;
            result: import("@bfchain/core-model-channel").NewTransactionReturnModel;
            chainChannel: CC;
          }
        | {
            error: true;
            result: unknown;
            chainChannel: CC;
          }
      )[]
    >;
    fastBroadcastTransaction(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelGroupRequestOptions<CC> & {
        max_parallel_num?: number;
      },
      event?: BFChainUtil.QueneEventEmitter<BroadcastNewTransactionEvents<CC>>,
    ): Promise<number>;
    /**
     * 查询区块
     */
    queryBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelGroupRequestOptions<CC>,
    ): Promise<B | undefined>;
    /**
     * 广播区块
     */
    broadcastBlock(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelGroupRequestOptions<CC>,
    ): Promise<
      {
        chainChannel: CC;
        result: Promise<import("@bfchain/core-model").NewBlockReturn>;
      }[]
    >;
  }
  namespace ChainChannelGroup {
    type ParallelTaskOptions<CC extends SimpleChainChannel> = {
      /**节点防火墙，被拦截的节点绝对不会参与到任务中来 */
      channelFirewall?: BFChainCore.ChannelFilter<CC>;
      abortWhenNoChainChannel?: boolean;
      taskResponseCmd?: import("@bfchain/core-model").DUPLEX_API_CMD;
    };
    type ParallelTaskCache<CC extends SimpleChainChannel> = {
      freeChainChannels: Set<CC>;
      busyChainChannels: Set<CC>;
      chainChannelWaiterQueue: ChainChannelWaiterQueue<CC>;
      tiTasks: Set<Promise<void>>;
      onDestroy: () => unknown;
      helpers: ParallelTaskHelpers<CC>;
      refs: Set<unknown>;
    };

    type Filter<T> = (cc: T) => boolean;
    type ParallelTaskHelpers<CC extends SimpleChainChannel> = {
      freeChainChannel: (chainChannel: CC) => void;
      busyChainChannel: (chainChannel: CC) => void;
      hasFreeChainChannel: () => boolean;

      getFreeChainChannel: (opts?: { filter?: Filter<CC> }) => CC | Promise<CC>;
      requestChainChannel: <R>(
        config: { autoFreeChainChannel?: boolean; filter?: Filter<CC> },
        cb: (event: RequestChainChannelEvent<CC>) => Promise<R>,
      ) => Promise<R>;
    };

    interface ChainChannelWaiter<CC extends SimpleChainChannel> extends BFChainUtil.PromiseOut<CC> {
      filter?: Filter<CC>;
    }
    interface ChainChannelWaiterQueue<CC extends SimpleChainChannel> {
      size: number;
      /**入列，增加一个排队者 */
      enqueue(filter?: Filter<CC>): ChainChannelWaiter<CC>;
      /**出列，减少一个排队者 */
      dequeue(cc: CC): ChainChannelWaiter<CC> | undefined;
    }
  }

  type RequestChainChannelEvent<CC extends SimpleChainChannel = ChainChannel> = {
    chainChannel: CC;
    autoFreeChainChannel: boolean;
  };
  type ChainChannelGroupEventMap<CC extends SimpleChainChannel = ChainChannel> = {
    addChainChannel: [CC];
    removeChainChannel: [CC];
    maybeHeightChanged: [number, number | undefined];
    consensusVersionChanged: [number];
  };
  interface ChainChannelBase {
    maybeHeight: number;
    getApiMaybeQueueTime(cmd: import("@bfchain/core-model").DUPLEX_API_CMD): number;
    lastConsensusVersion: number;
    toBlockGetterHelper(opts?: {
      maxHeight?: number;
      lastBlock?: Block;
    }): BlockGetterHelperSimpleInterface;
  }

  type VerboseInfo<R> =
    | { type: "result"; value: R }
    | { type: "info"; value: unknown }
    | { type: "success"; value: unknown }
    | { type: "warn"; value: unknown }
    | { type: "error"; value: unknown };
}
