import {
  AssetPrealnumModel,
  AssetStatisticModel,
  CountAndAmountStatisticModel,
  StatisticInfoModel,
  StringKeyMap,
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
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
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
    assetStatistic.total.changeAmount = assetStatistic.total.changeAmount + sourceAmount;
    assetStatistic.total.changeCount += 1;
    assetStatistic.total.addTransactionCount(transaction.signature);
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
    typeStatistic.addTransactionCount(transaction.signature);
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
    const typeStatistic = assetStatistic.initTypeStatistic(baseType);

    /**
     * 对资产进行变动量统计
     */
    assetStatistic.total.changeAmount = assetStatistic.total.changeAmount + sourceAmount;
    assetStatistic.total.changeCount += 1;
    assetStatistic.total.addTransactionCount(transaction.signature);
    /**
     * 对交易类型进行变动量统计
     */
    typeStatistic.changeAmount = typeStatistic.changeAmount + sourceAmount;
    typeStatistic.changeCount += 1;
    typeStatistic.addTransactionCount(transaction.signature);
    /**
     * 发起者和接收者不能重复累加
     * 统计资产移动、统计指定交易类型的变动
     * 有些特殊的事件的资产变动就是正数(权益赠送，资产交换，权益交换)
     */
    if (applyInfo.amount.startsWith("-") || forceStatistic) {
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
      const config = this.getConfig();
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
    for (const assetStatistic of source_data.assetStatisticMap.values()) {
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        assetStatistic.magic,
        assetStatistic.assetType,
      );
      this._storeChainAssetStatistic(assetInfo, new AssetStatistic(assetStatistic));
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
  /**资产统计 */
  private _chainAssetStatisticMap = new Map<ChainAssetInfo, AssetStatistic>();
  private _assetStatisticHashMap: { [index: number]: AssetStatisticModel } = {};
  private _formatChainAssetInfo(chainAsset: BFChainCore.AssetInfoJSON) {
    return this.chainAssetInfoHelper.isChainAssetInfo(chainAsset)
      ? chainAsset
      : this.chainAssetInfoHelper.getAssetInfo(chainAsset.magic, chainAsset.assetType);
  }
  private _storeChainAssetStatistic(
    chainAssetInfo: ChainAssetInfo,
    assetStatistic: AssetStatistic,
  ) {
    this._chainAssetStatisticMap.set(chainAssetInfo, assetStatistic);
    /// 这里使用toModel，拿到了是 assetStatistic 的 source_data
    this._assetStatisticHashMap[assetStatistic.index] = assetStatistic.toModel();
  }
  getAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON) {
    return this._chainAssetStatisticMap.get(this._formatChainAssetInfo(chainAsset));
  }
  setAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, assetStatistic: AssetStatistic) {
    this._storeChainAssetStatistic(this._formatChainAssetInfo(chainAsset), assetStatistic);
    this.source_data.assetStatisticMap.set(assetStatistic.index, assetStatistic.toModel());
    return this;
  }
  initAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, index = this.assetStatisticCount) {
    chainAsset = this._formatChainAssetInfo(chainAsset);
    let assetStatistic = this._chainAssetStatisticMap.get(chainAsset);
    if (!assetStatistic) {
      assetStatistic = new AssetStatistic();
      if (this._assetStatisticHashMap[index]) {
        throw new ArgumentIllegalException("assetStatistic index:{index} already in use.", {
          index,
        });
      }
      assetStatistic.index = index;
      assetStatistic.magic = chainAsset.magic;
      assetStatistic.assetType = chainAsset.assetType;
      this.setAssetStatistic(chainAsset, assetStatistic);
    }
    return assetStatistic;
  }
  getAssetStatisticByIndex(index: number) {
    return this._assetStatisticHashMap[index] as AssetStatisticModel | undefined;
  }
  get assetStatisticCount() {
    return this._chainAssetStatisticMap.size;
  }

  //
  private _assetPrealnums: AssetPrealnumModel[] = [];
  get assetPrealnums() {
    return this._assetPrealnums;
  }
  set assetPrealnums(assetPrealnums: BFChainCore.AssetPrealnumJSON[]) {
    for (const assetPrealnum of assetPrealnums) {
      this._assetPrealnums.push(AssetPrealnumModel.fromObject<AssetPrealnumModel>(assetPrealnum));
    }
  }
  addAssetPrealnum(assetPrealnum: AssetPrealnumModel) {
    this._assetPrealnums.push(assetPrealnum);
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

    // 强制将内存更新
    this._chainAssetStatisticMap.forEach((assetStatistic) => assetStatistic.toModel());
    this.source_data.assetStatisticHashMap = this._assetStatisticHashMap;

    this._assetPrealnums && (this.source_data.assetPrealnums = this._assetPrealnums);

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
  private _transactionSignatureSet = new Set();
  private _souce_data_transactionCount = this.source_data.transactionCount;
  public get transactionCount() {
    return this.source_data.transactionCount;
  }
  addTransactionCount(signature: string) {
    this._transactionSignatureSet.add(signature);
    return (this.source_data.transactionCount =
      this._transactionSignatureSet.size + this._souce_data_transactionCount);
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
  setTypeStatistic(baseType: string, assetStatistic: CountAndAmountStatistic) {
    this._typeStatisticMap.set(baseType, assetStatistic);
    this.source_data.typeStatisticMap.set(baseType, assetStatistic.toModel());
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
