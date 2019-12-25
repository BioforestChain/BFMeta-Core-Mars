declare type GenesisBlock = import("@bfchain/core-model-block").GenesisBlock;
export declare enum NetType {
    TESTNET = 0,
    MAINNET = 1
}
export declare class ConfigHelper {
    readonly genesisBlock: GenesisBlock | BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>;
    business: string;
    constructor(genesisBlock: GenesisBlock | BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>, business: string);
    /**获取交易最大有效期 */
    get maxApplyAndConfirmedBlockHeightDiff(): number;
    /**获取区块版本号 */
    get version(): number;
    /**获取最大的 remark 长度 */
    get maxBlockRemarkSize(): number;
    /**每轮锻造的区块数量 */
    get blockPerRound(): number;
    /**链资产名 */
    get assetType(): string;
    /**链名 */
    get chainName(): string;
    /**链网络标识符 */
    get magic(): string;
    /**链奖励里程 */
    get milestones(): BFChainCore.RewardPerBlockJSON | import("@bfchain/core-model-block").RewardPerBlock;
    /**链创世账户初始账户余额 */
    get generateTotalAmount(): string;
    /**获取资产的最小单位 */
    get miniUnit(): string;
    /**网络类型 */
    get netType(): NetType;
    /**地址前缀 */
    get initials(): string;
    /**打块的时间间隔 */
    get forgeInterval(): number;
    /**区块参与度计算权重 */
    get blockParticipationWeight(): {
        participationTotalChainAsset: number;
        participationNumberOfTransaction: number;
        participationNumberOfAccount: number;
        participationTotalFee: number;
    };
    /**创世时间 */
    get beginEpochTime(): number;
    /**最大区块大小 */
    get maxPayloadLength(): number;
    get powOfWorkExemptionBlocks(): number;
    /**创世账户公钥 */
    get genesisAccountPublicKey(): string;
    /**获取交易的最大字节数 */
    get maxTransactionSize(): number;
    /**发行数字资产最小持有的链资产数量 */
    get issueAssetMinChainAsset(): string;
    /**发行子链最小持有的链资产数量 */
    get issueSubchainMinChainAsset(): string;
    /**链资产和数字资产的兑换比例 */
    get chainAssetAndDigitalAssetExchangeRate(): number;
    /**交易每个字节最小手续费 */
    get minTransactionFeePerByte(): BFChainCore.FractionJSON<number> | import("@bfchain/core-model-common").Fraction;
    /**每个区块可处理的最大交易数量 */
    get maxTPSPerBlock(): number;
    /**每轮可处理的受托人交易数量 */
    get maxDelegateTxsPerRound(): number;
    /**创世受托人数量 */
    get delegates(): number;
    /**获取奖励分配比例 */
    get rewardPercent(): BFChainCore.RewardPercentJSON | import("@bfchain/core-model-block").RewardPercentModel;
    /**获取父链传世块 */
    get parentGenesisBlock(): BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON> | BFChainCore.JSONToModelType<BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>>;
}
export declare class ConfigHelperMap {
    private _map;
    get clear(): () => void;
    get delete(): (key: string) => boolean;
    get forEach(): (callbackfn: (value: ConfigHelper, key: string, map: Map<string, ConfigHelper>) => void, thisArg?: any) => void;
    get get(): (key: string) => ConfigHelper | undefined;
    get has(): (key: string) => boolean;
    get set(): (key: string, value: ConfigHelper) => Map<string, ConfigHelper>;
    get size(): number;
    /** Returns an iterable of entries in the map. */
    get [Symbol.iterator](): () => IterableIterator<[string, ConfigHelper]>;
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    get entries(): () => IterableIterator<[string, ConfigHelper]>;
    /**
     * Returns an iterable of keys in the map
     */
    get keys(): () => IterableIterator<string>;
    /**
     * Returns an iterable of values in the map
     */
    get values(): () => IterableIterator<ConfigHelper>;
    get [Symbol.toStringTag](): string;
}
export {};
//# sourceMappingURL=configHelper.d.ts.map