import { ConfigHelper, BaseHelper, ChainTimeHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import {
  RESPONSE_STATUS,
  ResponseModel,
  CHANNEL_ARGS,
  Block,
  PeerInfoModel,
  TransactionInBlock,
  TransactionQueryOptions,
  QueryTransactionArgModel,
  TransactionSortOptions,
  NewTransactionArgModel,
  GetPeerInfoArgModel,
  GetPeerInfoReturnModel,
  QueryTransactionReturnModel,
  ErrorMessage,
  NewTransactionReturnModel,
  CommonResponse,
  QueryBlockArgModel,
  QueryBlockReturnModel,
  NewBlockArgModel,
  NewBlockReturn,
  DUPLEX_API_CMD,
  BlockQueryOptionsModel,
  SomeBlockModel,
  GenesisBlock,
} from "@bfchain/core-model";
import { Message } from "@bfchain/protobuf";
import { ChainChannelHelper } from "./chainChannelHelper";
import {
  QueneEventEmitterPro,
  Inject,
  PromiseOut,
  sleep,
  unsleep,
  Resolvable,
} from "@bfchain/util";

const {
  ArgumentFormatException,
  NoFoundException,
  error,
  TimeOutException,
  ConsensusException,
} = CoreExceptionGenerator("channel", "chainChannel");

export abstract class ChainChannelBase extends QueneEventEmitterPro<
  BFChainCore.ChainChannelHanlderEventMap
> {
  protected abstract config: ConfigHelper;
  protected abstract baseHelper: BaseHelper;
  private _blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface & {
    maxHeight: number;
    lastBlock: Block;
  };
  abstract findBlock<B extends Block = Block>(
    query: BFChainCore.BlockQueryOptionsJSON,
    opts?: BFChainCore.ChannelRequestOptions | undefined,
  ): Promise<B | undefined>;

  /**
   * 导出成一个 blockGetterHel
   */
  toBlockGetterHelper(opts?: { maxHeight?: number; lastBlock?: Block }) {
    if (!this._blockGetterHelper) {
      this._blockGetterHelper = {
        getBlockByHeight: (height: number) => {
          return this.findBlock({ height });
        },
        getBlockBySignature: (signature: string) => {
          return this.findBlock({ signature });
        },
        maxHeight: 1,
        lastBlock: GenesisBlock.fromObject(this.config.genesisBlock),
        async getLastBlock() {
          if (this.lastBlock.height !== this.maxHeight) {
            const block = await this.getBlockByHeight(this.maxHeight);
            if (!block) {
              throw new NoFoundException();
            }
            this.lastBlock = block;
          }
          return this.lastBlock;
        },
      };
    }
    if (opts) {
      if (this.baseHelper.isPositiveFloatNotContainZero(opts.maxHeight)) {
        this._blockGetterHelper.maxHeight = opts.maxHeight;
      }
      if (opts.lastBlock) {
        this._blockGetterHelper.lastBlock = opts.lastBlock;
      }
    }
    return this._blockGetterHelper;
  }
}

/**
 * 为数据收发处理器包装数据处理
 */
@Resolvable()
export class ChainChannel extends ChainChannelBase implements BFChainCore.ChainChannel {
  @Inject("bfchain-core:TransactionCore")
  protected transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  @Inject(ChainChannelHelper)
  protected chainChannelHelper!: ChainChannelHelper;
  @Inject(ConfigHelper)
  protected config!: ConfigHelper;
  @Inject(BaseHelper)
  protected baseHelper!: BaseHelper;
  @Inject(ChainTimeHelper)
  protected timeHelper!: ChainTimeHelper;
  constructor(
    @Inject(CHANNEL_ARGS.ENDPOINT)
    public endpoint: BFChainCore.ChannelEndpointInterface,
  ) {
    super();
    this.initOnMessage();
    this.onError((err, args) => {
      if (args.eventname !== "handleMessageError") {
        const exception = new ConsensusException("emit {eventname}({arg}) fail:{error}", {
          eventname: args.eventname,
          arg: args.arg,
          error: err.stack,
        });
        this.emit("handleMessageError", exception);
      }
    });
  }
  get diffTime() {
    return 0;
  }
  onClose(
    handler: BFChainUtil.FirstArgument<BFChainCore.ChannelEndpointInterface["onClose"]>,
    once?: boolean,
  ) {
    if (once) {
      const remover = this.endpoint.onClose((err) => {
        handler(err);
        remover();
      });
      return remover;
    } else {
      return this.endpoint.onClose(handler);
    }
  }
  /**关闭双工连接 */
  close(reason?: string) {
    return this.endpoint.close(reason);
  }
  /**对方节点可能的高度 */
  protected _maybeHeight = 1;
  get maybeHeight() {
    return this._maybeHeight;
  }
  /**存储延迟的历史记录 */
  protected _delayHistroyList = new Float32Array(32);
  get delay() {
    const { _delayHistroyList } = this;
    let acc_delay = 0;
    let len = _delayHistroyList.length;
    for (let i = 0; i < _delayHistroyList.length; i += 1) {
      const _d = _delayHistroyList[i];
      if (_d) {
        acc_delay += _d;
      } else {
        len -= 1;
      }
    }
    return acc_delay / len;
  }
  /**存储延迟记录 */
  protected pushDelayHistroy(delay: number) {
    const { _delayHistroyList } = this;
    const LEN = _delayHistroyList.length;
    // 列表左移动一位
    _delayHistroyList.set(_delayHistroyList.subarray(1, LEN), 0);
    // 将新的数据放置到最后
    _delayHistroyList[LEN - 1] = delay;
  }
  /**请求的响应回调缓存 */
  readonly req_response_map = new Map<number | string, PromiseOut>();
  /**请求ID累加器 */
  protected _req_id_acc = new Uint32Array(1); // 使用Uint32类型，在超过过2**32后自动归零
  protected _request<T>(
    cmd: DUPLEX_API_CMD,
    data: Message,
    ResonseBoxer: (bytes: Uint8Array) => BFChainUtil.PromiseMaybe<T>,
    options?: BFChainCore.ChannelRequestOptions,
  ) {
    return this._requestWithBinaryData(cmd, this._requestDataToBinary(data), ResonseBoxer, options);
  }
  private _requestDataToBinary(data: Message) {
    return new Uint8Array((data.constructor as typeof Message).encode(data).finish());
  }
  async _requestWithBinaryData<T>(
    cmd: DUPLEX_API_CMD,
    binary: Uint8Array,
    ResonseBoxer: (bytes: Uint8Array) => BFChainUtil.PromiseMaybe<T>,
    options?: BFChainCore.ChannelRequestOptions,
  ) {
    const req_id = this._req_id_acc[0]++;
    this.postResponseMessage(req_id, cmd, binary);
    const req_task = new PromiseOut<Uint8Array>();
    if (options && this.baseHelper.isPositiveFloatNotContainZero(options.timeout)) {
      const timeoutTask = sleep(options.timeout, () => {
        req_task.reject(
          new TimeOutException(`Chain Channel Timeout, cmd:{cmd}, binary:{binary}`, {
            endpoint: this.endpoint,
            cmd: DUPLEX_API_CMD[cmd],
            binary,
          }),
        );
      });
      req_task.promise = req_task.promise.finally(() => {
        unsleep(timeoutTask);
      });
    }
    this.req_response_map.set(req_id, req_task);
    const res = await req_task.promise;
    return ResonseBoxer(res);
  }
  /**发送响应数据 */
  postResponseMessage(req_id: number, cmd: DUPLEX_API_CMD, binary: Uint8Array) {
    return this.endpoint.postMessage(
      ResponseModel.encode(
        ResponseModel.fromObject({
          version: this.config.version,
          req_id,
          cmd,
          binary,
        }),
      ).finish(),
    );
  }

  /**查询交易 */
  async queryTransactions(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelRequestOptions,
  ) {
    const arg = QueryTransactionArgModel.fromObject({
      query: TransactionQueryOptions.fromObject(query),
      sort: TransactionSortOptions.fromObject<TransactionSortOptions>(sort || {}),
    });
    return this._request(
      DUPLEX_API_CMD.QUERY_TRANSACTION,
      arg,
      await this.chainChannelHelper.boxQueryTransactionReturn,
      opts,
    );
  }
  async initBroadcastTransactionArg(
    transaction: BFChainCore.NewTransactionArgJSON["transaction"],
    opts: BFChainCore.ChannelRequestOptions = {},
  ) {
    const arg = NewTransactionArgModel.fromObject({
      transaction:
        transaction instanceof Message
          ? transaction
          : await this.transactionCore.recombineTransaction(transaction),
      grabSecret: opts.grabSecret,
    });

    return [
      DUPLEX_API_CMD.NEW_TRANSACTION,
      this._requestDataToBinary(arg),
      this.chainChannelHelper.boxNewTransactionReturn,
      opts,
    ] as const;
  }
  /**
   * 计算要到达某一个时间的差异时间
   * 如果返回值T<0，说明相对于远程节点来说，它们还差T才能到达对应的targetTime
   */
  calcDiffTimeToTargetTime(targetTime: number) {
    const now = this.timeHelper.now() + this.diffTime;
    return now - targetTime;
  }
  /**广播交易体 */
  async broadcastTransaction(
    transaction: BFChainCore.NewTransactionArgJSON["transaction"],
    opts?: BFChainCore.ChannelRequestOptions,
  ) {
    const args = await this.initBroadcastTransactionArg(transaction, opts);

    /// 算出相对事件是否满足条件
    const needWaitTime = -this.calcDiffTimeToTargetTime(
      this.timeHelper.getTimeByTimestamp(transaction.timestamp),
    );

    if (needWaitTime > 0) {
      await sleep(needWaitTime);
    }
    return this._requestWithBinaryData(...args);
  }
  /**查询区块 */
  async queryBlock<B extends Block = Block>(
    query: BFChainCore.QueryBlockArgJSON["query"],
    opts?: BFChainCore.ChannelRequestOptions,
  ) {
    const arg = QueryBlockArgModel.fromObject({
      query: BlockQueryOptionsModel.fromObject<BlockQueryOptionsModel>(query),
    });
    return this._request(
      DUPLEX_API_CMD.QUERY_BLOCK,
      arg,
      this.chainChannelHelper.boxQueryBlockReturn,
      opts,
    ) as Promise<QueryBlockReturnModel<B>>;
  }
  async findBlock<B extends Block = Block>(
    ...args: BFChainUtil.AllArgument<BFChainCore.ChainChannel["queryBlock"]>
  ) {
    const queryResult = await this.queryBlock(...args);
    return queryResult.someBlock && (queryResult.someBlock.block as B);
  }
  /**广播区块 的传播参数 */
  initBroadcastBlockArg(
    blockInfo: BFChainCore.NewBlockArgJSON,
    opts?: BFChainCore.ChannelRequestOptions,
  ) {
    const arg = NewBlockArgModel.fromObject(blockInfo);
    arg.generatorPublicKey = blockInfo.generatorPublicKey;
    return [
      DUPLEX_API_CMD.NEW_BLOCK,
      this._requestDataToBinary(arg),
      this.chainChannelHelper.boxNewBlockReturn,
      opts,
    ] as const;
  }
  /**广播区块 */
  broadcastBlock(blockInfo: BFChainCore.NewBlockArgJSON, opts?: BFChainCore.ChannelRequestOptions) {
    return this._requestWithBinaryData(...this.initBroadcastBlockArg(blockInfo, opts));
  }

  /**处理接收到数据时的响应 */
  initOnMessage() {
    this.endpoint.onMessage(async (message: Uint8Array) => {
      /* 测试了socket-io：
       * 使用client发送ArrayBuffer后，nodejs中server接收到的是Buffer。
       * 使用server发送ArrayBuffer，nodejs中client接收到的是Buffer，browser中client接收到的是ArrayBuffer
       * 其中 Buffer instanceof Uint8Array
       */
      try {
        let req_id: number;
        let cmd: DUPLEX_API_CMD;
        let binary: Uint8Array;
        try {
          const msg = ResponseModel.decode(message);
          req_id = msg.req_id;
          cmd = msg.cmd;
          binary = msg.binary;
        } catch {
          throw new ArgumentFormatException("message type error");
        }

        /**通用的响应对象 */
        let taskResult: CommonResponse | undefined;
        const commonHandle = (response: CommonResponse, err: any) => {
          response.status = RESPONSE_STATUS.error;
          response.error = ErrorMessage.fromException(err);
          return response;
        };
        const responseCmdMap = new Map([
          [DUPLEX_API_CMD.QUERY_TRANSACTION, DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN],
          [DUPLEX_API_CMD.NEW_TRANSACTION, DUPLEX_API_CMD.NEW_TRANSACTION_RETURN],
          [DUPLEX_API_CMD.QUERY_BLOCK, DUPLEX_API_CMD.QUERY_BLOCK_RETURN],
          [DUPLEX_API_CMD.NEW_BLOCK, DUPLEX_API_CMD.NEW_BLOCK_RETURN],
          [DUPLEX_API_CMD.GET_PEER_INFO, DUPLEX_API_CMD.GET_PEER_INFO_RETURN],
        ]);
        try {
          switch (cmd) {
            /// 查询交易
            case DUPLEX_API_CMD.QUERY_TRANSACTION: {
              /**查询交易的响应，默认为繁忙 */
              const response = QueryTransactionReturnModel.fromObject<QueryTransactionReturnModel>({
                status: RESPONSE_STATUS.busy,
                // transactions:[]
              });
              // 发送查询任务

              const queryResult = this.has("onQueryTransaction")
                ? await this.emit(
                    "onQueryTransaction",
                    await this.chainChannelHelper.boxQueryTransactionArg(binary),
                  )
                : undefined;

              /// 查询成功
              if (queryResult) {
                response.status = RESPONSE_STATUS.success;
                response.transactions = queryResult.transactions.map((tib) =>
                  TransactionInBlock.fromObject(tib),
                );
              }
              // 绑定返回结果
              taskResult = response;
              break;
            }
            /// 广播交易
            case DUPLEX_API_CMD.NEW_TRANSACTION: {
              /**广播交易的响应，默认为繁忙 */
              const response = NewTransactionReturnModel.fromObject<NewTransactionReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const broadcastResult = this.has("onNewTransaction")
                ? await this.emit(
                    "onNewTransaction",
                    await this.chainChannelHelper.boxNewTransactionArg(binary),
                  )
                : undefined;

              /// 广播成功
              if (broadcastResult) {
                response.status = RESPONSE_STATUS.success;
                response.minFee = broadcastResult.minFee;
                response.newTrsStatus = broadcastResult.newTrsStatus;
                response.refuseReason = broadcastResult.refuseReason;
              }

              // 绑定返回结果
              taskResult = response;
              break;
            }
            /// 查询区块
            case DUPLEX_API_CMD.QUERY_BLOCK: {
              /**广播交易的响应，默认为繁忙 */
              const response = QueryBlockReturnModel.fromObject<QueryBlockReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const queryResult = this.has("onQueryBlock")
                ? await this.emit("onQueryBlock", this.chainChannelHelper.boxQueryBlockArg(binary))
                : undefined;

              /// 查询成功
              if (queryResult && queryResult.block) {
                response.status = RESPONSE_STATUS.success;
                const block = queryResult.block;
                // 强制不传输交易
                block.transactions = [];
                response.someBlock = SomeBlockModel.fromObject({
                  block: Block.fromObject(block),
                });
              }

              taskResult = response;
              break;
            }
            /// 广播区块
            case DUPLEX_API_CMD.NEW_BLOCK: {
              /**广播区块的响应，默认为繁忙 */
              const response = NewBlockReturn.fromObject<NewBlockReturn>({
                status: RESPONSE_STATUS.busy,
              });
              const newBlockArg = this.chainChannelHelper.boxNewBlockArg(binary);
              // 将节点广播过来的区块高度进行缓存
              this._maybeHeight = newBlockArg.height;
              const broadcastResult = this.has("onNewBlock")
                ? await this.emit("onNewBlock", newBlockArg)
                : undefined;

              /// 广播成功
              if (broadcastResult) {
                response.status = RESPONSE_STATUS.success;
              }

              taskResult = response;
              break;
            }
            /// 节点信息
            case DUPLEX_API_CMD.GET_PEER_INFO: {
              /**节点信息的响应，默认为繁忙 */
              const response = GetPeerInfoReturnModel.fromObject<GetPeerInfoReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const infoResult = this.has("onGetPeerInfo")
                ? await this.emit(
                    "onGetPeerInfo",
                    this.chainChannelHelper.boxGetPeerInfoArg(binary),
                  )
                : undefined;

              /// 获取成功
              if (infoResult && infoResult.peerInfo) {
                response.status = RESPONSE_STATUS.success;
                response.peerInfo = PeerInfoModel.fromObject<PeerInfoModel>(infoResult.peerInfo);
              }

              taskResult = response;
              break;
            }
            /// 响应信息
            case DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN:
            case DUPLEX_API_CMD.NEW_TRANSACTION_RETURN:
            case DUPLEX_API_CMD.QUERY_BLOCK_RETURN:
            case DUPLEX_API_CMD.NEW_BLOCK_RETURN:
            case DUPLEX_API_CMD.GET_PEER_INFO_RETURN:
            case DUPLEX_API_CMD.RESPONSE: {
              const task = this.req_response_map.get(req_id);
              if (!task) {
                error(
                  new NoFoundException("onMessage get invalid req_id", {
                    req_id,
                  }),
                );
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
        } catch (error) {
          const errorResponse = commonHandle(
            CommonResponse.fromObject<CommonResponse>({
              status: RESPONSE_STATUS.error,
            }),
            error,
          );
          this.postResponseMessage(
            req_id,
            responseCmdMap.get(cmd) || DUPLEX_API_CMD.RESPONSE,
            CommonResponse.encode(errorResponse).finish(),
          );
          // 继续向外抛出错误
          throw error;
        }
        if (taskResult) {
          this.postResponseMessage(
            req_id,
            responseCmdMap.get(cmd) || DUPLEX_API_CMD.RESPONSE,
            // 将对象解析成二进制进行传输
            (taskResult.constructor as typeof CommonResponse).encode(taskResult).finish(),
          );
        }
      } catch (err) {
        this.emit("handleMessageError", err);
      }
    });
  }
}
