import { AssetStatisticModel, CountAndAmountStatisticModel, StatisticInfoModel, StringKeyMap } from "@bfchain/core-model";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { ChainAssetInfoHelper } from "@bfchain/core-helper-chain-asset-info";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { ModuleStroge, EventEmitter, EasyWeakMap } from "@bfchain/util";
export declare class BlockBaseStatisticsHelper {
    transactionHelper: TransactionHelper;
    chainAssetInfo: ChainAssetInfoHelper;
    config: ConfigHelper;
    private moduleMap;
    constructor(transactionHelper: TransactionHelper, chainAssetInfo: ChainAssetInfoHelper, config: ConfigHelper, moduleMap: ModuleStroge);
    private _block_statistics_m;
    private tempConfig;
    getConfig(): ConfigHelper;
    forceGetStatisticsInfoByBlock(statisticinfoKey: number, reason: string, source_data?: StatisticInfoModel, config?: ConfigHelper): StatisticsInfo;
    getStatisticsInfoByBlock(statisticinfoKey: number): StatisticsInfo | undefined;
    private _applyFee;
    private _applyAsset;
    static eventEmitterStatisticsWM: EasyWeakMap<BFChainCore.ApplyTransactionEventEmitter<{}>, WeakSet<StatisticsInfo>, BFChainCore.ApplyTransactionEventEmitter<{}>>;
    bindApplyTransactionEventEmiter(eventEmitter: BFChainCore.ApplyTransactionEventEmitter, statistics_info: StatisticsInfo): true | undefined;
}
export declare class StatisticsInfo extends EventEmitter<{
    destroy: [];
}> {
    private readonly source_data;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    static SOURCE_DATA_SYMBOL: symbol;
    constructor(source_data: StatisticInfoModel, chainAssetInfoHelper: ChainAssetInfoHelper);
    private _totalFee?;
    get totalFee(): bigint;
    set totalFee(value: bigint);
    private _totalAsset?;
    get totalAsset(): bigint;
    set totalAsset(value: bigint);
    private _totalChainAsset?;
    get totalChainAsset(): bigint;
    set totalChainAsset(value: bigint);
    private _accountAddressSet;
    private _souce_data_totalAccount;
    get totalAccount(): number;
    addTotalAccount(address: string): number;
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
    private _transactionSignatureSet;
    private _souce_data_transactionCount;
    get transactionCount(): number;
    addTransactionCount(signature: string): number;
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
