declare type GenesisBlock = import("@bfchain/core-model-block").GenesisBlock;
export declare enum NetType {
    TESTNET = 0,
    MAINNET = 1
}
export declare class ConfigHelper {
    readonly genesisBlock: GenesisBlock | BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>;
    business: string;
    constructor(genesisBlock: GenesisBlock | BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>, business: string);
    get maxApplyAndConfirmedBlockHeightDiff(): number;
    get version(): number;
    get maxBlockRemarkSize(): number;
    get blockPerRound(): number;
    get assetType(): string;
    get chainName(): string;
    get magic(): string;
    get milestones(): BFChainCore.RewardPerBlockJSON | import("@bfchain/core-model-block").RewardPerBlock;
    get generateTotalAmount(): string;
    get miniUnit(): string;
    get netType(): NetType;
    get initials(): string;
    get forgeInterval(): number;
    get blockParticipationWeight(): {
        participationTotalChainAsset: number;
        participationNumberOfTransaction: number;
        participationNumberOfAccount: number;
        participationTotalFee: number;
    };
    get beginEpochTime(): number;
    get maxPayloadLength(): number;
    get powOfWorkExemptionBlocks(): number;
    get genesisAccountPublicKey(): string;
    get maxTransactionSize(): number;
    get issueAssetMinChainAsset(): string;
    get issueSubchainMinChainAsset(): string;
    get chainAssetAndDigitalAssetExchangeRate(): number;
    get minTransactionFeePerByte(): BFChainCore.FractionJSON<number> | import("@bfchain/core-model-common").Fraction;
    get maxTPSPerBlock(): number;
    get maxDelegateTxsPerRound(): number;
    get delegates(): number;
    get rewardPercent(): BFChainCore.RewardPercentJSON | import("@bfchain/core-model-block").RewardPercentModel;
    get parentGenesisBlock(): any;
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
    get [Symbol.iterator](): () => IterableIterator<[string, ConfigHelper]>;
    get entries(): () => IterableIterator<[string, ConfigHelper]>;
    get keys(): () => IterableIterator<string>;
    get values(): () => IterableIterator<ConfigHelper>;
    get [Symbol.toStringTag](): string;
}
export {};
