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
    onNewTransaction: {
      in: import("@bfchain/core-model").NewTransactionArgModel;
      out: NewTransactionReturnParams | undefined;
    };
    onQueryBlock: {
      in: import("@bfchain/core-model").QueryBlockArgModel;
      out: QueryBlockReturnParams | undefined;
    };
    onNewBlock: {
      in: import("@bfchain/core-model").NewBlockArgModel;
      out: NewBlockReturnParams | undefined;
    };
    onGetPeerInfo: {
      in: import("@bfchain/core-model").GetPeerInfoArgModel;
      out: GetPeerInfoReturnParams | undefined;
    };
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
  type ChannelRequestEnv<CC> = {
    chainChannel: CC;
  };
  type ChannelGroupRequestOptions<CC extends SimpleChainChannel> = AborterOptions<
    ChannelGroupRequestEnv<CC>
  > &
    ChannelRequestBaseOptions & {
      abortWhenNoChainChannel?: boolean;
    };
  type ChannelRequestOptions<CC> = AborterOptions<ChannelRequestEnv<CC>> &
    ChannelRequestBaseOptions;

  /**请求的基本可选项 */
  interface ChannelRequestBaseOptions {
    /**红包的密码 */
    grabSecret?: string;
    /**节点过滤器 */
    channelFilter?: ChannelFilter;
    directAddress?: Set<string>;
  }
  type ChannelFilter = (channel: BFChainCore.ChainChannel) => boolean;
  //#endregion

  type QueneEventEmitterPro<
    EM extends BFChainUtil.EventInOutMap
  > = import("@bfchain/util").QueneEventEmitterPro<EM>;

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
    postResponseMessage(
      req_id: number,
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
    ): void;
    /**查询交易 */
    queryTransactions(
      query: QueryTransactionArgJSON["query"],
      sort?: QueryTransactionArgJSON["sort"],
    ): Promise<import("@bfchain/core-model").QueryTransactionReturnModel>;
    initBroadcastTransactionArg(
      transaction: NewTransactionArgJSON["transaction"],
    ): Promise<
      readonly [
        import("@bfchain/core-model").DUPLEX_API_CMD.NEW_TRANSACTION,
        Uint8Array,
        (
          params: Uint8Array | ArrayBuffer,
        ) => import("@bfchain/core-model").NewTransactionReturnModel,
        unknown,
      ]
    >;
    /**广播交易体 */
    broadcastTransaction(
      transaction: NewTransactionArgJSON["transaction"],
    ): Promise<import("@bfchain/core-model").NewTransactionReturnModel>;
    /**查询区块 */
    queryBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel<B>>;
    findBlock<B extends Block = Block>(query: QueryBlockArgJSON["query"]): Promise<B | undefined>;
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(
      blockInfo: NewBlockArgJSON,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.NEW_BLOCK,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewBlockReturn,
      unknown,
    ];
    /**广播区块 */
    broadcastBlock(
      blockInfo: NewBlockArgJSON,
    ): Promise<import("@bfchain/core-model").NewBlockReturn>;

    /**处理接收到数据时的响应 */
    initOnMessage(): void;

    _requestWithBinaryData<T>(
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
      ResonseBoxer: (bytes: Uint8Array) => T,
    ): Promise<T>;
  }

  interface ChainChannel extends SimpleChainChannel {
    defaultReqOptions?: ChannelRequestOptions<this>;
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
    postResponseMessage(
      req_id: number,
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
    ): void;
    /**查询交易 */
    queryTransactions(
      query: QueryTransactionArgJSON["query"],
      sort?: QueryTransactionArgJSON["sort"],
      opts?: ChannelRequestOptions<this>,
    ): Promise<import("@bfchain/core-model").QueryTransactionReturnModel>;
    initBroadcastTransactionArg(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelRequestOptions<this>,
    ): Promise<
      readonly [
        import("@bfchain/core-model").DUPLEX_API_CMD.NEW_TRANSACTION,
        Uint8Array,
        (
          params: Uint8Array | ArrayBuffer,
        ) => import("@bfchain/core-model").NewTransactionReturnModel,
        ChannelRequestOptions<this>,
      ]
    >;
    /**广播交易体 */
    broadcastTransaction(
      transaction: NewTransactionArgJSON["transaction"],
      opts?: ChannelRequestOptions<this>,
    ): Promise<import("@bfchain/core-model").NewTransactionReturnModel>;
    /**查询区块 */
    queryBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelRequestOptions<this>,
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel<B>>;
    findBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelRequestOptions<this>,
    ): Promise<B | undefined>;
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelRequestOptions<this>,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.NEW_BLOCK,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewBlockReturn,
      ChannelRequestOptions<this> | undefined,
    ];
    /**广播区块 */
    broadcastBlock(
      blockInfo: NewBlockArgJSON,
      opts?: ChannelRequestOptions<this>,
    ): Promise<import("@bfchain/core-model").NewBlockReturn>;

    /**处理接收到数据时的响应 */
    initOnMessage(): void;

    _requestWithBinaryData<T>(
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
      ResonseBoxer: (bytes: Uint8Array) => T,
      options?: ChannelRequestOptions<this> | undefined,
    ): Promise<T>;
  }

  interface ChainChannelGroup<CC extends SimpleChainChannel> extends ChainChannelBase {
    defaultReqOptions?: ChannelRequestOptions<CC>;
    groupName: string;
    forEach(hanlder: (chainChannel: CC, i: number) => any): void;

    /**开始一个节点并发任务 */
    startParallelTask(
      task_id: string,
      opts?: {
        channelFilter?: BFChainCore.ChannelFilter;
        abortWhenNoChainChannel?: boolean;
      },
    ): {
      getFreeChainChannel: () => CC | Promise<CC>;
      freeChainChannel: (chainChannel: CC) => void;
      busyChainChannel: (chainChannel: CC) => void;
      hasFreeChainChannel: () => boolean;
      requestChainChannel: <R>(
        cb: (event: RequestChainChannelEvent<CC>) => Promise<R>,
        autoFreeChainChannel?: boolean,
      ) => Promise<R>;
    };
    /**释放并发任务 */
    releaseParallelTask(task_id: string): false | undefined;
    /**
     * 查询交易
     */
    queryTransactions(
      query: QueryTransactionArgJSON["query"],
      sort?: QueryTransactionArgJSON["sort"],
      opts?: ChannelGroupRequestOptions<CC>,
      _resultGenerator?: import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock>,
    ): import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock>;
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
    /**
     * 查询区块
     */
    queryBlock<B extends Block = Block>(
      query: QueryBlockArgJSON["query"],
      opts?: ChannelGroupRequestOptions<CC>,
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel<B>>;
    findBlock<B extends Block = Block>(
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
  type RequestChainChannelEvent<CC extends SimpleChainChannel = ChainChannel> = {
    chainChannel: CC;
    autoFreeChainChannel: boolean;
  };
  type ChainChannelGroupEventMap<CC extends SimpleChainChannel = ChainChannel> = {
    addChainChannel: [CC];
    removeChainChannel: [CC];
    maybeHeightChanged: [number];
  };
  interface ChainChannelBase {
    maybeHeight: number;
    toBlockGetterHelper(opts?: {
      maxHeight?: number;
      lastBlock?: Block;
    }): BlockGetterHelperSimpleInterface;
  }
}
