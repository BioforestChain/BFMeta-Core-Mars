declare namespace BFChainCore {
  type Block<RJ extends CommonBlockRemarkJSON = CommonBlockRemarkJSON> = import("./block").Block<
    RJ
  >;

  type BlockModelConstructor = typeof import("./").Block;

  type GetRemarkModel<T> = T extends BlockJSON<infer U> ? U : any;

  interface BlockWithoutTransactionJSON<RemarkJSON> {
    version: number;
    height: number;
    blockSize: number;
    timestamp: number;
    signature: string;
    generatorPublicKey: string;
    numberOfTransactions: number;
    payloadHash: string;
    payloadLength: number;
    previousBlockSignature: string;
    totalAmount: string;
    totalFee: string;
    reward: string;
    magic: string;
    remark: RemarkJSON;
    statisticInfo: StatisticInfoJSON;
    roundOfflineGeneratersHashMap: RoundOfflineGeneratersHashMap;
  }
  interface BlockJSON<RemarkJSON extends {} = {}> extends BlockWithoutTransactionJSON<RemarkJSON> {
    transactions: TransactionInBlockJSON[];
  }
  type RoundOfflineGeneratersReadonlyMap = Omit<
    Map<number, readonly string[]>,
    "set" | "delete" | "clear"
  > &
    ReadonlyMap<number, readonly string[]>;
  // interface RoundOfflineGeneratersMap {
  //   [roundOffset: string]: Uint8Array[];
  // }
  interface RoundOfflineGeneratersHashMap {
    /**
     * 使用逗号分隔的地址
     * address,address */
    [roundOffset: string]: string;
  }

  //#region Statistic Info

  interface CountAndAmountStatisticJSON {
    /**变动总值，某个账户的增加或者减少都会有影响 */
    changeAmount: string;
    /**变动总次数，某个账户的增加或者减少都会有影响 */
    changeCount: number;
    /**资产迁移总量 */
    moveAmount: string;
    /**交易次数统一 */
    transactionCount: number;
  }
  interface AssetStatisticJSON extends AssetInfoJSON {
    index: number;
    typeStatisticHashMap: { [baseType: number]: CountAndAmountStatisticJSON };
    total: CountAndAmountStatisticJSON;
  }

  interface StatisticInfoJSON {
    totalFee: string;
    totalAsset: string;
    totalChainAsset: string;
    totalAccount: number;
    assetStatisticHashMap: { [index: number]: AssetStatisticJSON };
  }
  //#endregion

  //#region Block Remark

  type RemarkJSONToModelType<
    J extends CommonBlockRemarkJSON = CommonBlockRemarkJSON
  > = JSONToModelType<J> & { getBytes(): Uint8Array };
  //#region CommonBlock

  interface CommonBlockRemarkJSON {
    debug: string;
    info: string;
    blockParticipation: string;
  }
  //#endregion

  interface RoundDelegateRemarkJSON {
    nextRoundDelegates: NextRoundDelegateJSON[];
    newDelegates: string[];
    maxBeginBalance: string;
    maxTxCount: number;
    rate: string;
  }
  interface NextRoundDelegateJSON {
    address: string;
    equity: string;
  }

  //#region RoundLastBlock

  interface RoundLastBlockRemarkJSON extends RoundDelegateRemarkJSON, CommonBlockRemarkJSON {
    hash: string;
  }

  //#endregion

  //#region GenesisBlock

  interface GenesisBlockRemarkJSON extends RoundDelegateRemarkJSON, CommonBlockRemarkJSON {
    assetType: string;
    chainName: string;
    magic: string;
    bnid: import("./constanst").BNID_TYPE;
    beginEpochTime: number;
    genesisNodeAddress: string;
    generateTotalAmount: string;
    minTransactionFeePerByte: FractionJSON;
    maxPayloadLength: number;
    maxTPSPerBlock: number;
    maxTransactionSize: number;
    maxBlockRemarkSize: number;
    consessusBeforeSyncBlockDiff: number;
    maxDelegateTxsPerRound: number;
    maxGrabTimesOfGiftAsset: number;
    issueAssetMinChainAsset: string;
    registerChainMinChainAsset: string;
    chainAssetAndDigitalAssetExchangeRate: number;
    chainAssetRewardWeight: number;
    numberOfTransactionRewardWeight: number;
    maxApplyAndConfirmedBlockHeightDiff: number;
    powOfWorkExemptionBlocks: number;
    blockPerRound: number;
    delegates: number;
    whetherToAllowDelegateContinusElections: boolean;
    forgeInterval: number;
    rewardPercent: RewardPercentJSON;
    ports: PortsJSON;
    rewardPerBlock: RewardPerBlockJSON;
    blockParticipation: string;
    participationTotalChainAsset: number;
    participationNumberOfTransaction: number;
    participationNumberOfAccount: number;
    participationTotalFee: number;
    transactionPowOfWorkConfig: TransactionPowOfWorkConfigJSON;
  }
  interface RewardPercentJSON {
    votePercent: FractionJSON;
    forgePercent: FractionJSON;
  }
  interface PortsJSON {
    port: number;
    scan_peer_port: number;
  }
  interface RewardPerBlockJSON {
    readonly heights: number[];
    readonly rewards: string[];
  }

  interface ParentInfoJSON {
    magic: string;
    chainName: string;
    assetType: string;
    genesisNodeAddress: string;
  }
  interface TransactionPowOfWorkConfigJSON {
    growthFactor: FractionJSON<string>;
    participationRatio: FractionJSON;
  }
  //#endregion
  //#endregion
}
