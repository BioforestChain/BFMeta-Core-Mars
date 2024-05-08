import {
  AssetStatisticModel,
  AssetTypeAssetStatisticModel,
  CountAndAmountStatisticModel,
  StatisticInfoModel,
} from "@bfchain/core-model";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { ChainAssetInfoHelper, ChainAssetInfo } from "@bfchain/core-helper-chain-asset-info";
import { ConfigHelper } from "@bfchain/core-helper-config";
import {
  Injectable,
  ModuleStroge,
  Resolve,
  Inject,
  EventEmitter,
  EasyWeakMap,
} from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "helper-block_base_statistics",
  "blockBaseStatisticsHelper",
);

/**区块统计器 */
@Injectable("bfchain-core:BlockBaseStatistics")
export class BlockBaseStatisticsHelper {
  constructor(
    public transactionHelper: TransactionHelper,
    public chainAssetInfo: ChainAssetInfoHelper,
    public config: ConfigHelper,
    private moduleMap: ModuleStroge,
  ) {}
  private _block_statistics_m = new Map<string, StatisticsInfo>();
  private tempConfig: ConfigHelper | undefined;

  getConfig() {
    return this.tempConfig || this.config;
  }

  /**根据区块获取对应的统计信息 */
  forceGetStatisticsInfoByBlock(
    statisticinfoKey: string,
    reason: string,
    source_data?: StatisticInfoModel,
    config?: ConfigHelper,
  ) {
    let statistics_info = this._block_statistics_m.get(statisticinfoKey);
    if (!statistics_info) {
      statistics_info = Resolve(
        StatisticsInfo,
        new ModuleStroge([[StatisticsInfo.SOURCE_DATA_SYMBOL, source_data]], this.moduleMap),
      );
      statistics_info.on("destroy", () => {
        this._block_statistics_m.delete(statisticinfoKey);
      });
      this._block_statistics_m.set(statisticinfoKey, statistics_info);
    }
    statistics_info.ref(reason);
    // FIXME: /(ㄒoㄒ)/~~ 先酱紫了 @Gaubee
    if (config) {
      this.tempConfig = config;
      statistics_info.on("destroy", () => {
        this._block_statistics_m.delete(statisticinfoKey);
        this.tempConfig = undefined;
      });
    }

    return statistics_info;
  }

  getStatisticsInfoByBlock(statisticinfoKey: string) {
    return this._block_statistics_m.get(statisticinfoKey);
  }

  /**fee事件 */
  private _applyFee(event: BFChainCore.ApplyTransactionFeeEvent, statistics_info: StatisticsInfo) {
    const { applyInfo, transaction } = event;
    const { address, assetInfo } = applyInfo;
    const sourceAmount = BigInt(applyInfo.sourceAmount);
    const { baseType } = this.transactionHelper.parseType(transaction.type);
    // 统计资产信息
    const assetStatistic = statistics_info.initAssetStatistic(assetInfo);
    assetStatistic.total.changeAmount = (
      BigInt(assetStatistic.total.changeAmount) + sourceAmount
    ).toString();
    assetStatistic.total.moveAmount = (
      BigInt(assetStatistic.total.moveAmount) + sourceAmount
    ).toString();
    assetStatistic.total.changeCount += 1;
    // FIXME: subId
    const subId = transaction.signature;
    if (!statistics_info.subIdMap.has(subId)) {
      assetStatistic.total.transactionCount += 1;
      statistics_info.subIdMap.set(subId, true);
    }
    /**需要统计的交易类型 */
    const typeStatistic = statistics_info.initTypeStatistic(assetInfo, baseType);

    /**
     * 统计总手续费
     */
    statistics_info.totalFee = statistics_info.totalFee + sourceAmount;
    /**
     * 统计流通的资产总量
     */
    statistics_info.totalAsset = statistics_info.totalAsset + sourceAmount;
    /**
     * 统计流通的链资产总量
     */
    statistics_info.totalChainAsset = statistics_info.totalChainAsset + sourceAmount;
    /**
     * 统计涉及的账户总数量
     */
    statistics_info.addTotalAccount(address);
    /**
     * 对交易类型进行变动量统计
     */
    typeStatistic.changeAmount = (BigInt(typeStatistic.changeAmount) + sourceAmount).toString();
    typeStatistic.changeCount += 1;
    typeStatistic.moveAmount = (BigInt(typeStatistic.moveAmount) + sourceAmount).toString();
    if (!statistics_info.typeSubIdMap.has(subId)) {
      typeStatistic.transactionCount += 1;
      statistics_info.typeSubIdMap.set(subId, true);
    }
  }
  /**asset事件 */
  private _applyAsset(
    event: BFChainCore.ApplyTransactionAssetEvent<"asset">,
    statistics_info: StatisticsInfo,
    forceStatistic = false,
  ) {
    const { applyInfo, transaction } = event;
    const { type } = transaction;
    const sourceAmount = BigInt(applyInfo.sourceAmount);
    const { baseType } = this.transactionHelper.parseType(type);

    /// 获取统计需要写入的对象
    /**需要统计的资产 */
    const assetStatistic = statistics_info.initAssetStatistic(applyInfo.assetInfo);
    /**需要统计的交易类型 */
    const typeStatistic = statistics_info.initTypeStatistic(applyInfo.assetInfo, baseType);

    /**
     * 对资产进行变动量统计
     */
    assetStatistic.total.changeAmount = (
      BigInt(assetStatistic.total.changeAmount) + sourceAmount
    ).toString();
    assetStatistic.total.changeCount += 1;
    // FIXME: subId
    const subId = transaction.signature;
    if (!statistics_info.subIdMap.has(subId)) {
      assetStatistic.total.transactionCount += 1;
      statistics_info.subIdMap.set(subId, true);
    }
    /**
     * 对交易类型进行变动量统计
     */
    typeStatistic.changeAmount = (BigInt(typeStatistic.changeAmount) + sourceAmount).toString();
    typeStatistic.changeCount += 1;
    if (!statistics_info.typeSubIdMap.has(subId)) {
      typeStatistic.transactionCount += 1;
      statistics_info.typeSubIdMap.set(subId, true);
    }
    /**
     * 发起者和接收者不能重复累加
     * 统计资产移动、统计指定交易类型的变动
     * 有些特殊的事件的资产变动就是正数(权益赠送，资产交换，权益交换)
     */
    if (applyInfo.amount.startsWith("-") || forceStatistic) {
      /**
       * 资产移动统计
       */
      assetStatistic.total.moveAmount = (
        BigInt(assetStatistic.total.moveAmount) + sourceAmount
      ).toString();
      /**
       * 统计流通的资产总量
       */
      statistics_info.totalAsset = statistics_info.totalAsset + sourceAmount;
      /**
       * 统计流通的链资产总量
       */
      const { assetInfo } = applyInfo;
      const config = this.getConfig();
      if (assetInfo.assetType === config.assetType && assetInfo.magic === config.magic) {
        statistics_info.totalChainAsset = statistics_info.totalChainAsset + sourceAmount;
      }
      /**
       * 针对交易的类型进行统计
       */
      typeStatistic.moveAmount = (BigInt(typeStatistic.moveAmount) + sourceAmount).toString();
    }
    /**
     * 统计涉及的账户总数量
     */
    statistics_info.addTotalAccount(applyInfo.address);
  }
  /**count事件 */
  private _applyCount(
    event: BFChainCore.ApplyTransactionCountEvent<"count">,
    statistics_info: StatisticsInfo,
  ) {
    const { transaction } = event;
    const { baseType } = this.transactionHelper.parseType(transaction.type);
    const numberOfTransactions = statistics_info.numberOfTransactions;
    if (numberOfTransactions[baseType]) {
      numberOfTransactions[baseType]++;
    } else {
      numberOfTransactions[baseType] = 1;
    }
  }

  static eventEmitterStatisticsWM = new EasyWeakMap(
    (_: BFChainCore.ApplyTransactionEventEmitter) => new WeakSet<StatisticsInfo>(),
  );
  /**给事件触发器绑定统计功能 */
  bindApplyTransactionEventEmiter(
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    statistics_info: StatisticsInfo,
  ) {
    const bindedSet = BlockBaseStatisticsHelper.eventEmitterStatisticsWM.forceGet(eventEmitter);
    if (bindedSet.has(statistics_info)) {
      // console.debug("已经绑定过统计用的ApplyTransaction");
      return;
    }
    bindedSet.add(statistics_info);
    /**
     * 因为`bindApplyTransactionEventEmiter`本身就是在`eventEmitter`传入函数后才开始绑定事件的，
     * 所以这些绑定本身就是在最末尾，不需要`next`
     */
    eventEmitter.on(
      "fee",
      (event, next) => {
        this._applyFee(event, statistics_info);
        return next();
      },
      { taskname: "applyTransaction/blockStatistic/fee" },
    );
    eventEmitter.on(
      "feeFromUnfrozen",
      (event, next) => {
        this._applyFee(event, statistics_info);
        return next();
      },
      { taskname: "applyTransaction/blockStatistic/feeFromUnfrozen" },
    );
    eventEmitter.on(
      "asset",
      (event, next) => {
        this._applyAsset(event, statistics_info);
        return next();
      },
      { taskname: "applyTransaction/blockStatistic/asset" },
    );
    eventEmitter.on(
      "frozenAsset",
      (event, next) => {
        this._applyAsset(event, statistics_info);
        return next();
      },
      { taskname: "applyTransaction/blockStatistic/frozenAsset" },
    );
    eventEmitter.on(
      "unfrozenAsset",
      (event, next) => {
        this._applyAsset(event, statistics_info, true);
        return next();
      },
      { taskname: "applyTransaction/blockStatistic/unfrozenAsset" },
    );
    eventEmitter.on(
      "issueAsset",
      (event, next) => {
        this._applyAsset(event, statistics_info, true);
        return next();
      },
      { taskname: "applyTransaction/blockStatistic/issueAsset" },
    );
    eventEmitter.on("count", (event, next) => {
      this._applyCount(event, statistics_info);
      return next();
    });
    return true;
  }
}
/**统计信息 */
@Injectable()
export class StatisticsInfo extends EventEmitter<{ destroy: [] }> {
  static SOURCE_DATA_SYMBOL = Symbol("source-data");
  constructor(
    @Inject(StatisticsInfo.SOURCE_DATA_SYMBOL, { optional: true })
    private readonly source_data = StatisticInfoModel.fromObject<StatisticInfoModel>({}),
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {
    super();
  }

  subIdMap = new Map<string, boolean>();
  typeSubIdMap = new Map<string, boolean>();

  /**累计手续费 */
  private _totalFee?: bigint;
  public get totalFee() {
    return this._totalFee || (this._totalFee = BigInt(this.source_data.totalFee));
  }
  public set totalFee(value) {
    this._totalFee = value;
  }
  /**累计资产总量，不区分资产名 */
  private _totalAsset?: bigint;
  public get totalAsset() {
    return this._totalAsset || (this._totalAsset = BigInt(this.source_data.totalAsset));
  }
  public set totalAsset(value) {
    this._totalAsset = value;
  }
  /**累计链资产总量 */
  private _totalChainAsset?: bigint;
  public get totalChainAsset() {
    return (
      this._totalChainAsset || (this._totalChainAsset = BigInt(this.source_data.totalChainAsset))
    );
  }
  public set totalChainAsset(value) {
    this._totalChainAsset = value;
  }
  /**累计链资产总量 */
  private _numberOfTransactions?: { [baseType: string]: number };
  public get numberOfTransactions() {
    return (
      this._numberOfTransactions ||
      (this._numberOfTransactions = this.source_data.numberOfTransactionsHashMap)
    );
  }
  /**累计账户数量 */
  private _accountAddressSet = new Set();
  private _souce_data_totalAccount = this.source_data.totalAccount;
  public get totalAccount() {
    return this.source_data.totalAccount;
  }
  addTotalAccount(address: string) {
    this._accountAddressSet.add(address);
    return (this.source_data.totalAccount =
      this._souce_data_totalAccount + this._accountAddressSet.size);
  }
  getAssetTypeTypeStatisticMap(magic: string) {
    let assetTypeTypeStatistic = this.source_data.magicAssetTypeTypeStatisticMap.get(magic);
    if (!assetTypeTypeStatistic) {
      assetTypeTypeStatistic = AssetTypeAssetStatisticModel.fromObject({});
      this.source_data.magicAssetTypeTypeStatisticMap.set(magic, assetTypeTypeStatistic);
    }
    return assetTypeTypeStatistic.assetTypeTypeStatisticMap;
  }
  private __initAssetStatistic() {
    return AssetStatisticModel.fromObject({
      typeStatisticHashMap: {},
      total: {
        changeAmount: "0",
        changeCount: 0,
        moveAmount: "0",
        transactionCount: 0,
      },
    });
  }
  getAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON) {
    const { magic, assetType } = chainAsset;
    const assetTypeTypeStatisticMap = this.getAssetTypeTypeStatisticMap(magic);
    let assetStatistic = assetTypeTypeStatisticMap.get(assetType);
    if (!assetStatistic) {
      assetStatistic = this.__initAssetStatistic();
      assetTypeTypeStatisticMap.set(assetType, assetStatistic);
    }
    return assetStatistic;
  }
  setAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, assetStatistic: AssetStatisticModel) {
    const { magic, assetType } = chainAsset;
    const magicAssetTypeTypeStatisticMap = this.source_data.magicAssetTypeTypeStatisticMap;
    let assetTypeTypeStatisticMap = magicAssetTypeTypeStatisticMap.get(magic);
    if (!assetTypeTypeStatisticMap) {
      assetTypeTypeStatisticMap = AssetTypeAssetStatisticModel.fromObject({});
      this.source_data.magicAssetTypeTypeStatisticMap.set(magic, assetTypeTypeStatisticMap);
    }
    assetTypeTypeStatisticMap.assetTypeTypeStatisticMap.set(assetType, assetStatistic);
    return this;
  }
  initAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON) {
    const { magic, assetType } = chainAsset;
    const assetTypeTypeStatisticMap = this.getAssetTypeTypeStatisticMap(magic);
    let assetStatistic = assetTypeTypeStatisticMap.get(assetType);
    if (!assetStatistic) {
      assetStatistic = this.__initAssetStatistic();
      assetTypeTypeStatisticMap.set(assetType, assetStatistic);
    }
    return assetStatistic;
  }
  private __initTypeStatistic() {
    return CountAndAmountStatisticModel.fromObject({
      changeAmount: "0",
      changeCount: 0,
      moveAmount: "0",
      transactionCount: 0,
    });
  }
  getTypeStatistic(chainAsset: BFChainCore.AssetInfoJSON, baseType: string) {
    const assetStatistic = this.getAssetStatistic(chainAsset);
    let typeStatistic = assetStatistic.typeStatisticMap.get(baseType);
    if (!typeStatistic) {
      typeStatistic = this.__initTypeStatistic();
    }
    return typeStatistic;
  }
  setTypeStatistic(
    chainAsset: BFChainCore.AssetInfoJSON,
    baseType: string,
    typeStatistic: CountAndAmountStatisticModel,
  ) {
    const assetStatistic = this.getAssetStatistic(chainAsset);
    assetStatistic.typeStatisticMap.set(baseType, typeStatistic);
    return this;
  }
  initTypeStatistic(chainAsset: BFChainCore.AssetInfoJSON, baseType: string) {
    const assetStatistic = this.getAssetStatistic(chainAsset);
    let typeStatistic = assetStatistic.typeStatisticMap.get(baseType);
    if (!typeStatistic) {
      typeStatistic = this.__initTypeStatistic();
      assetStatistic.typeStatisticMap.set(baseType, typeStatistic);
    }
    return typeStatistic;
  }

  // /**交易类型统计 */
  // type = new Map<TRANSACTION_TYPES_BASE, number>();

  private _reasonSet = new Set<string>();
  ref(reason: string) {
    this._reasonSet.add(reason);
  }
  unref(reason: string) {
    this._reasonSet.delete(reason);
    if (this._reasonSet.size === 0) {
      this.emit("destroy");
    }
  }
  toModel() {
    this._totalFee && (this.source_data.totalFee = this._totalFee.toString());
    this._totalAsset && (this.source_data.totalAsset = this._totalAsset.toString());
    this._totalChainAsset && (this.source_data.totalChainAsset = this._totalChainAsset.toString());

    return this.source_data.format();
  }
}
