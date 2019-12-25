import { AssetStatisticModel, CountAndAmountStatisticModel, StatisticInfoModel } from "@bfchain/core-model-block-base";
import { StringKeyMap } from "@bfchain/core-model-common";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { ChainAssetInfoHelper } from "@bfchain/core-helper-chain-asset-info";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { ModuleStroge, EventEmitter } from "@bfchain/util";
/**区块统计器 */
export declare class BlockBaseStatisticsHelper {
    transactionHelper: TransactionHelper;
    chainAssetInfo: ChainAssetInfoHelper;
    config: ConfigHelper;
    private moduleMap;
    constructor(transactionHelper: TransactionHelper, chainAssetInfo: ChainAssetInfoHelper, config: ConfigHelper, moduleMap: ModuleStroge);
    private _block_statistics_m;
    /**根据区块获取对应的统计信息 */
    forceGetStatisticsInfoByBlock(statisticinfoKey: number, reason: string, source_data?: StatisticInfoModel): StatisticsInfo;
    getStatisticsInfoByBlock(statisticinfoKey: number): StatisticsInfo | undefined;
    /**fee事件 */
    private _applyFee;
    /**asset事件 */
    private _applyAsset;
    static EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL: symbol;
    /**给事件触发器绑定统计功能 */
    bindApplyTransactionEventEmiter(eventEmitter: BFChainCore.ApplyTransactionEventEmitter, statistics_info: StatisticsInfo): true | undefined;
}
/**统计信息 */
export declare class StatisticsInfo extends EventEmitter<{
    destroy: [];
}> {
    private readonly source_data;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    static SOURCE_DATA_SYMBOL: symbol;
    constructor(source_data: StatisticInfoModel, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**累计手续费 */
    private _totalFee?;
    get totalFee(): bigint;
    set totalFee(value: bigint);
    /**累计资产总量，不区分资产名 */
    private _totalAsset?;
    get totalAsset(): bigint;
    set totalAsset(value: bigint);
    /**累计链资产总量 */
    private _totalChainAsset?;
    get totalChainAsset(): bigint;
    set totalChainAsset(value: bigint);
    /**累计账户数量 */
    private _accountIdSet;
    private _souce_data_totalAccount;
    get totalAccount(): number;
    addTotalAccount(id: string): number;
    /**资产统计 */
    private _assetStatisticMap;
    private _formatChainAssetInfo;
    getAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON): AssetStatistic | undefined;
    setAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, assetStatic: AssetStatistic): this;
    initAssetStatistic(chainAsset: BFChainCore.AssetInfoJSON, index?: number): AssetStatistic;
    get assetStatisticCount(): number;
    private _reasonSet;
    ref(reason: string): void;
    unref(reason: string): void;
    toModel(): StatisticInfoModel;
}
declare class CountAndAmountStatistic {
    private readonly source_data;
    constructor(source_data?: CountAndAmountStatisticModel);
    private _changeAmount?;
    get changeAmount(): bigint;
    set changeAmount(value: bigint);
    get changeCount(): number;
    set changeCount(value: number);
    private _moveAmount?;
    get moveAmount(): bigint;
    set moveAmount(value: bigint);
    private _transactionIdSet;
    private _souce_data_transactionCount;
    get transactionCount(): number;
    addTransactionCount(id: string): number;
    toModel(): CountAndAmountStatisticModel;
}
declare class AssetStatistic {
    private readonly source_data;
    constructor(source_data?: AssetStatisticModel);
    get magic(): string;
    set magic(value: string);
    get assetType(): string;
    set assetType(value: string);
    total: CountAndAmountStatistic;
    /**
     * @TODO 使用get、set，而不是Proxy来实现接口
     */
    _typeStatisticMap: Map<string, CountAndAmountStatistic>;
    typeStatisticMap: StringKeyMap<CountAndAmountStatistic>;
    getTypeStatistic(baseType: string): CountAndAmountStatistic | undefined;
    setTypeStatistic(baseType: string, assetStatic: CountAndAmountStatistic): this;
    initTypeStatistic(baseType: string): CountAndAmountStatistic;
    get assetStatisticCount(): number;
    get index(): number;
    set index(value: number);
    toModel(): AssetStatisticModel;
}
export {};
//# sourceMappingURL=blockBaseStatisticsHelper.d.ts.map