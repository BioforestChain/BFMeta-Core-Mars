declare namespace BFChainCore {
  export type ConfigHelper = Readonly<{
    version: number;
    miniUnit: string;
    chainName: string;
    assetType: string;
    magic: string;
    bnid: string;
    beginEpochTime: number;
    genesisLocationName: string;
    genesisAmount: string;
    maxSupply: string;
    minTransactionFeePerByte: BFChainCore.FractionJSON<number>;
    maxTransactionSize: number;
    maxTransactionBlobSize: number;
    maxBlockSize: number;
    maxBlockBlobSize: number;
    maxTPSPerBlock: number;
    consessusBeforeSyncBlockDiff: number;
    maxGrabTimesOfGiftAsset: number;
    issueAssetMinChainAsset: string;
    maxMultipleOfAssetAndMainAsset: BFChainCore.FractionJSON<string>;
    issueEntityFactoryMinChainAsset: string;
    maxMultipleOfEntityAndMainAsset: BFChainCore.FractionJSON<string>;
    registerChainMinChainAsset: string;
    maxApplyAndConfirmedBlockHeightDiff: number;
    blockPerRound: number;
    delegates: number;
    whetherToAllowDelegateContinusElections: boolean;
    forgeInterval: number;
    basicRewards: string;
    ports: BFChainCore.PortsJSON;
  }>;
}
