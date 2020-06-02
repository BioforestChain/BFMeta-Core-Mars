import { Aborter, EasyMap, safePromiseRace, sleep } from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";

const { AbortException, TimeOutException } = CoreExceptionGenerator("channel", "chainChannelGroup");

abstract class GroupRequesterBuilder<CC extends BFChainCore.ChainChannel, R> {
  protected abstract _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions): PromiseLike<R>;
  private _aborter = new Aborter();
  private _mixedOpts: BFChainCore.ChannelRequestOptions;
  constructor(private opts?: BFChainCore.ChannelRequestBaseOptions) {
    this._mixedOpts = Object.assign({}, this.opts, {
      aborter: this._aborter,
    });
  }
  private _inQueneTasks = new EasyMap<CC, PromiseLike<R>>((cc) => {
    return this._doRequest(cc, this._mixedOpts).then((ret) => {
      if (this._inQueneTasks.has(cc)) {
        /// 可能被移除了
        this._retCCMap.set(ret, cc);
      }
      return ret;
    });
  });
  private _retCCMap = new Map<R, CC>();

  addChainChannel(
    chainChannel: CC,
    opts: {
      timeout?: number;
      timeoutException?: Error | ((cc: CC) => Error);
    } = {},
  ): Promise<R> {
    this._inQueneTasks.forceGet(chainChannel);
    let { timeout = (chainChannel.delay || 0) + 3000, timeoutException } = opts;
    // chainChannel.address
    return safePromiseRace<PromiseLike<R>>([
      sleep(timeout, () => {
        if (!timeoutException) {
          timeoutException = new TimeOutException(...this.getTimeoutExceptionInfo(chainChannel));
        } else if (typeof timeoutException === "function") {
          timeoutException = timeoutException(chainChannel);
        }
        throw timeoutException;
      }),
      ...this._inQueneTasks.values(),
    ]);
  }
  abstract getTimeoutExceptionInfo(
    cc: CC,
  ): readonly [
    /**message */
    string | undefined,
    /**detail */
    unknown,
  ];
  protected abstract _getFinishInfo(): {
    message?: string | undefined;
    detail?: any;
  };
  removeChainChannel(chainChannel: CC) {
    return this._inQueneTasks.delete(chainChannel);
  }
  removeChainChannelByResult(ret: R) {
    const cc = this._retCCMap.get(ret);
    return cc ? this.removeChainChannel(cc) : false;
  }
  getChainChannelByResult(ret: R) {
    return this._retCCMap.get(ret);
  }
  finish() {
    const finishInfo = this._getFinishInfo();
    return this._aborter.abort(new AbortException(finishInfo.message, finishInfo.detail));
  }
}

/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
export class GroupQueryTransactionsBuilder<
  CC extends BFChainCore.ChainChannel,
  R = BFChainUtil.PromiseReturnType<CC["queryTransactions"]>
> extends GroupRequesterBuilder<CC, R> {
  constructor(
    public readonly query: BFChainCore.TransactionQueryOptionsJSON,
    public readonly sort?: BFChainCore.TransactionSortOptionsJSON,
    opts?: BFChainCore.ChannelRequestBaseOptions,
  ) {
    super(opts);
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions) {
    return (cc.queryTransactions(this.query, this.sort, opts) as unknown) as PromiseLike<R>;
  }
  getTimeoutExceptionInfo() {
    return [
      /**message */ "queryTransactions({query} / {sort}) timeout.",
      /**detail */
      {
        query: this.query,
        sort: this.sort,
      },
    ] as const;
  }
  protected _getFinishInfo(): { message?: string | undefined; detail?: any } {
    return { message: "finish queryTransactions from other chainChannel" };
  }
}

/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
export class GroupQueryBlockBuilder<
  CC extends BFChainCore.ChainChannel,
  R = BFChainUtil.PromiseReturnType<CC["queryBlock"]>
> extends GroupRequesterBuilder<CC, R> {
  constructor(
    public readonly query: BFChainCore.BlockQueryOptionsJSON,
    opts?: BFChainCore.ChannelRequestBaseOptions,
  ) {
    super(opts);
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions) {
    return (cc.queryBlock(this.query, opts) as unknown) as PromiseLike<R>;
  }
  getTimeoutExceptionInfo() {
    return ["[TIMEOUT]: queryBlock({query}).", { query: this.query }] as const;
  }
  protected _getFinishInfo() {
    return { message: "finish queryBlock from other chainChannel" };
  }
}
