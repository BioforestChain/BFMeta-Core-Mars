import { Aborter, EasyMap, safePromiseRace, sleep } from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";

const { AbortException, TimeOutException } = CoreExceptionGenerator("channel", "chainChannelGroup");

abstract class GroupRequesterBuilder<CC extends BFChainCore.ChainChannel, R> {
  protected abstract _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions): PromiseLike<R>;
  private _aborter = new Aborter();
  private _mixedOpts: BFChainCore.ChannelRequestOptions;
  constructor(private opts?: Omit<BFChainCore.ChannelRequestOptions, "aborter" | "timeout">) {
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
    timeout: number = (chainChannel.delay || 0) + 3000,
  ): Promise<R> {
    this._inQueneTasks.forceGet(chainChannel);
    return safePromiseRace<PromiseLike<R>>([
      sleep(timeout, () => {
        const timeoutErr = this._getTimeoutExceptionInfo();
        throw new TimeOutException(timeoutErr.message, timeoutErr.detail);
      }),
      ...this._inQueneTasks.values(),
    ]);
  }
  protected abstract _getTimeoutExceptionInfo(): {
    message?: string | undefined;
    detail?: any;
  };
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
    private query: BFChainCore.TransactionQueryOptionsJSON,
    private sort?: BFChainCore.TransactionSortOptionsJSON,
    opts?: Omit<BFChainCore.ChannelRequestOptions, "aborter" | "timeout">,
  ) {
    super(opts);
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions) {
    return (cc.queryTransactions(this.query, this.sort, opts) as unknown) as PromiseLike<R>;
  }
  protected _getTimeoutExceptionInfo(): { message?: string | undefined; detail?: any } {
    return {
      message: "queryTransactions({query} / {sort}) timeout.",
      detail: {
        query: this.query,
        sort: this.sort,
      },
    };
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
    private query: BFChainCore.BlockQueryOptionsJSON,
    opts?: Omit<BFChainCore.ChannelRequestOptions, "aborter" | "timeout">,
  ) {
    super(opts);
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions) {
    return (cc.queryBlock(this.query, opts) as unknown) as PromiseLike<R>;
  }
  protected _getTimeoutExceptionInfo(): { message?: string | undefined; detail?: any } {
    return {
      message: "[TIMEOUT]: queryBlock({query}).",
      detail: { query: this.query },
    };
  }
  protected _getFinishInfo() {
    return { message: "finish queryBlock from other chainChannel" };
  }
}
