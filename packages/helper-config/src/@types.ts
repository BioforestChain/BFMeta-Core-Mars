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
    minTransactionFeePerByte: BFChainCore.FractionJSON<number>;
    maxTransactionSize: number;
    maxBlockSize: number;
    maxTPSPerBlock: number;
    consessusBeforeSyncBlockDiff: number;
    maxDelegateTxsPerRound: number;
    maxGrabTimesOfGiftAsset: number;
    issueAssetMinChainAsset: string;
    registerChainMinChainAsset: string;
    maxApplyAndConfirmedBlockHeightDiff: number;
    blockPerRound: number;
    delegates: number;
    whetherToAllowDelegateContinusElections: boolean;
    forgeInterval: number;
    rewardPercent: BFChainCore.RewardPercentJSON;
    ports: BFChainCore.PortsJSON;
    rewardPerBlock: BFChainCore.RewardPerBlockJSON;
    accountParticipationWeightRatio: BFChainCore.AccountParticipationWeightRatioJSON;
    blockParticipationWeightRatio: BFChainCore.BlockParticipationWeightRatioJSON;
    averageComputingPower: number;
    tpowOfWorkExemptionBlocks: number;
    transactionPowOfWorkConfig: BFChainCore.TransactionPowOfWorkConfigJSON;
  }>;
}
