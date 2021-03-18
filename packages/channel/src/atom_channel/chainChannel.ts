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
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { ConfigHelper, BaseHelper, ChainTimeHelper } from "@bfchain/core-helper";
import { QueneEventEmitterPro, Inject, PromiseOut, sleep, Resolvable } from "@bfchain/util";

const {
  RefuseException,
  ArgumentFormatException,
  NoFoundException,
  error,
  TimeOutException,
  success,
  log,
} = CoreExceptionGenerator("channel", "chainChannel");

export abstract class ChainChannelBase
  extends QueneEventEmitterPro<BFChainCore.ChainChannelHanlderEventMap>
  implements BFChainCore.ChainChannelBase {
  public abstract maybeHeight: number;
  public abstract lastConsensusVersion: number;
  public abstract canQueryTransaction: boolean;
  public abstract canQueryBlock: boolean;
  public abstract canBroadcastTransaction: boolean;
  public abstract canBroadcastBlock: boolean;
  protected abstract config: ConfigHelper;
  protected abstract baseHelper: BaseHelper;
  private _blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface & {
    maxHeight: number;
    lastBlock: Block;
  };
  abstract findBlock<B extends Block = Block>(
    query: BFChainCore.BlockQueryOptionsJSON,
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

/**请求的响应回调缓存 */
const req_response_map = new Map<number | string, PromiseOut<Uint8Array>>();
/**请求ID累加器 */
const _req_id_acc = new Uint32Array(1); // 使用Uint32类型，在超过过2**32后自动归零
const getReqId = () => {
  const req_id = _req_id_acc[0]++ || _req_id_acc[0]++;
  const reqTask = req_response_map.get(req_id);
  if (reqTask) {
    reqTask.reject(new TimeOutException("reqId reuse"));
    req_response_map.delete(req_id);
  }
  return req_id;
};
/**
 * 为数据收发处理器包装数据处理
 */
@Resolvable()
export class ChainChannel<
    THIS extends BFChainCore.SimpleChainChannel = BFChainCore.SimpleChainChannel
  >
  extends ChainChannelBase
  implements BFChainCore.ChainChannel<THIS> {
  /**查询默认为true 广播默认为false */
  protected _canQueryTransaction = true;
  get canQueryTransaction() {
    return this._canQueryTransaction;
  }
  protected _canQueryBlock = true;
  get canQueryBlock() {
    return this._canQueryBlock;
  }
  protected _canBroadcastTransaction = false;
  get canBroadcastTransaction() {
    return this._canBroadcastTransaction;
  }
  protected _canBroadcastBlock = false;
  get canBroadcastBlock() {
    return this._canBroadcastBlock;
  }
  get defaultReqOptions(): BFChainCore.ChannelRequestOptions<THIS> | undefined {
    return;
  }
  @Inject("bfchain-core:TransactionCore")
  protected transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  @Inject(ConfigHelper)
  protected config!: ConfigHelper;
  @Inject(BaseHelper)
  protected baseHelper!: BaseHelper;
  @Inject(ChainTimeHelper)
  protected timeHelper!: ChainTimeHelper;
  @Inject(ChainChannelHelper)
  protected chainChannelHelper!: ChainChannelHelper;
  constructor(
    @Inject(CHANNEL_ARGS.ENDPOINT)
    public endpoint: BFChainCore.ChannelEndpointInterface,
    @Inject(CHANNEL_ARGS.REFUSETIME, { optional: true })
    public readonly refuseTime = 1000,
  ) {
    super();
    this.initOnMessage();
    endpoint.onClose(() => {
      this._closed = true;
      for (const reqId of this._reqIdSet) {
        const reqTask = req_response_map.get(reqId);
        if (reqTask) {
          reqTask.reject(new TimeOutException("chainChannel closed"));
          req_response_map.delete(reqId);
        }
      }
      this._reqIdSet.clear();
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
  private _closed = false;
  /**关闭双工连接 */
  close(reason?: string) {
    return this.endpoint.close(reason);
  }
  /**对方节点可能的高度 */
  protected _maybeHeight = 1;
  get maybeHeight() {
    return this._maybeHeight;
  }
  /**最高的补丁共识版本 */
  protected _lastConsensusVersion = 1;
  get lastConsensusVersion() {
    return this._lastConsensusVersion;
  }
  /**节点的地址身份 */
  protected _address = "";
  get address() {
    return this._address;
  }
  set address(v: string) {
    this._address = v;
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
    return acc_delay / len || 0;
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
  protected _request<T>(
    cmd: DUPLEX_API_CMD,
    data: Message,
    ResonseBoxer: (bytes: Uint8Array) => BFChainUtil.PromiseMaybe<T>,
    options?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    return this._requestWithBinaryData(cmd, this._requestDataToBinary(data), ResonseBoxer, options);
  }
  private _requestDataToBinary(data: Message) {
    return new Uint8Array((data.constructor as typeof Message).encode(data).finish());
  }
  private _reqIdSet = new Set<number>();
  _sendWithBinaryData(cmd: DUPLEX_API_CMD, binary: Uint8Array) {
    this.postResponseMessage(0, cmd, binary);
  }
  async _requestWithBinaryData<T>(
    cmd: DUPLEX_API_CMD,
    binary: Uint8Array,
    ResonseBoxer: (bytes: Uint8Array) => BFChainUtil.PromiseMaybe<T>,
    options = this.defaultReqOptions,
  ) {
    const req_id = getReqId();
    this._reqIdSet.add(req_id);
    this.postResponseMessage(req_id, cmd, binary);
    let req_task = new PromiseOut<Uint8Array>();
    req_task.onFinished(() => {
      req_response_map.delete(req_id);
      this._reqIdSet.delete(req_id);
    });
    req_response_map.set(req_id, req_task);

    if (options) {
      if (!options.timeout) {
        options.timeout = 1000;
      }
      if (options.timeoutException === undefined) {
        options = Object.create(options, {
          timeoutException: {
            get() {
              return new TimeOutException(`ChainChannel Timeout: cmd:{cmd}`, {
                endpoint: this.endpoint,
                cmd: DUPLEX_API_CMD[cmd],
              });
            },
          },
        }) as BFChainCore.ChannelRequestOptions<THIS>;
      }
      req_task = this.chainChannelHelper.wrapOutAborterOptions(req_task, options, {
        chainChannel: (this as unknown) as THIS,
      });
    }
    const res = await ResonseBoxer(await req_task.promise);
    //未统计信息创建的钩子
    await this.emit("afterRequestWithBinaryData", { cmd, query: binary, res });
    return res;
  }
  /**发送响应数据 */
  postResponseMessage(req_id: number, cmd: DUPLEX_API_CMD, binary: Uint8Array) {
    if (this._closed) {
      return;
    }
    return this.endpoint.postMessage(
      ResponseModel.fromObject({
        version: this.config.version,
        req_id,
        cmd,
        binary,
      }).getBytes(),
    );
  }

  /**查询交易 */
  async queryTransactions<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canQueryTransaction) {
      return QueryTransactionReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException("Refuse response query transaction")),
      });
    }
    const arg = QueryTransactionArgModel.fromObject({
      query: TransactionQueryOptions.fromObject(query),
      sort: TransactionSortOptions.fromObject<TransactionSortOptions>(sort || {}),
    });
    return this._request(
      DUPLEX_API_CMD.QUERY_TRANSACTION,
      arg,
      this.chainChannelHelper.boxQueryTransactionReturn as (
        params: ArrayBuffer | Uint8Array,
      ) => Promise<QueryTransactionReturnModel<T>>,
      opts,
    );
  }
  async initBroadcastTransactionArg(
    transaction: BFChainCore.NewTransactionArgJSON["transaction"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    const arg = NewTransactionArgModel.fromObject({
      transaction:
        transaction instanceof Message
          ? transaction
          : await this.transactionCore.recombineTransaction(transaction),
      grabSecret: opts?.grabSecret,
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
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canBroadcastTransaction) {
      return NewTransactionReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(
          new RefuseException("Refuse response broadcast transaction"),
        ),
      });
    }
    const args = await this.initBroadcastTransactionArg(transaction, opts);

    /// 算出相对事件是否满足条件
    const needWaitTime = -this.calcDiffTimeToTargetTime(
      this.timeHelper.getTimeByTimestamp(transaction.timestamp),
    );

    if (needWaitTime > 0) {
      log(
        "chainChannel(%s) seems in feature. need wait %dms then broadcast.",
        this.address,
        needWaitTime,
      );
      await sleep(needWaitTime);
    }
    const res = await this._requestWithBinaryData(...args);
    success(
      "broadcasted Transaction(%s)",
      this.transactionCore.transactionHelper.getTypeName(transaction.type),
      transaction.asset,
    );
    return res;
  }
  /**
   * 最后一次拒绝的时间, 对方是否拒绝单向推送新交易
   * 1s 后会恢复推送
   */
  private _busyNewTransaction = 0;
  get isRefusePushNewTransaction() {
    if (!this.canBroadcastTransaction) {
      return true;
    }
    return this._busyNewTransaction > this.timeHelper.now() - this.refuseTime;
  }
  /**
   * 快速广播,无回调
   */
  async fastBroadcastTransaction(transaction: BFChainCore.NewTransactionArgJSON["transaction"]) {
    if (this.isRefusePushNewTransaction) {
      return 0;
    }
    const args = await this.initBroadcastTransactionArg(transaction);
    this._sendWithBinaryData(args[0], args[1]);
    return 1;
  }
  /**查询区块 */
  async queryBlock<B extends Block = Block>(
    query: BFChainCore.QueryBlockArgJSON["query"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canQueryBlock) {
      return QueryBlockReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException("Refuse response query block")),
      });
    }
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
    query: BFChainCore.QueryBlockArgJSON["query"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    const queryResult = await this.queryBlock(query, opts);
    return queryResult.someBlock && (queryResult.someBlock.block as B);
  }
  /**广播区块 的传播参数 */
  initBroadcastBlockArg(
    blockInfo: BFChainCore.NewBlockArgJSON,
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
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
  async broadcastBlock(
    blockInfo: BFChainCore.NewBlockArgJSON,
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canBroadcastBlock) {
      return NewBlockReturn.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException("Refuse response broadcast block")),
      });
    }
    const res = await this._requestWithBinaryData(...this.initBroadcastBlockArg(blockInfo, opts));
    success("broadcasted block:", blockInfo.height);
    return res;
  }

  /**处理接收到数据时的响应 */
  initOnMessage() {
    const responseCmdMap = new Map([
      [DUPLEX_API_CMD.QUERY_TRANSACTION, DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN],
      [DUPLEX_API_CMD.NEW_TRANSACTION, DUPLEX_API_CMD.NEW_TRANSACTION_RETURN],
      [DUPLEX_API_CMD.QUERY_BLOCK, DUPLEX_API_CMD.QUERY_BLOCK_RETURN],
      [DUPLEX_API_CMD.NEW_BLOCK, DUPLEX_API_CMD.NEW_BLOCK_RETURN],
      [DUPLEX_API_CMD.GET_PEER_INFO, DUPLEX_API_CMD.GET_PEER_INFO_RETURN],
    ]);
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
        let taskResultBinary: Uint8Array | undefined;
        const commonHandle = (response: CommonResponse, err: any) => {
          response.status = RESPONSE_STATUS.error;
          response.error = ErrorMessage.fromException(err);
          return response;
        };
        try {
          switch (cmd) {
            /// 查询交易
            case DUPLEX_API_CMD.QUERY_TRANSACTION: {
              // 发送查询任务
              if (this.has("onQueryTransactionBinary")) {
                taskResultBinary = await this.emit(
                  "onQueryTransactionBinary",
                  await this.chainChannelHelper.boxQueryTransactionArg(binary),
                );
                break;
              }

              /**查询交易的响应，默认为繁忙 */
              const response = QueryTransactionReturnModel.fromObject<QueryTransactionReturnModel>({
                status: RESPONSE_STATUS.busy,
                // transactions:[]
              });
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
              if (this.has("onQueryBlockBinary")) {
                taskResultBinary = await this.emit(
                  "onQueryBlockBinary",
                  this.chainChannelHelper.boxQueryBlockArg(binary),
                );
                break;
              }

              /**广播交易的响应，默认为繁忙 */
              const response = QueryBlockReturnModel.fromObject<QueryBlockReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const queryResult = this.has("onQueryBlock")
                ? await this.emit("onQueryBlock", this.chainChannelHelper.boxQueryBlockArg(binary))
                : undefined;

              /// 查询成功
              if (queryResult && queryResult.block !== undefined) {
                response.status = RESPONSE_STATUS.success;
                const block = queryResult.block;
                if (block) {
                  // 强制不传输交易
                  const proxyBlock = new Proxy<Block>(Block.fromObject(block), {
                    get(t, p, r) {
                      if (p === "transactions") {
                        return [];
                      }
                      return Reflect.get(t, p, r);
                    },
                  });
                  response.someBlock = SomeBlockModel.fromObject({
                    block: proxyBlock,
                  });
                }
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
              const task = req_response_map.get(req_id);
              if (!task) {
                if (req_id !== 0) {
                  error(
                    new NoFoundException("onMessage get invalid req_id", {
                      req_id,
                    }),
                  );
                } else {
                  /**
                   * 对req_id==0的进行优化处理
                   * 因为是单向请求(推送), 如果对方主动回馈是"繁忙", 那么就短时间内暂停推送
                   */
                  if (cmd === DUPLEX_API_CMD.NEW_TRANSACTION_RETURN) {
                    const { status } = this.chainChannelHelper.boxNewTransactionReturn(binary);
                    if (status === RESPONSE_STATUS.busy) {
                      this._busyNewTransaction = this.timeHelper.now();
                    }
                  }
                }
                return;
              }
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
        if (taskResultBinary) {
          this.postResponseMessage(
            req_id,
            responseCmdMap.get(cmd) || DUPLEX_API_CMD.RESPONSE,
            taskResultBinary,
          );
          return;
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
        this.emit("handleMessageError", { handleName: "onMessage", error: err });
      }
    });
  }
}
