import {
  Aborter,
  EasyMap,
  safePromiseRace,
  sleep,
  Resolve,
  Resolvable,
  Inject,
  ModuleStroge,
} from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { ChainChannelHelper } from "./chainChannelHelper";

const { AbortException, TimeOutException } = CoreExceptionGenerator("channel", "chainChannelGroup");

export const GROUP_REQUESTER_BUILDER_ARGS = {
  OPTIONS: Symbol("options"),
};
type InQueneResult<R> = PromiseLike<R> & {
  finished?: boolean;
  resolved?: boolean;
  rejected?: boolean;
};
abstract class GroupRequesterBuilder<CC extends BFChainCore.SimpleChainChannel, R> {
  protected abstract _doRequest(
    cc: CC,
    opts: BFChainCore.ChannelRequestOptions<CC>,
  ): PromiseLike<R>;
  protected abstract helper: ChainChannelHelper;
  private _aborter = new Aborter();
  private _mixedOpts: BFChainCore.ChannelRequestOptions<CC>;
  constructor(protected opts?: BFChainCore.ChannelRequestBaseOptions<CC>) {
    this._mixedOpts = opts
      ? Object.create(opts, {
          aborter: {
            value: this._aborter,
          },
        })
      : { aborter: this._aborter };
  }
  private _inQueneTasks = new EasyMap<CC, PromiseLike<R>>((cc) => {
    const result: InQueneResult<R> = this._doRequest(cc, this._mixedOpts).then(
      (ret) => {
        result.resolved = result.finished = true;
        if (this._inQueneTasks.has(cc)) {
          /// 可能被移除了
          this._retCCMap.set(ret, cc);
        }
        return ret;
      },
      (reason) => {
        result.rejected = result.finished = true;
        if (this._inQueneTasks.has(cc)) {
          /// 可能被移除了
          this._retCCMap.set(reason, cc);
        }
        throw reason;
      },
    );
    return result;
  });
  private _retCCMap = new Map</* result */ R | unknown /* error */, CC>();

  addChainChannel(
    chainChannel: CC,
    options?: BFChainCore.AborterOptions<BFChainCore.ChannelRequestEnv<CC>>,
  ): Promise<R> {
    this._inQueneTasks.forceGet(chainChannel);
    return this.helper.wrapAborterOptions(
      safePromiseRace<PromiseLike<R>>(this._inQueneTasks.values()),
      options,
      { chainChannel },
    );
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
  removeChainChannelByResult(ret: /* result */ R | unknown /* error */) {
    const cc = this._retCCMap.get(ret);
    return cc ? this.removeChainChannel(cc) : false;
  }
  getChainChannelByResult(ret: /* result */ R | unknown /* error */) {
    return this._retCCMap.get(ret);
  }
  finish() {
    const finishInfo = this._getFinishInfo();
    this._aborter.abort(new AbortException(finishInfo.message, finishInfo.detail));
    this._inQueneTasks.clear();
    this._retCCMap.clear();
  }
}

export const GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS = {
  QUERY: Symbol("query"),
  SORT: Symbol("sort"),
  OPTIONS: GROUP_REQUESTER_BUILDER_ARGS.OPTIONS,
};
/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
@Resolvable()
export class GroupQueryTransactionsBuilder<
  CC extends BFChainCore.SimpleChainChannel,
  R = BFChainUtil.PromiseReturnType<CC["queryTransactions"]>
> extends GroupRequesterBuilder<CC, R> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.QUERY)
    public readonly query: BFChainCore.TransactionQueryOptionsJSON,
    @Inject(GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.SORT, { optional: true })
    public readonly sort?: BFChainCore.TransactionSortOptionsJSON,
    @Inject(GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.OPTIONS, { optional: true })
    opts?: BFChainCore.ChannelRequestBaseOptions<CC>,
  ) {
    super(opts);
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return (cc.queryTransactions(this.query, this.sort, opts) as unknown) as PromiseLike<R>;
  }
  getTimeoutExceptionInfo() {
    return [
      /**message */ "queryTransactions({query} / {sort}) timeout.",
      /**detail */
      {
        query: JSON.stringify(this.query),
        sort: JSON.stringify(this.sort),
      },
    ] as const;
  }
  protected _getFinishInfo(): { message?: string | undefined; detail?: any } {
    return { message: "finish queryTransactions from other chainChannel" };
  }
  static create<
    CC extends BFChainCore.SimpleChainChannel,
    R = BFChainUtil.PromiseReturnType<CC["queryTransactions"]>
  >(
    rootModuleMap: ModuleStroge,
    query: BFChainCore.TransactionQueryOptionsJSON,
    sort?: BFChainCore.TransactionSortOptionsJSON,
    opts?: BFChainCore.ChannelRequestBaseOptions<CC>,
  ) {
    return Resolve<GroupQueryTransactionsBuilder<CC, R>>(
      GroupQueryTransactionsBuilder,
      new ModuleStroge(
        [
          [GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.QUERY, query],
          [GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.SORT, sort],
          [GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.OPTIONS, opts],
        ],
        rootModuleMap,
      ),
    );
  }
}

export const GROUP_QUERY_BLOCK_BUILDER_ARGS = {
  QUERY: Symbol("query"),
  OPTIONS: GROUP_REQUESTER_BUILDER_ARGS.OPTIONS,
};
/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
@Resolvable()
export class GroupQueryBlockBuilder<
  CC extends BFChainCore.SimpleChainChannel,
  R = BFChainUtil.PromiseReturnType<CC["queryBlock"]>
> extends GroupRequesterBuilder<CC, R> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_QUERY_BLOCK_BUILDER_ARGS.QUERY)
    public readonly query: BFChainCore.BlockQueryOptionsJSON,
    @Inject(GROUP_QUERY_BLOCK_BUILDER_ARGS.OPTIONS, { optional: true })
    opts?: BFChainCore.ChannelRequestBaseOptions<CC>,
  ) {
    super(opts);
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return (cc.queryBlock(this.query, opts) as unknown) as PromiseLike<R>;
  }
  getTimeoutExceptionInfo() {
    return ["[TIMEOUT]: queryBlock({query}).", { query: this.query }] as const;
  }
  protected _getFinishInfo() {
    return { message: "finish queryBlock from other chainChannel" };
  }
  static create<
    CC extends BFChainCore.SimpleChainChannel,
    R = BFChainUtil.PromiseReturnType<CC["queryBlock"]>
  >(
    rootModuleMap: ModuleStroge,
    query: BFChainCore.BlockQueryOptionsJSON,
    opts?: BFChainCore.ChannelRequestBaseOptions<CC>,
  ) {
    return Resolve<GroupQueryBlockBuilder<CC, R>>(
      GroupQueryBlockBuilder,
      new ModuleStroge(
        [
          [GROUP_QUERY_BLOCK_BUILDER_ARGS.QUERY, query],
          [GROUP_QUERY_BLOCK_BUILDER_ARGS.OPTIONS, opts],
        ],
        rootModuleMap,
      ),
    );
  }
}
