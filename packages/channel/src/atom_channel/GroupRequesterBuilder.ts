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
import type {
  DownloadTransactionReturnModel,
  IndexTransactionReturnModel,
  QueryTransactionReturnModel,
} from "@bfchain/core-model-channel";
import type { Transaction } from "@bfchain/core-model";

const { AbortException, TimeOutException } = CoreExceptionGenerator("channel", "chainChannelGroup");

export const GROUP_REQUESTER_BUILDER_ARGS = {
  OPTIONS: Symbol("options"),
};
type InQueneResult<R> = PromiseLike<R> & {
  finished?: boolean;
  resolved?: boolean;
  rejected?: boolean;
};
export abstract class GroupRequesterBuilder<CC extends BFChainCore.SimpleChainChannel, R> {
  protected abstract _doRequest(
    cc: CC,
    opts?: BFChainCore.ChannelRequestOptions<CC>,
  ): PromiseLike<R>;
  protected abstract helper: ChainChannelHelper;

  private _inQueneTaskMap = new Map<CC, PromiseLike<R>>();
  /**生成任务 */
  private _generateQueneTask = (
    cc: CC,
    options?: BFChainCore.AborterOptions<BFChainCore.ChannelRequestEnv<CC>>,
  ) => {
    const result: InQueneResult<R> = this._doRequest(cc, options).then(
      (ret) => {
        result.resolved = result.finished = true;
        if (this._inQueneTaskMap.has(cc)) {
          /// 可能被移除了
          this._retCCMap.set(ret, cc);
        }
        return ret;
      },
      (reason) => {
        result.rejected = result.finished = true;
        if (this._inQueneTaskMap.has(cc)) {
          /// 可能被移除了
          this._retCCMap.set(reason, cc);
        }
        throw reason;
      },
    );
    return result;
  };
  private _retCCMap = new Map</* result */ R | unknown /* error */, CC>();

  addChainChannel(
    chainChannel: CC,
    options?: BFChainCore.AborterOptions<BFChainCore.ChannelRequestEnv<CC>>,
  ): Promise<R> {
    if (!this._inQueneTaskMap.has(chainChannel)) {
      this._inQueneTaskMap.set(chainChannel, this._generateQueneTask(chainChannel, options));
    }
    return this.helper.wrapAborterOptions(
      safePromiseRace<PromiseLike<R>>(this._inQueneTaskMap.values()),
      options,
      { chainChannel },
    );
  }
  removeChainChannel(chainChannel: CC) {
    return this._inQueneTaskMap.delete(chainChannel);
  }
  removeChainChannelByResult(ret: /* result */ R | unknown /* error */) {
    const cc = this._retCCMap.get(ret);
    return cc ? this.removeChainChannel(cc) : false;
  }
  getChainChannelByResult(ret: /* result */ R | unknown /* error */) {
    return this._retCCMap.get(ret);
  }
  finish() {
    this._inQueneTaskMap.clear();
    this._retCCMap.clear();
  }
}

export const GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS = {
  QUERY: Symbol("query"),
  SORT: Symbol("sort"),
};

/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
@Resolvable()
export class GroupQueryTransactionsBuilder<
  CC extends BFChainCore.SimpleChainChannel,
  T extends Transaction = Transaction,
> extends GroupRequesterBuilder<CC, QueryTransactionReturnModel<T>> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.QUERY)
    public readonly query: BFChainCore.TransactionQueryOptionsJSON,
    @Inject(GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.SORT, { optional: true })
    public readonly sort?: BFChainCore.TransactionSortOptionsJSON,
  ) {
    super();
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return cc.queryTransactions<T>(this.query, this.sort, opts);
  }

  static create<CC extends BFChainCore.SimpleChainChannel, T extends Transaction = Transaction>(
    rootModuleMap: ModuleStroge,
    query: BFChainCore.TransactionQueryOptionsJSON,
    sort?: BFChainCore.TransactionSortOptionsJSON,
  ) {
    return Resolve<GroupQueryTransactionsBuilder<CC, T>>(
      GroupQueryTransactionsBuilder,
      new ModuleStroge(
        [
          [GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.QUERY, query],
          [GROUP_QUERY_TRANSACTIONS_BUILDER_ARGS.SORT, sort],
        ],
        rootModuleMap,
      ),
    );
  }
}

export const GROUP_INDEX_TRANSACTIONS_BUILDER_ARGS = {
  QUERY: Symbol("query"),
  SORT: Symbol("sort"),
};

/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
@Resolvable()
export class GroupIndexTransactionsBuilder<
  CC extends BFChainCore.SimpleChainChannel,
> extends GroupRequesterBuilder<CC, IndexTransactionReturnModel> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_INDEX_TRANSACTIONS_BUILDER_ARGS.QUERY)
    public readonly query: BFChainCore.TransactionQueryOptionsJSON,
    @Inject(GROUP_INDEX_TRANSACTIONS_BUILDER_ARGS.SORT, { optional: true })
    public readonly sort?: BFChainCore.TransactionSortOptionsJSON,
  ) {
    super();
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return cc.indexTransactions(this.query, this.sort, opts);
  }

  static create<CC extends BFChainCore.SimpleChainChannel>(
    rootModuleMap: ModuleStroge,
    query: BFChainCore.TransactionQueryOptionsJSON,
    sort?: BFChainCore.TransactionSortOptionsJSON,
  ) {
    return Resolve<GroupIndexTransactionsBuilder<CC>>(
      GroupIndexTransactionsBuilder,
      new ModuleStroge(
        [
          [GROUP_INDEX_TRANSACTIONS_BUILDER_ARGS.QUERY, query],
          [GROUP_INDEX_TRANSACTIONS_BUILDER_ARGS.SORT, sort],
        ],
        rootModuleMap,
      ),
    );
  }
}

export const GROUP_DOWNLOAD_TRANSACTIONS_API_BUILDER_ARGS = {
  TINDEXES: Symbol("tIndexes"),
};
/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
@Resolvable()
export class GroupDownloadTransactionsBuilder<
  CC extends BFChainCore.SimpleChainChannel,
  T extends Transaction = Transaction,
> extends GroupRequesterBuilder<CC, DownloadTransactionReturnModel<T>> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_DOWNLOAD_TRANSACTIONS_API_BUILDER_ARGS.TINDEXES)
    public readonly tIndexes: BFChainCore.TransactionIndexJSON[],
  ) {
    super();
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return cc.downloadTransactions<T>(this.tIndexes, opts);
  }

  static create<CC extends BFChainCore.SimpleChainChannel, T extends Transaction = Transaction>(
    rootModuleMap: ModuleStroge,
    tIndexes: BFChainCore.TransactionIndexJSON[],
  ) {
    return Resolve<GroupDownloadTransactionsBuilder<CC, T>>(
      GroupDownloadTransactionsBuilder,
      new ModuleStroge(
        [[GROUP_DOWNLOAD_TRANSACTIONS_API_BUILDER_ARGS.TINDEXES, tIndexes]],
        rootModuleMap,
      ),
    );
  }
}

export const GROUP_QUERY_BLOCK_BUILDER_ARGS = {
  QUERY: Symbol("query"),
};
/**
 * 数据请求器，确保重复的请求不会重复发起
 * @TODO 使用 ccbase 将请求参数一次性序列化好
 */
@Resolvable()
export class GroupQueryBlockBuilder<
  CC extends BFChainCore.SimpleChainChannel,
  R = BFChainUtil.PromiseReturnType<CC["queryBlock"]>,
> extends GroupRequesterBuilder<CC, R> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_QUERY_BLOCK_BUILDER_ARGS.QUERY)
    public readonly query: BFChainCore.BlockQueryOptionsJSON,
  ) {
    super();
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return cc.queryBlock(this.query, opts) as unknown as PromiseLike<R>;
  }
  getTimeoutExceptionInfo() {
    return ["[TIMEOUT]: queryBlock({query}).", { query: this.query }] as const;
  }
  protected _getFinishInfo() {
    return { message: "finish queryBlock from other chainChannel" };
  }
  static create<
    CC extends BFChainCore.SimpleChainChannel,
    R = BFChainUtil.PromiseReturnType<CC["queryBlock"]>,
  >(
    rootModuleMap: ModuleStroge,
    query: BFChainCore.BlockQueryOptionsJSON,
    opts?: BFChainCore.ChannelRequestBaseOptions<CC>,
  ) {
    return Resolve<GroupQueryBlockBuilder<CC, R>>(
      GroupQueryBlockBuilder,
      new ModuleStroge([[GROUP_QUERY_BLOCK_BUILDER_ARGS.QUERY, query]], rootModuleMap),
    );
  }
}

export const GROUP_QUERY_TRANSACTIONS_INDEX_BUILDER_ARGS = {
  QUERY: Symbol("query"),
};
@Resolvable()
export class GroupQueryTransactionsByTIndexBuilder<
  CC extends BFChainCore.SimpleChainChannel,
  R = BFChainUtil.PromiseReturnType<CC["queryTransactionInBlocks"]>,
> extends GroupRequesterBuilder<CC, R> {
  @Inject(ChainChannelHelper) protected readonly helper!: ChainChannelHelper;
  constructor(
    @Inject(GROUP_QUERY_TRANSACTIONS_INDEX_BUILDER_ARGS.QUERY)
    public readonly query: BFChainCore.TransactionInBlockGetOptionsJSON,
  ) {
    super();
  }
  protected _doRequest(cc: CC, opts: BFChainCore.ChannelRequestOptions<CC>) {
    return cc.queryTransactionInBlocks(this.query, opts) as unknown as PromiseLike<R>;
  }
  getTimeoutExceptionInfo() {
    return [
      /**message */ "queryTransactionInBlocks({query} / {sort}) timeout.",
      /**detail */
      {
        query: JSON.stringify(this.query),
      },
    ] as const;
  }
  protected _getFinishInfo(): { message?: string | undefined; detail?: any } {
    return { message: "finish queryTransactionInBlocks from other chainChannel" };
  }
  static create<
    CC extends BFChainCore.SimpleChainChannel,
    R = BFChainUtil.PromiseReturnType<CC["queryTransactionInBlocks"]>,
  >(
    rootModuleMap: ModuleStroge,
    query: BFChainCore.TransactionInBlockGetOptionsJSON,
    sort?: BFChainCore.TransactionSortOptionsJSON,
  ) {
    return Resolve<GroupQueryTransactionsByTIndexBuilder<CC, R>>(
      GroupQueryTransactionsByTIndexBuilder,
      new ModuleStroge([[GROUP_QUERY_TRANSACTIONS_INDEX_BUILDER_ARGS.QUERY, query]], rootModuleMap),
    );
  }
}
