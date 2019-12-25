import {
  AssetStatisticModel,
  CountAndAmountStatisticModel,
  StatisticInfoModel,
} from "@bfchain/core-model-block-base";
import { StringKeyMap } from "@bfchain/core-model-common";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { ChainAssetInfoHelper, ChainAssetInfo } from "@bfchain/core-helper-chain-asset-info";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { Injectable, ModuleStroge, Resolve, Inject, EventEmitter } from "@bfchain/util";

/**区块统计器 */
@Injectable("bfchain-core:BlockBaseStatistics")
export class BlockBaseStatisticsHelper {
  constructor(
    public transactionHelper: TransactionHelper,
    public chainAssetInfo: ChainAssetInfoHelper,
    public config: ConfigHelper,
    private moduleMap: ModuleStroge,
  ) {}
  private _block_statistics_m = new Map<number, StatisticsInfo>();
  /**根据区块获取对应的统计信息 */
  forceGetStatisticsInfoByBlock(
    statisticinfoKey: number,
    reason: string,
    source_data?: StatisticInfoModel,
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
    return statistics_info;
  }

  getStatisticsInfoByBlock(statisticinfoKey: number) {
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
    assetStatistic.total.changeAmount = assetStatistic.total.changeAmount + sourceAmount;
    assetStatistic.total.changeCount += 1;
    assetStatistic.total.addTransactionCount(transaction.id);
    /**需要统计的交易类型 */
    const typeStatistic = assetStatistic.initTypeStatistic(baseType);

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
    typeStatistic.changeAmount = typeStatistic.changeAmount + sourceAmount;
    typeStatistic.changeCount += 1;
    typeStatistic.moveAmount = typeStatistic.moveAmount + sourceAmount;
    typeStatistic.addTransactionCount(transaction.id);
  }
  /**asset事件 */
  private _applyAsset(
    event: BFChainCore.ApplyTransactionAssetEvent<"asset">,
    statistics_info: StatisticsInfo,
  ) {
    const { applyInfo, transaction } = event;
    const { type } = transaction;
    const sourceAmount = BigInt(applyInfo.sourceAmount);
    const { baseType } = this.transactionHelper.parseType(type);

    /// 获取统计需要写入的对象
    /**需要统计的资产 */
    const assetStatistic = statistics_info.initAssetStatistic(applyInfo.assetInfo);
    /**需要统计的交易类型 */
    const typeStatistic = assetStatistic.initTypeStatistic(baseType);

    /**
     * 对资产进行变动量统计
     */
    assetStatistic.total.changeAmount = assetStatistic.total.changeAmount + sourceAmount;
    assetStatistic.total.changeCount += 1;
    assetStatistic.total.addTransactionCount(transaction.id);
    /**
     * 对交易类型进行变动量统计
     */
    typeStatistic.changeAmount = typeStatistic.changeAmount + sourceAmount;
    typeStatistic.changeCount += 1;
    typeStatistic.addTransactionCount(transaction.id);
    /**
     * 发起者和接收者不能重复累加
     * 统计资产移动、统计指定交易类型的变动
     */
    if (applyInfo.amount.startsWith("-")) {
      /**
       * 资产移动统计
       */
      assetStatistic.total.moveAmount = assetStatistic.total.moveAmount + sourceAmount;
      /**
       * 统计流通的资产总量
       */
      statistics_info.totalAsset = statistics_info.totalAsset + sourceAmount;
      /**
       * 统计流通的链资产总量
       */
      const { assetInfo } = applyInfo;
      const { config } = this;
      if (assetInfo.assetType === config.assetType && assetInfo.magic === config.magic) {
        statistics_info.totalChainAsset = statistics_info.totalChainAsset + sourceAmount;
      }
      /**
       * 针对交易的类型进行统计
       */
      typeStatistic.moveAmount = typeStatistic.moveAmount + sourceAmount;
    }
    /**
     * 统计涉及的账户总数量
     */
    statistics_info.addTotalAccount(applyInfo.address);
  }

  static EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL = Symbol.for(
    "EVENTEMITTER_STATISTICS_BINDED_SET",
  );
  /**给事件触发器绑定统计功能 */
  bindApplyTransactionEventEmiter(
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    statistics_info: StatisticsInfo,
  ) {
    const bindedSet =
      ((eventEmitter as any)[
        BlockBaseStatisticsHelper.EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL
      ] as WeakSet<StatisticsInfo>) ||
      ((eventEmitter as any)[
        BlockBaseStatisticsHelper.EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL
      ] = new WeakSet<StatisticsInfo>());
    if (bindedSet.has(statistics_info)) {
      console.warn("已经绑定过统计用的ApplyTransaction");
      return;
    }
    bindedSet.add(statistics_info);
    /**
     * 因为`bindApplyTransactionEventEmiter`本身就是在`eventEmitter`传入函数后才开始绑定事件的，
     * 所以这些绑定本身就是在最末尾，不需要`next`
     */
    eventEmitter.on("fee", (event, next) => {
      this._applyFee(event, statistics_info);
      return next();
    });
    eventEmitter.on("feeFromUnfrozen", (event, next) => {
      this._applyFee(event, statistics_info);
      return next();
    });
    eventEmitter.on("asset", (event, next) => {
      this._applyAsset(event, statistics_info);
      return next();
    });
    eventEmitter.on("frozenAsset", (event, next) => {
      this._applyAsset(event, statistics_info);
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
    for (const [index, assetStatic] of source_data.assetStatisticMap) {
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        assetStatic.magic,
        assetStatic.assetType,
      );
      this._assetStatisticMap.set(assetInfo, new AssetStatistic(assetStatic));
    }
  }
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
  /**累计账户数量 */
  private _accountIdSet = new Set();
  private _souce_data_totalAccount = this.source_data.totalAccount;
  public get totalAccount() {
    return this.source_data.totalAccount;
  }
  addTotalAccount(id: string) {
    this._accountIdSet.add(id);
    return (this.source_data.totalAccount =
      this._souce_data_totalAccount + this._accountIdSet.size);
  }
  /**资产统计 */
  private _assetStatisticMap = new Map<ChainAssetInfo, AssetStatistic>();
  private _formatChainAssetInfo(chainAsset: BFChainCore.AssetInfoJSON) {
    return this.chainAssetInfoHelper.isChainAssetInfo(chainAsset)
      ? chainAsset
      : this.chainAssetInfoHelper.getAssetInfo(chainAsset.magic, chainAsset.assetType);
  }
  getAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON) {
    return this._assetStatisticMap.get(this._formatChainAssetInfo(chainAsset));
  }
  setAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, assetStatic: AssetStatistic) {
    this._assetStatisticMap.set(this._formatChainAssetInfo(chainAsset), assetStatic);
    this.source_data.assetStatisticMap.set(assetStatic.index, assetStatic.toModel());
    return this;
  }
  initAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, index = this.assetStatisticCount) {
    chainAsset = this._formatChainAssetInfo(chainAsset);
    let assetStatistic = this._assetStatisticMap.get(chainAsset);
    if (!assetStatistic) {
      assetStatistic = new AssetStatistic();
      assetStatistic.index = index;
      assetStatistic.magic = chainAsset.magic;
      assetStatistic.assetType = chainAsset.assetType;
      this.setAssetStatistic(chainAsset, assetStatistic);
    }
    return assetStatistic;
  }
  get assetStatisticCount() {
    return this._assetStatisticMap.size;
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
    if (this._assetStatisticMap) {
      const { _assetStatisticMap } = this;
      const assetStatisticHashMap: { [index: number]: AssetStatisticModel } = {};
      _assetStatisticMap.forEach(assetStatistic => {
        assetStatisticHashMap[assetStatistic.index] = assetStatistic.toModel();
      });
      this.source_data.assetStatisticHashMap = assetStatisticHashMap;
    }
    return this.source_data;
  }
}

class CountAndAmountStatistic {
  constructor(
    private readonly source_data = CountAndAmountStatisticModel.fromObject<
      CountAndAmountStatisticModel
    >({}),
  ) {}
  private _changeAmount?: bigint;
  public get changeAmount() {
    return this._changeAmount || (this._changeAmount = BigInt(this.source_data.changeAmount));
  }
  public set changeAmount(value: bigint) {
    this._changeAmount = value;
  }
  public get changeCount() {
    return this.source_data.changeCount;
  }
  public set changeCount(value: number) {
    this.source_data.changeCount = value;
  }
  private _moveAmount?: bigint;
  public get moveAmount() {
    return this._moveAmount || (this._moveAmount = BigInt(this.source_data.moveAmount));
  }
  public set moveAmount(value: bigint) {
    this._moveAmount = value;
  }
  private _transactionIdSet = new Set();
  private _souce_data_transactionCount = this.source_data.transactionCount;
  public get transactionCount() {
    return this.source_data.transactionCount;
  }
  addTransactionCount(id: string) {
    this._transactionIdSet.add(id);
    return (this.source_data.transactionCount =
      this._transactionIdSet.size + this._souce_data_transactionCount);
  }
  toModel() {
    this._changeAmount && (this.source_data.changeAmount = this._changeAmount.toString());
    this._moveAmount && (this.source_data.moveAmount = this._moveAmount.toString());
    return this.source_data;
  }
}
class AssetStatistic {
  constructor(private readonly source_data = AssetStatisticModel.fromObject({ total: {} })) {
    for (const [baseType, typeStatistic] of source_data.typeStatisticMap) {
      this._typeStatisticMap.set(baseType, new CountAndAmountStatistic(typeStatistic));
    }
  }
  public get magic() {
    return this.source_data.magic;
  }
  public set magic(value: string) {
    this.source_data.magic = value;
  }
  public get assetType(): string {
    return this.source_data.assetType;
  }
  public set assetType(value: string) {
    this.source_data.assetType = value;
  }
  total = new CountAndAmountStatistic(this.source_data.total);
  /**
   * @TODO 使用get、set，而不是Proxy来实现接口
   */
  // getTypeStatistic(baseType:string){
  // }
  // setTypeStatistic(baseType:string,countAndAmountStatistic:CountAndAmountStatistic){
  // }
  _typeStatisticMap = new Map<string, CountAndAmountStatistic>();
  typeStatisticMap = new StringKeyMap<CountAndAmountStatistic>(
    (() => {
      const typeStatisticHashMap = this.source_data.typeStatisticHashMap;
      const typeStatisticHashMap2: { [baseType: string]: CountAndAmountStatistic } = {};
      return new Proxy(typeStatisticHashMap2, {
        get(source, key: string, r) {
          if (key in source) {
            return source[key];
          }
          if (key in typeStatisticHashMap) {
            return (source[key] = new CountAndAmountStatistic(typeStatisticHashMap[key]));
          }
        },
        set(source, key: string, value, r) {
          if (value instanceof CountAndAmountStatistic) {
            source[key] = value;
            typeStatisticHashMap[key] = value.toModel();
            return true;
          }
          return false;
        },
      });
    })(),
  );
  getTypeStatistic(baseType: string) {
    return this._typeStatisticMap.get(baseType);
  }
  setTypeStatistic(baseType: string, assetStatic: CountAndAmountStatistic) {
    this._typeStatisticMap.set(baseType, assetStatic);
    this.source_data.typeStatisticMap.set(baseType, assetStatic.toModel());
    return this;
  }
  initTypeStatistic(baseType: string) {
    let assetStatistic = this._typeStatisticMap.get(baseType);
    if (!assetStatistic) {
      assetStatistic = new CountAndAmountStatistic();
      this.setTypeStatistic(baseType, assetStatistic);
    }
    return assetStatistic;
  }
  get assetStatisticCount() {
    return this._typeStatisticMap.size;
  }
  public get index() {
    return this.source_data.index;
  }
  public set index(value: number) {
    this.source_data.index = value;
  }
  toModel() {
    this.total.changeAmount &&
      (this.source_data.total.changeAmount = this.total.changeAmount.toString());
    this.total.moveAmount && (this.source_data.total.moveAmount = this.total.moveAmount.toString());
    if (this._typeStatisticMap) {
      const typeStatisticHashMap: { [baseType: string]: CountAndAmountStatisticModel } = {};
      const { _typeStatisticMap } = this;
      _typeStatisticMap.forEach((countAndAmountStatistic, baseType) => {
        typeStatisticHashMap[baseType] = countAndAmountStatistic.toModel();
      });
      this.source_data.typeStatisticHashMap = typeStatisticHashMap;
    }
    return this.source_data;
  }
}
