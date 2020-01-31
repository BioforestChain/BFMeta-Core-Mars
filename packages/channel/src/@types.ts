declare namespace BFChainCore {
  //#region ChannelHelper
  type BroadcastNewTransactionEvents<DH extends ChainChannelInterface> = {
    startBroadcasting: BFChainUtil.EventInOut<{ chainChannelList: DH[] }, { break: boolean }>;
    broadcasted: BFChainUtil.EventInOut<
      {
        error: boolean;
        result: import("@bfchain/core-model-channel").NewTransactionReturnModel | Error;
        chainChannel: DH;
      },
      { break: boolean }
    >;
    endBroadcast: BFChainUtil.EventInOut<{ duraction: number }, any>;
  };
  type ChainChannelHanlderEventMap = {
    handleMessageError: {
      in: Error;
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
  type ChannelRequestOptions = {
    /**超时 */
    timeout?: number;
    /**红包的密码 */
    grabSecret?: string;
  };
  //#endregion

  interface ChainChannelInterface {
    /**发送响应数据 */
    postResponseMessage(
      req_id: number,
      cmd: import("@bfchain/core-model").DUPLEX_API_CMD,
      binary: Uint8Array,
    ): void;
    /**查询交易 */
    queryTransactions(
      query: BFChainCore.QueryTransactionArgJSON["query"],
      sort?: BFChainCore.QueryTransactionArgJSON["sort"],
      opts?: BFChainCore.ChannelRequestOptions,
    ): Promise<import("@bfchain/core-model").QueryTransactionReturnModel>;
    initBroadcastTransactionArg(
      transaction: BFChainCore.NewTransactionArgJSON["transaction"],
      opts?: BFChainCore.ChannelRequestOptions,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.NEW_TRANSACTION,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewTransactionReturnModel,
      BFChainCore.ChannelRequestOptions,
    ];
    /**广播交易体 */
    broadcastTransaction(
      transaction: BFChainCore.NewTransactionArgJSON["transaction"],
      opts?: BFChainCore.ChannelRequestOptions,
    ): Promise<import("@bfchain/core-model").NewTransactionReturnModel>;
    /**查询区块 */
    queryBlock(
      query: BFChainCore.QueryBlockArgJSON["query"],
      opts?: BFChainCore.ChannelRequestOptions,
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel>;
    findBlock<B extends Block = Block>(
      ...args: BFChainUtil.AllArgument<ChainChannelInterface["queryBlock"]>
    ): Promise<B | undefined>;
    /**广播区块 的传播参数 */
    initBroadcastBlockArg(
      blockInfo: BFChainCore.NewBlockArgJSON,
      opts?: BFChainCore.ChannelRequestOptions,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.NEW_BLOCK,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").NewBlockReturn,
      BFChainCore.ChannelRequestOptions | undefined,
    ];
    /**广播区块 */
    broadcastBlock(
      blockInfo: BFChainCore.NewBlockArgJSON,
      opts?: BFChainCore.ChannelRequestOptions,
    ): Promise<import("@bfchain/core-model").NewBlockReturn>;
    /**获取节点信息 的传播参数 */
    initGetPeerInfoArg(
      uid?: BFChainCore.GetPeerInfoArgJSON["uid"],
      opts?: BFChainCore.ChannelRequestOptions,
    ): readonly [
      import("@bfchain/core-model").DUPLEX_API_CMD.GET_PEER_INFO,
      Uint8Array,
      (params: Uint8Array | ArrayBuffer) => import("@bfchain/core-model").GetPeerInfoReturnModel,
      BFChainCore.ChannelRequestOptions | undefined,
    ];
    /**获取节点信息
     * 顺带统计延迟
     */
    getPeerInfo(
      uid?: BFChainCore.GetPeerInfoArgJSON["uid"],
      opts?: BFChainCore.ChannelRequestOptions,
    ): Promise<import("@bfchain/core-model").GetPeerInfoReturnModel>;
    /**处理接收到数据时的响应 */
    initOnMessage(): void;
  }

  interface ChainChannelGroupInterface<CC extends ChainChannelInterface> {
    groupName: string;
    size: number;
    forEach(hanlder: (chainChannel: CC, i: number) => any): void;
    include(chainChannel: CC): boolean;
    [Symbol.iterator](): IterableIterator<CC>;
    /**开始一个节点并发任务 */
    startParallelTask(
      task_id: string,
    ): {
      getFreeChainChannel: () => CC | Promise<CC>;
      freeChainChannel: (chainChannel: CC) => void;
      busyChainChannel: (chainChannel: CC) => void;
    };
    /**释放并发任务 */
    releaseParallelTask(task_id: string): false | undefined;
    /**
     * 查询交易
     */
    queryTransactions(
      query: BFChainUtil.FirstArgument<CC["queryTransactions"]>,
      sort?: BFChainUtil.SecondArgument<CC["queryTransactions"]>,
      opts?: BFChainUtil.ThirdArgument<CC["queryTransactions"]>,
      _resultGenerator?: import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock>,
    ): import("@bfchain/util").AsyncIteratorGenerator<TransactionInBlock>;
    /**
     * 广播交易体
     */
    broadcastTransaction(
      transaction: BFChainCore.NewTransactionArgJSON["transaction"],
      opts?: BFChainCore.ChannelRequestOptions & {
        max_parallel_num?: number;
      },
      event?: BFChainUtil.QueneEventEmitter<BFChainCore.BroadcastNewTransactionEvents<CC>>,
    ): Promise<
      | {
          chainChannel: CC;
          result: {
            error: boolean;
            result: import("@bfchain/core-model").NewTransactionReturnModel | Error;
            chainChannel: CC;
          };
        }[]
      | undefined
    >;
    /**
     * 查询区块
     */
    queryBlock(
      ...args: BFChainUtil.AllArgument<ChainChannelInterface["queryBlock"]>
    ): Promise<import("@bfchain/core-model").QueryBlockReturnModel>;
    findBlock<B extends Block = CommonBlock>(
      ...args: BFChainUtil.AllArgument<ChainChannelInterface["queryBlock"]>
    ): Promise<B | undefined>;
    /**
     * 广播区块
     */
    broadcastBlock(
      ...args: BFChainUtil.AllArgument<ChainChannelInterface["broadcastBlock"]>
    ): Promise<
      {
        chainChannel: CC;
        result: Promise<import("@bfchain/core-model").NewBlockReturn>;
      }[]
    >;
    getPeerInfo(
      ...args: BFChainUtil.AllArgument<ChainChannelInterface["getPeerInfo"]>
    ): Promise<import("@bfchain/core-model").PeerInfoModel | undefined>;
  }
}
