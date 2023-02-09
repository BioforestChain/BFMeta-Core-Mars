import {
  BaseHelper,
  BlobHelper,
  ChainTimeHelper,
  ConfigHelper,
  STORAGE_STRATEGY,
} from "@bfchain/core-helper";
import {
  Block,
  BlockQueryOptionsModel,
  ChainChannelMessageModel,
  CHANNEL_ARGS,
  CloseBlobArgModel,
  CloseBlobReturnModel,
  CommonResponse,
  DownloadTransactionArgModel,
  DownloadTransactionReturnModel,
  DUPLEX_API_CMD,
  ErrorMessage,
  GenesisBlock,
  GetPeerInfoReturnModel,
  IndexTransactionArgModel,
  IndexTransactionReturnModel,
  NewBlockArgModel,
  NewBlockReturn,
  NewTransactionArgModel,
  NewTransactionReturnModel,
  OpenBlobArgModel,
  OpenBlobReturnModel,
  PeerInfoModel,
  QueryBlockArgModel,
  QueryBlockReturnModel,
  QueryTransactionArgModel,
  QueryTransactionReturnModel,
  ReadBlobArgModel,
  ReadBlobReturnModel,
  REQUEST_LIMIT_STRATEGY,
  RESPONSE_STATUS,
  SomeBlockModel,
  Transaction,
  TransactionInBlock,
  TransactionIndexModel,
  TransactionQueryOptions,
  TransactionSortOptions,
  QueryTindexReturnModel,
  TransactionInBlockGetOptionsModel,
  GetTransactionInBlockArgModel,
  GetTransactionInBlockReturnModel,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Message } from "@bfchain/protobuf";
import {
  EasyMap,
  Inject,
  PromiseOut,
  QueneEventEmitterPro,
  Resolvable,
  sleep,
} from "@bfchain/util";
import { ChainChannelHelper } from "./chainChannelHelper";

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
  implements BFChainCore.ChainChannelBase
{
  public abstract getApiMaybeQueueTime(cmd: DUPLEX_API_CMD): number;
  public abstract maybeHeight: number;
  public abstract lastConsensusVersion: number;
  public abstract canQueryTransactions: boolean;
  public abstract canQueryBlock: boolean;
  public abstract canBroadcastTransaction: boolean;
  public abstract canBroadcastBlock: boolean;
  public abstract canQueryTindex: boolean;
  public abstract canGetTransactionInBlock: boolean;
  public abstract blobSupportAlgorithms: readonly BFChainCore.OpenBlobArgJSON.Algorithm[];
  protected abstract config: ConfigHelper;
  protected abstract baseHelper: BaseHelper;
  protected abstract blobHelper: BlobHelper;
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
    reqTask.reject(new TimeOutException(ERROR_LIST.REQID_REUSE));
    req_response_map.delete(req_id);
  }
  return req_id;
};

const REQRES_CMD_MAP = new Map([
  [DUPLEX_API_CMD.QUERY_TRANSACTION, DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN],
  [DUPLEX_API_CMD.INDEX_TRANSACTION, DUPLEX_API_CMD.INDEX_TRANSACTION_RETURN],
  [DUPLEX_API_CMD.DOWNLOAD_TRANSACTION, DUPLEX_API_CMD.DOWNLOAD_TRANSACTION_RETURN],
  [DUPLEX_API_CMD.NEW_TRANSACTION, DUPLEX_API_CMD.NEW_TRANSACTION_RETURN],
  [DUPLEX_API_CMD.QUERY_BLOCK, DUPLEX_API_CMD.QUERY_BLOCK_RETURN],
  [DUPLEX_API_CMD.NEW_BLOCK, DUPLEX_API_CMD.NEW_BLOCK_RETURN],
  [DUPLEX_API_CMD.GET_PEER_INFO, DUPLEX_API_CMD.GET_PEER_INFO_RETURN],
  [DUPLEX_API_CMD.OPEN_BLOB, DUPLEX_API_CMD.OPEN_BLOB_RETURN],
  [DUPLEX_API_CMD.READ_BLOB, DUPLEX_API_CMD.READ_BLOB_RETURN],
  [DUPLEX_API_CMD.CLOSE_BLOB, DUPLEX_API_CMD.CLOSE_BLOB_RETURN],
]);

/**message的最低版本号，低于这个版本号的message将不被处理 */
const MIN_MESSAGE_VERSION = 2;

/**
 * 为数据收发处理器包装数据处理
 */
@Resolvable()
export class ChainChannel<
    THIS extends BFChainCore.SimpleChainChannel = BFChainCore.SimpleChainChannel,
  >
  extends ChainChannelBase
  implements BFChainCore.ChainChannel<THIS>
{
  //#region chainChannel接口状态，查询默认为false，下载为true，广播默认为true
  get canQueryTransactions() {
    return false;
  }
  get canIndexTransactions() {
    return false;
  }
  get canDownloadTransactions() {
    return true;
  }
  get blobSupportAlgorithms() {
    return [] as readonly BFChainCore.OpenBlobArgJSON.Algorithm[];
  }
  get canQueryBlock() {
    return true;
  }
  get canBroadcastTransaction() {
    return true;
  }
  get canBroadcastBlock() {
    return true;
  }
  protected _canQueryTindex = false;
  get canQueryTindex() {
    return this._canQueryTindex;
  }
  protected _canGetTransactionInBlock = false;
  get canGetTransactionInBlock() {
    return this._canGetTransactionInBlock;
  }
  protected _limitQT = 100;
  /**单次查询交易的上限 */
  get limitQueryTransactions() {
    return this._limitQT;
  }
  protected _limitIT = 100;
  /**单次查询交易索引的上限 */
  get limitIndexTransactions() {
    return this._limitIT;
  }
  protected _limitDT = 100;
  /**单次查询交易索引的上限 */
  get limitDownloadTransactions() {
    return this._limitDT;
  }
  /**当前message的版本号，如果必须要求对方也升级，请同时修改 MIN_MESSAGE_VERSION */
  readonly MESSAGE_VERSION = 2;
  //#endregion

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
  @Inject(BlobHelper)
  protected blobHelper!: BlobHelper;
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
          reqTask.reject(new TimeOutException(ERROR_LIST.CHAINCHANNEL_CLOSED));
          req_response_map.delete(reqId);
        }
      }
      this._reqIdSet.clear();

      this.blobHelper.destroyTarget(this);
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
  private _delayCache?: { value: number };
  get delay() {
    if (this._delayCache) {
      return this._delayCache.value;
    }

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
    const delay = acc_delay / len || 0;
    /// 缓存计算结果
    this._delayCache = { value: delay };
    return delay;
  }
  /**存储延迟记录 */
  protected pushDelayHistroy(delay: number) {
    const { _delayHistroyList } = this;
    const LEN = _delayHistroyList.length;
    // 列表左移动一位
    _delayHistroyList.set(_delayHistroyList.subarray(1, LEN), 0);
    // 将新的数据放置到最后
    _delayHistroyList[LEN - 1] = delay;
    /// 清除缓存
    this._delayCache = undefined;
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
    return this.postChainChannelMessage(0, cmd, binary);
  }
  async _requestWithBinaryData<T>(
    cmd: DUPLEX_API_CMD,
    binary: Uint8Array,
    ResonseBoxer: (bytes: Uint8Array) => BFChainUtil.PromiseMaybe<T>,
    options = this.defaultReqOptions,
  ) {
    const req_id = getReqId();
    this._reqIdSet.add(req_id);
    await this.postChainChannelMessage(req_id, cmd, binary);
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
              return new TimeOutException(ERROR_LIST.CHAINCHANNEL_TIMEOUT, {
                endpoint: this.endpoint,
                cmd: DUPLEX_API_CMD[cmd],
              });
            },
          },
        }) as BFChainCore.ChannelRequestOptions<THIS>;
      }
      req_task = this.chainChannelHelper.wrapOutAborterOptions(req_task, options, {
        chainChannel: this as unknown as THIS,
      });
    }
    const res = await ResonseBoxer(await req_task.promise);
    //未统计信息创建的钩子
    await this.emit("afterRequestWithBinaryData", { cmd, query: binary, res });
    return res;
  }

  private _maybeQueneTimeFastCache?: {
    cache: Map<DUPLEX_API_CMD, number>;
    releaser: unknown;
  };
  private _getMaybeQueneTimeCache() {
    let maybeQueneTimeFastCache = this._maybeQueneTimeFastCache;
    if (maybeQueneTimeFastCache === undefined) {
      maybeQueneTimeFastCache = this._maybeQueneTimeFastCache = {
        cache: new Map(),
        /// 缓存有效期一个microtask的时间，在sort等操作中可以使用缓存
        releaser: queueMicrotask(() => (this._maybeQueneTimeFastCache = undefined)),
      };
    }
    return maybeQueneTimeFastCache.cache;
  }
  /**
   * 预估要得到收到某一个cmd预估的时间
   *
   * 比如要得到`queryTransactions`的响应时间，请使用`DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN`
   */
  getApiMaybeQueueTime(cmd: DUPLEX_API_CMD) {
    if ((cmd & DUPLEX_API_CMD.RESPONSE) === 0) {
      return 0;
    }

    const cache = this._getMaybeQueneTimeCache();
    let queneTime = cache.get(cmd);
    if (queneTime === undefined) {
      const limitInfo = this.reqresLimitInfoEM.get(cmd);
      if (limitInfo === undefined) {
        queneTime = 0;
      } else {
        const lockEndTime =
          limitInfo.preResponseTime + limitInfo.preResponseLimitConfig.lockTimespan;
        const waitTimespan = Math.max(0, lockEndTime - this.timeHelper.now());
        const postQuene = this._msgPostQuene.get(cmd);
        if (postQuene === undefined) {
          queneTime = waitTimespan;
        } else {
          queneTime =
            postQuene.taskList.length * limitInfo.preResponseLimitConfig.lockTimespan +
            waitTimespan;
        }
      }
      cache.set(cmd, queneTime);
    }
    return queneTime;
  }

  /**请求限制的缓存信息，这里每一种cmd都可以独立配置
   * 要区别的是，cmd其实是有分成两大类的
   *
   * 一类是主动发起的cmd：可以在这里通过这个cmd获取到 对方对我 的限制
   * 另外一类是被动返回的cmd：可以在这里通过这个cmd获取到 我对对方 的限制
   *
   */
  private readonly reqresLimitInfoEM = EasyMap.from({
    creater(cmd: DUPLEX_API_CMD) {
      return {
        preResponseTime: 0,
        preRefuseTime: 0,
        preResponseLimitConfig: {
          lockTimespan: 0,
          refuseTimespan: Infinity,
        },
      } as BFChainCore.ReqresLimitInfo;
    },
  });
  private _msgPostQuene = EasyMap.from({
    creater: (cmd: DUPLEX_API_CMD) => {
      const postQuene = {
        taskList: [] as {
          req_id: number;
          cmd: DUPLEX_API_CMD;
          binary: Uint8Array;
          sign: PromiseOut<void>;
        }[],
        running: false,
        looper: async () => {
          if (postQuene.running) {
            return;
          }
          postQuene.running = true;

          do {
            const task = postQuene.taskList.shift();
            if (task === undefined) {
              break;
            }
            const requestLimitInfo = this.reqresLimitInfoEM.get(cmd);
            /// 如果限制存在
            if (requestLimitInfo !== undefined) {
              /// 首先等待限制时间达成
              const reqlockTimespan =
                requestLimitInfo.preResponseTime +
                requestLimitInfo.preResponseLimitConfig.lockTimespan -
                this.timeHelper.now();
              if (reqlockTimespan > 0) {
                log(
                  "req chainChannel(%s) cmd:%d need wait %dms",
                  this.address,
                  task.cmd,
                  reqlockTimespan,
                );
                await sleep(reqlockTimespan);
              }
            }
            //#region 开始发送任务

            /// 如果任务已经被取消
            if (task.sign.is_rejected) {
              continue;
            }

            const resModel = ChainChannelMessageModel.fromObject({
              version: this.config.version,
              req_id: task.req_id,
              cmd: task.cmd,
              binary: task.binary,
              messageVersion: this.MESSAGE_VERSION,
            });
            this.endpoint.postMessage(resModel.getBytes());
            task.sign.resolve(); // 发送完成
            //#endregion

            //#region 等待任务完成再执行下一个

            const taskResponser = req_response_map.get(task.req_id);
            if (taskResponser) {
              await new Promise<void>((resolve) => taskResponser.onFinished(resolve));
            }
            //#endregion
          } while (postQuene.taskList.length > 0);

          this._msgPostQuene.delete(cmd);
        },
      };
      return postQuene;
    },
  });

  /**发送响应数据 */
  async postChainChannelMessage(req_id: number, cmd: DUPLEX_API_CMD, binary: Uint8Array) {
    if (this._closed) {
      return;
    }
    let lockTimespan = 0;
    let refuseTimespan = 0;

    /// 如果是请求指令，那么先进行自我约束
    if (REQRES_CMD_MAP.has(cmd)) {
      const requestLimitInfo = this.reqresLimitInfoEM.get(cmd);
      /// 如果有请求限制的约束，那么走遵循限制规整来进行逐个发送
      if (requestLimitInfo !== undefined) {
        const postQuene = this._msgPostQuene.forceGet(cmd);
        const sign = new PromiseOut<void>();
        postQuene.taskList.push({ req_id, cmd, binary, sign });
        postQuene.looper();
        return sign.promise;
      }
    }
    /// 如果是response指令，那么获取lockTime和refuseTime
    else if ((cmd & DUPLEX_API_CMD.RESPONSE) !== 0 && this.has("onGetResponseLimitConfig")) {
      let responseLimitInfo = this.reqresLimitInfoEM.get(cmd);
      const now = this.timeHelper.now();
      if (responseLimitInfo) {
        const preResponseLimitConfig = responseLimitInfo.preResponseLimitConfig;
        const preLockEndTime =
          (responseLimitInfo.preResponseTime || now) + preResponseLimitConfig.lockTimespan;
        /// 如果上一次的锁定已经完成了，那么等于滞空了这个锁定
        if (preLockEndTime < now) {
          responseLimitInfo = undefined;
          // this.reqresLimitInfoEM.delete(cmd);
        }
      }

      const limitConfig = await this.emit("onGetResponseLimitConfig", {
        cmd,
        requestLimitInfo: responseLimitInfo,
      });
      if (limitConfig !== undefined) {
        responseLimitInfo = responseLimitInfo || this.reqresLimitInfoEM.forceGet(cmd);
        responseLimitInfo.preResponseTime = now;
        responseLimitInfo.preResponseLimitConfig = limitConfig;
        lockTimespan = limitConfig.lockTimespan;
        refuseTimespan = limitConfig.refuseTimespan;
      }
    }

    const resModel = ChainChannelMessageModel.fromObject({
      version: this.config.version,
      req_id,
      cmd,
      binary,
      lockTimespan,
      refuseTimespan,
      messageVersion: this.MESSAGE_VERSION,
    });
    return this.endpoint.postMessage(resModel.getBytes());
  }

  /**查询交易 */
  async queryTransactions<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canQueryTransactions) {
      return QueryTransactionReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(
          new RefuseException(ERROR_LIST.REFUSE_RESPONSE_QUERY_TRANSACTION),
        ),
      });
    }
    const arg = QueryTransactionArgModel.fromObject({
      query: TransactionQueryOptions.fromObject(query),
      sort: TransactionSortOptions.fromObject<TransactionSortOptions>(sort || {}),
    });
    const res = await this._request(
      DUPLEX_API_CMD.QUERY_TRANSACTION,
      arg,
      this.chainChannelHelper.boxQueryTransactionReturn as (
        params: ArrayBuffer | Uint8Array,
      ) => Promise<QueryTransactionReturnModel<T>>,
      opts,
    );
    await this._downloadBlobFromTibs(res.transactions);
    return res;
  }

  /**查询交易索引 */
  async indexTransactions(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canIndexTransactions) {
      return IndexTransactionReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(
          new RefuseException(ERROR_LIST.REFUSE_RESPONSE_INDEX_TRANSACTION),
        ),
      });
    }
    const arg = IndexTransactionArgModel.fromObject({
      query: TransactionQueryOptions.fromObject(query),
      sort: TransactionSortOptions.fromObject<TransactionSortOptions>(sort || {}),
    });
    return this._request(
      DUPLEX_API_CMD.INDEX_TRANSACTION,
      arg,
      this.chainChannelHelper.boxIndexTransactionReturn,
      opts,
    );
  }
  /**下载交易索引 */
  async downloadTransactions<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    tIndexes: BFChainCore.DownloadTransactionArgJSON["tIndexes"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canDownloadTransactions) {
      return DownloadTransactionReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(
          new RefuseException(ERROR_LIST.REFUSE_RESPONSE_DOWNLOAD_TRANSACTION),
        ),
      });
    }
    const arg = DownloadTransactionArgModel.fromObject({
      tIndexes: tIndexes.map((ti) => TransactionIndexModel.fromObject<TransactionIndexModel>(ti)),
    });
    const res = await this._request(
      DUPLEX_API_CMD.DOWNLOAD_TRANSACTION,
      arg,
      this.chainChannelHelper.boxDownloadTransactionReturn as (
        params: ArrayBuffer | Uint8Array,
      ) => Promise<DownloadTransactionReturnModel<T>>,
      opts,
    );

    await this._downloadBlobFromTibs(res.transactions);
    return res;
  }

  private _openedBlobs = new Set<number>();
  async openBlob(
    openArg: BFChainCore.OpenBlobArgJSON,
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.blobSupportAlgorithms.includes(openArg.algorithm)) {
      return OpenBlobReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException(ERROR_LIST.REFUSE_RESPONSE_OPEN_BLOB)),
      });
    }
    const arg = OpenBlobArgModel.fromObject(openArg);
    const openRes = await this._request(
      DUPLEX_API_CMD.OPEN_BLOB,
      arg,
      this.chainChannelHelper.boxOpenBlobReturn,
      opts,
    );
    if (openRes.descriptor > 0) {
      this._openedBlobs.add(openRes.descriptor);
    }
    return openRes;
  }

  async readBlob(
    blobInfo: BFChainCore.ReadBlobArgJSON,
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (this._openedBlobs.has(blobInfo.descriptor) === false) {
      return ReadBlobReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException(ERROR_LIST.REFUSE_RESPONSE_READ_BLOB)),
      });
    }
    const arg = ReadBlobArgModel.fromObject(blobInfo);
    return this._request(
      DUPLEX_API_CMD.READ_BLOB,
      arg,
      this.chainChannelHelper.boxReadBlobReturn,
      opts,
    );
  }
  async closeBlob(
    blobInfo: BFChainCore.CloseBlobArgJSON,
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (this._openedBlobs.has(blobInfo.descriptor) === false) {
      return CloseBlobReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException(ERROR_LIST.REFUSE_RESPONSE_CLOSE_BLOB)),
      });
    }
    const arg = CloseBlobArgModel.fromObject(blobInfo);
    const closeRes = await this._request(
      DUPLEX_API_CMD.CLOSE_BLOB,
      arg,
      this.chainChannelHelper.boxCloseBlobReturn,
      opts,
    );
    if (closeRes.status === RESPONSE_STATUS.success) {
      this._openedBlobs.delete(blobInfo.descriptor);
    }
    return closeRes;
  }

  async downloadBlob(openArg: BFChainCore.OpenBlobArgJSON) {
    const progress = {
      totalSize: -1,
      // current: -1,
      totalCount: -1,
      currentCount: -1,
    };
    if (await this.blobHelper.exists(openArg)) {
      return;
    }
    /// 打开连接
    const openRes = await this.openBlob(openArg);
    if (openRes.status === RESPONSE_STATUS.busy) {
      await sleep(5000); //
    }
    if (openRes.status !== RESPONSE_STATUS.success) {
      throw openRes.error;
    }
    const { chunkSize, expriedTime, descriptor, size, contentType } = openRes;
    if (size === 0) {
      return;
    }
    /// 申请存储位置
    const blob_prt = await this.blobHelper.requestStorage(openArg, size, chunkSize, contentType);
    try {
      // const startTime = this.timeHelper.now();
      const totalCount = Math.ceil(size / chunkSize);
      progress.totalSize = size;
      progress.totalCount = totalCount;
      progress.currentCount = 0;
      const tasks: (() => Promise<boolean>)[] = [];
      for (let index = 0; index < totalCount; index++) {
        tasks.push(() => {
          return new Promise<boolean>(async (resolve, reject) => {
            let retryTimes = 0;
            let isSuccess = false;
            while (retryTimes < 3) {
              try {
                // 超时了, 跳出循环, 重新申请
                // if (expriedTime <= this.timeHelper.now()) {
                //   break;
                // }
                const readRes = await this.readBlob({
                  descriptor,
                  start: chunkSize * index,
                  end: chunkSize * (index + 1),
                });
                if (readRes.status === RESPONSE_STATUS.busy) {
                  retryTimes++;
                  continue;
                }
                if (readRes.status !== RESPONSE_STATUS.success) {
                  throw readRes.error;
                }
                await this.blobHelper.saveChunk(blob_prt, index, readRes.chunkBuffer);
                isSuccess = true;
                break;
              } catch (error) {
                retryTimes++;
                // 休息一下，来杯玉叶凉茶
                await sleep(100);
              }
            }
            return resolve(isSuccess);
          });
        });
      }
      /// 并发下载
      let offset = 0;
      let isSuccess = true;
      while (true) {
        const tempTasks = tasks.slice(offset, offset + 3);
        if (tempTasks.length === 0) {
          break;
        }
        const results = await Promise.all(tempTasks.map((tempTask) => tempTask()));
        if (results.includes(false)) {
          isSuccess = false;
          break;
        }
        offset += tempTasks.length;
      }
      if (!isSuccess) {
        throw new RefuseException(ERROR_LIST.FAIL_TO_DOWNLOAD_BLOB, {
          hash: openArg.hash,
          strategy: STORAGE_STRATEGY.TEMPORARY,
        });
      }
      /// 还没完成, 却跳出来了. 说明请求超时了, 重新open并read
      // if (progress.currentCount < progress.totalCount) {
      //   await sleep(2000);
      // }
      /// 下载完成，保存成 blob 对象
      await this.blobHelper.saveAsBlob(blob_prt);
    } finally {
      /// 关闭连接
      await this.closeBlob({ descriptor });
    }
  }

  private async _downloadBlobFromTibs(tibs: Iterable<TransactionInBlock>) {
    for (const tib of tibs) {
      await this._downloadBlobFromTrs(tib.transaction);
    }
  }
  private async _downloadBlobFromTrs(trs: Transaction) {
    for (const [algorithm, hash] of trs.blobMap.values()) {
      await this.downloadBlob({ algorithm, hash });
    }
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
          new RefuseException(ERROR_LIST.REFUSE_RESPONSE_BROADCAST_TRANSACTION),
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
    await this._sendWithBinaryData(args[0], args[1]);
    return 1;
  }
  /**查询区块 */
  async queryBlock<B extends Block = Block>(
    query: BFChainCore.QueryBlockArgJSON["query"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canQueryBlock) {
      return QueryBlockReturnModel.fromObject<QueryBlockReturnModel<B>>({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(new RefuseException(ERROR_LIST.REFUSE_RESPONSE_QUERY_BLOCK)),
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
        error: ErrorMessage.fromObject(
          new RefuseException(ERROR_LIST.REFUSE_RESPONSE_BROADCAST_BLOCK),
        ),
      });
    }
    const res = await this._requestWithBinaryData(...this.initBroadcastBlockArg(blockInfo, opts));
    success("broadcasted block:", blockInfo.height);
    return res;
  }

  /**查询交易 */
  async queryTindexes(
    query: BFChainCore.QueryTransactionArgJSON["query"],
    sort?: BFChainCore.QueryTransactionArgJSON["sort"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canQueryTindex) {
      return QueryTindexReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(
          new RefuseException("Refuse response query transaction index"),
        ),
      });
    }
    const arg = QueryTransactionArgModel.fromObject({
      query: TransactionQueryOptions.fromObject(query),
      sort: TransactionSortOptions.fromObject<TransactionSortOptions>(sort || {}),
    });
    return this._request(
      DUPLEX_API_CMD.QUERY_TINDEX,
      arg,
      this.chainChannelHelper.boxQueryTindexReturn as (
        params: ArrayBuffer | Uint8Array,
      ) => Promise<QueryTindexReturnModel>,
      opts,
    );
  }
  async queryTransactionInBlocks<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    query: BFChainCore.GetTransactionInBlockArgJSON["query"],
    opts?: BFChainCore.ChannelRequestOptions<THIS>,
  ) {
    if (!this.canGetTransactionInBlock) {
      return GetTransactionInBlockReturnModel.fromObject({
        status: RESPONSE_STATUS.error,
        error: ErrorMessage.fromObject(
          new RefuseException("Refuse response query transactionInBlock"),
        ),
      });
    }
    const arg = GetTransactionInBlockArgModel.fromObject({
      query: TransactionInBlockGetOptionsModel.fromObject(query),
    });
    return this._request(
      DUPLEX_API_CMD.GET_TRANSACTIONINBLOCK,
      arg,
      this.chainChannelHelper.boxGetTransactionInBlockReturn as (
        params: ArrayBuffer | Uint8Array,
      ) => Promise<GetTransactionInBlockReturnModel<T>>,
      opts,
    );
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
        let msg: ChainChannelMessageModel;
        let reqMsgVersion: number;
        try {
          msg = ChainChannelMessageModel.decode(message);
          req_id = msg.req_id;
          cmd = msg.cmd;
          binary = msg.binary;
          reqMsgVersion = msg.messageVersion;
        } catch {
          throw new ArgumentFormatException(ERROR_LIST.MESSAGE_TYPE_ERROR);
        }
        if (reqMsgVersion < MIN_MESSAGE_VERSION) {
          //低于最低版本号的message不处理，也不返回，直接让对方超时
          return;
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
          //#region 根据反压协议进行响应

          /**请求是否依据承诺解锁限制了 */
          let reqUnLocked = true;

          if (
            REQRES_CMD_MAP.has(cmd)
            // cmd === DUPLEX_API_CMD.QUERY_TRANSACTION ||
            // cmd === DUPLEX_API_CMD.INDEX_TRANSACTION ||
            // cmd === DUPLEX_API_CMD.DOWNLOAD_TRANSACTION
          ) {
            const resCmd = cmd | DUPLEX_API_CMD.RESPONSE;

            const requestLimitInfo = this.reqresLimitInfoEM.get(resCmd);
            const now = this.timeHelper.now();
            /**数据请求的限制策略 */
            let requestLimitStrategy = REQUEST_LIMIT_STRATEGY.NOLIMIT;
            /// 如果有过限制配置，检查是否还在限制中
            if (requestLimitInfo) {
              const requestDiffTime = now - requestLimitInfo.preResponseTime;
              /// 如果请求时间还在限制的时间范围内，那么有可能会被拒绝响应
              if (requestDiffTime < requestLimitInfo.preResponseLimitConfig.lockTimespan) {
                /// 比约定时间提前了N毫秒收到请求，如果N大于refuseTime则表示提前太多，队列无法装下，直接refuse。否则返回busy,让请求端继续等待
                if (
                  requestLimitInfo.preResponseLimitConfig.lockTimespan - requestDiffTime >
                  requestLimitInfo.preResponseLimitConfig.refuseTimespan
                ) {
                  requestLimitStrategy = REQUEST_LIMIT_STRATEGY.REFUSE;
                } else {
                  requestLimitStrategy = REQUEST_LIMIT_STRATEGY.BUSY;
                }
              }
            }
            /// 在执行策略结果之前，允许开发者自行调整策略
            if (this.has("onBreakRequestLimit")) {
              const customPilicy = await this.emit("onBreakRequestLimit", {
                cmd,
                requestLimitStrategy,
                requestLimitInfo,
              });
              if (customPilicy !== undefined) {
                requestLimitStrategy = customPilicy.requestLimitStrategy;
                // useDefaultPolicy = false;
              }
            }
            /// 根最终决定的据策略做出决策
            if (requestLimitStrategy === REQUEST_LIMIT_STRATEGY.REFUSE) {
              if (requestLimitInfo) {
                requestLimitInfo.preRefuseTime = now; /// 在做响应的时候，可以尝试判断preRefuseTime来做出拒绝，减少带宽压力，这里默认保持响应，开发者根据这些信息做出调整
              }
              await this.postChainChannelMessage(req_id, DUPLEX_API_CMD.REFUSE, new Uint8Array(0));
              return;
            }
            if (requestLimitStrategy === REQUEST_LIMIT_STRATEGY.BUSY) {
              /// 请求的限制还在，可以直接返回busy
              reqUnLocked = false;
            }
          } else if ((cmd & DUPLEX_API_CMD.RESPONSE) !== 0) {
            //#region 如果是响应信息，将相应信息中携带的请求限制进行缓存
            const reqCmd = cmd - DUPLEX_API_CMD.RESPONSE;
            let responseLimitInfo = this.reqresLimitInfoEM.get(reqCmd);
            const { lockTimespan, refuseTimespan } = msg;
            const hasLimit = lockTimespan !== 0 || refuseTimespan !== 0;
            /// 如果没有过限制
            if (responseLimitInfo === undefined) {
              if (hasLimit) {
                responseLimitInfo = this.reqresLimitInfoEM.forceGet(reqCmd);
                responseLimitInfo.preResponseTime = this.timeHelper.now();
                responseLimitInfo.preResponseLimitConfig = { lockTimespan, refuseTimespan };
              }
            }
            /// 如果有过限制
            else {
              if (hasLimit === false) {
                this.reqresLimitInfoEM.delete(reqCmd);
              } else {
                /// 更新限制信息
                responseLimitInfo.preResponseTime = this.timeHelper.now();
                responseLimitInfo.preResponseLimitConfig = { lockTimespan, refuseTimespan };
              }
            }
            //#endregion
          }

          //#endregion

          switch (cmd) {
            /// 查询交易
            case DUPLEX_API_CMD.QUERY_TRANSACTION: {
              // 发送查询任务
              if (reqUnLocked && this.has("onQueryTransactionBinary")) {
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
              const queryResult =
                reqUnLocked && this.has("onQueryTransaction")
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
            /// 索引交易
            case DUPLEX_API_CMD.INDEX_TRANSACTION: {
              // 发送查询任务
              if (reqUnLocked && this.has("onIndexTransactionBinary")) {
                taskResultBinary = await this.emit(
                  "onIndexTransactionBinary",
                  await this.chainChannelHelper.boxIndexTransactionArg(binary),
                );
                break;
              }
              /**查询交易的响应，默认为繁忙 */
              const response = IndexTransactionReturnModel.fromObject<IndexTransactionReturnModel>({
                status: RESPONSE_STATUS.busy,
                // transactions:[]
              });
              const queryResult =
                reqUnLocked && this.has("onQueryTransaction")
                  ? await this.emit(
                      "onIndexTransaction",
                      await this.chainChannelHelper.boxIndexTransactionArg(binary),
                    )
                  : undefined;

              /// 查询成功
              if (queryResult) {
                response.status = RESPONSE_STATUS.success;
                response.tIndexes = queryResult.tIndexes.map((ti) =>
                  TransactionIndexModel.fromObject<TransactionIndexModel>(ti),
                );
              }
              // 绑定返回结果
              taskResult = response;
              break;
            }
            /// 下载交易
            case DUPLEX_API_CMD.DOWNLOAD_TRANSACTION: {
              // 发送查询任务
              if (reqUnLocked && this.has("onDownloadTransactionBinary")) {
                taskResultBinary = await this.emit(
                  "onDownloadTransactionBinary",
                  await this.chainChannelHelper.boxDownloadTransactionArg(binary),
                );
                break;
              }
              /**查询交易的响应，默认为繁忙 */
              const response =
                DownloadTransactionReturnModel.fromObject<DownloadTransactionReturnModel>({
                  status: RESPONSE_STATUS.busy,
                  // transactions:[]
                });
              const queryResult =
                reqUnLocked && this.has("onDownloadTransaction")
                  ? await this.emit(
                      "onDownloadTransaction",
                      await this.chainChannelHelper.boxDownloadTransactionArg(binary),
                    )
                  : undefined;

              /// 查询成功
              if (queryResult) {
                response.status = RESPONSE_STATUS.success;
                response.transactions = queryResult.transactions.map((ti) =>
                  TransactionInBlock.fromObject(ti),
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
                response.errorCode = broadcastResult.errorCode;
              }

              // 绑定返回结果
              taskResult = response;
              break;
            }
            case DUPLEX_API_CMD.OPEN_BLOB: {
              const response = OpenBlobReturnModel.fromObject<OpenBlobReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const openArg = await this.chainChannelHelper.boxOpenBlobArg(binary);
              const openResult = this.has("onOpenBlob")
                ? await this.emit("onOpenBlob", openArg)
                : await this.blobHelper.open(this, openArg);
              if (openResult) {
                response.status = RESPONSE_STATUS.success;

                response.descriptor = openResult.descriptor;
                response.contentType = openResult.contentType;
                response.size = openResult.size;
                response.chunkSize = openResult.chunkSize;
                response.expriedTime = openResult.expriedTime;
              }
              taskResult = response;
              break;
            }

            case DUPLEX_API_CMD.READ_BLOB: {
              const response = ReadBlobReturnModel.fromObject<ReadBlobReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const readArg = await this.chainChannelHelper.boxReadBlobArg(binary);
              const readResult = this.has("onReadBlob")
                ? await this.emit("onReadBlob", readArg)
                : await this.blobHelper.read(this, readArg);

              if (readResult) {
                response.status = RESPONSE_STATUS.success;

                response.chunkBuffer = readResult.chunkBuffer;
              }
              taskResult = response;
              break;
            }
            case DUPLEX_API_CMD.CLOSE_BLOB: {
              const response = CloseBlobReturnModel.fromObject<CloseBlobReturnModel>({
                status: RESPONSE_STATUS.busy,
              });
              const closeArg = await this.chainChannelHelper.boxCloseBlobArg(binary);
              const readResult = this.has("onCloseBlob")
                ? await this.emit("onCloseBlob", closeArg)
                : await this.blobHelper.close(this, closeArg);
              if (readResult) {
                response.status = RESPONSE_STATUS.success;
              }
              taskResult = response;
              break;
            }

            /// 查询区块
            case DUPLEX_API_CMD.QUERY_BLOCK: {
              if (reqUnLocked && this.has("onQueryBlockBinary")) {
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
              const queryResult =
                reqUnLocked && this.has("onQueryBlock")
                  ? await this.emit(
                      "onQueryBlock",
                      this.chainChannelHelper.boxQueryBlockArg(binary),
                    )
                  : undefined;

              /// 查询成功
              if (queryResult && queryResult.block !== undefined) {
                response.status = RESPONSE_STATUS.success;
                const block = queryResult.block;
                if (block) {
                  // 强制不传输交易
                  const proxyBlock = new Proxy<Block>(Block.fromObject(block), {
                    get(t, p, r) {
                      if (p === "transactions" || p === "transactionBufferList") {
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
            /// 查询 tIndex
            case DUPLEX_API_CMD.QUERY_TINDEX: {
              /**查询交易的响应，默认为繁忙 */
              const response = QueryTindexReturnModel.fromObject<QueryTindexReturnModel>({
                status: RESPONSE_STATUS.busy,
                // tIndexes: []
              });
              // 发送查询任务

              const queryResult = this.has("onQueryTindexes")
                ? await this.emit(
                    "onQueryTindexes",
                    await this.chainChannelHelper.boxQueryTransactionArg(binary),
                  )
                : undefined;

              /// 查询成功
              if (queryResult) {
                response.status = RESPONSE_STATUS.success;
                response.tIndexes = queryResult.tIndexes;
              }
              // 绑定返回结果
              taskResult = response;
              break;
            }
            /// 查询 transactionInBLock
            case DUPLEX_API_CMD.GET_TRANSACTIONINBLOCK: {
              /**查询交易的响应，默认为繁忙 */
              const response =
                GetTransactionInBlockReturnModel.fromObject<GetTransactionInBlockReturnModel>({
                  status: RESPONSE_STATUS.busy,
                  // transactionInBlocks: []
                });
              // 发送查询任务

              const queryResult = this.has("onGetTransactionInBlocks")
                ? await this.emit(
                    "onGetTransactionInBlocks",
                    await this.chainChannelHelper.boxGetTransactionInBlockArg(binary),
                  )
                : undefined;

              /// 查询成功
              if (queryResult) {
                response.status = RESPONSE_STATUS.success;
                response.transactionInBlocks = queryResult.transactionInBlocks.map((tib) =>
                  TransactionInBlock.fromObject(tib),
                );
              }
              // 绑定返回结果
              taskResult = response;
              break;
            }
            /// 响应信息
            case DUPLEX_API_CMD.QUERY_TRANSACTION_RETURN:
            case DUPLEX_API_CMD.INDEX_TRANSACTION_RETURN:
            case DUPLEX_API_CMD.DOWNLOAD_TRANSACTION_RETURN:
            case DUPLEX_API_CMD.NEW_TRANSACTION_RETURN:
            case DUPLEX_API_CMD.QUERY_BLOCK_RETURN:
            case DUPLEX_API_CMD.NEW_BLOCK_RETURN:
            case DUPLEX_API_CMD.GET_PEER_INFO_RETURN:
            case DUPLEX_API_CMD.OPEN_BLOB_RETURN:
            case DUPLEX_API_CMD.READ_BLOB_RETURN:
            case DUPLEX_API_CMD.CLOSE_BLOB_RETURN:
            case DUPLEX_API_CMD.QUERY_TINDEX_RETURN:
            case DUPLEX_API_CMD.GET_TRANSACTIONINBLOCK_RETURN:
            case DUPLEX_API_CMD.RESPONSE: {
              const task = req_response_map.get(req_id);
              if (task === undefined) {
                if (req_id !== 0) {
                  error(
                    new NoFoundException(ERROR_LIST.ONMESSAGE_GET_INVALID_REQ_ID, {
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
            case DUPLEX_API_CMD.REFUSE: {
              const task = req_response_map.get(req_id);
              if (task !== undefined) {
                task.reject(new RefuseException(ERROR_LIST.REQUEST_LIMIT));
                return;
              }
              /// 正常执行不应该执行到refuse这里，双方节点混乱，发生了不该发生的异常！不建议继续通讯，直接关闭
              this.close("chain channel refuse accpet data.");
              return;
            }
            default: {
              throw new ArgumentFormatException(ERROR_LIST.INVALID_MESSAGE_CMD, { cmd });
            }
          }
        } catch (error) {
          const errorResponse = commonHandle(
            CommonResponse.fromObject<CommonResponse>({
              status: RESPONSE_STATUS.error,
            }),
            error,
          );
          await this.postChainChannelMessage(
            req_id,
            REQRES_CMD_MAP.get(cmd) || DUPLEX_API_CMD.RESPONSE,
            CommonResponse.encode(errorResponse).finish(),
          );
          // 继续向外抛出错误
          throw error;
        }
        if (taskResultBinary) {
          await this.postChainChannelMessage(
            req_id,
            REQRES_CMD_MAP.get(cmd) || DUPLEX_API_CMD.RESPONSE,
            taskResultBinary,
          );
          return;
        }
        if (taskResult) {
          await this.postChainChannelMessage(
            req_id,
            REQRES_CMD_MAP.get(cmd) || DUPLEX_API_CMD.RESPONSE,
            // 将对象解析成二进制进行传输
            (taskResult.constructor as typeof CommonResponse).encode(taskResult).finish(),
          );
        }
      } catch (err) {
        this.emit("handleMessageError", { handleName: "onMessage", error: err as Error });
      }
    });
  }
}
