declare namespace BFChainCore {
  type Block<AJ extends object = object> = import("./block").Block<AJ>;
  type BlockModelConstructor = typeof import("./").Block;

  type GetBlockMessageAssetModel<T> = T extends BlockJSON<infer U> ? U : any;
  type GetBlockAssetModel<T> = GetBlockMessageAssetModel<
    T
  > extends import("@bfchain/protobuf").Message<infer U>
    ? U
    : any;

  type GetBlockAssetJSON<T extends Block> = T["ASSET_JSON_TYPE"];

  interface BlockWithoutTransactionJSON<AssetJSON extends object = object> {
    version: number;
    height: number;
    blockSize: number;
    timestamp: number;
    signature: string;
    signSignature?: string;
    generatorPublicKey: string;
    generatorSecondPublicKey?: string;
    generatorEquity: string;
    numberOfTransactions: number;
    payloadHash: string;
    payloadLength: number;
    previousBlockSignature: string;
    totalAmount: string;
    totalFee: string;
    reward: string;
    magic: string;
    blockParticipation: string;
    remark: { [key: string]: string };
    asset: AssetJSON;
    statisticInfo: StatisticInfoJSON;
    roundOfflineGeneratersHashMap: RoundOfflineGeneratersHashMap;
  }
  interface BlockJSON<AssetJSON extends object = object>
    extends BlockWithoutTransactionJSON<AssetJSON> {
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

  //#region CommonBlock
  interface CommonBlockAssetJSON {}
  type CommonBlockJSON = BlockJSON<CommonBlockAssetJSON>;
  //#endregion

  //#region RoundLastBlock
  interface NextRoundDelegateJSON {
    address: string;
    equity: string;
  }
  interface RoundDelegateJSON {
    nextRoundDelegates: NextRoundDelegateJSON[];
    newDelegates: string[];
    maxBeginBalance: string;
    maxTxCount: number;
    rate: string;
  }
  interface RoundLastAssetJSON extends RoundDelegateJSON {
    hash: string;
  }
  interface RoundLastBlockAssetJSON {
    roundLastAsset: RoundLastAssetJSON;
  }
  type RoundLastBlockJSON = BlockJSON<RoundLastBlockAssetJSON>;
  //#endregion

  //#region GenesisBlock
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
  interface TransactionPowOfWorkConfigJSON {
    growthFactor: FractionJSON<string>;
    participationRatio: FractionJSON;
    averageComputingPower: number;
  }
  interface GenesisAssetJSON extends RoundDelegateJSON {
    chainName: string;
    assetType: string;
    magic: string;
    bnid: import("./constanst").BNID_TYPE;
    beginEpochTime: number;
    genesisLocationName: string;
    generateTotalAmount: string;
    minTransactionFeePerByte: FractionJSON;
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
    rewardPercent: RewardPercentJSON;
    ports: PortsJSON;
    rewardPerBlock: RewardPerBlockJSON;
    accountParticipationWeightRatio: RateJSON<string>;
    blockParticipationWeightRatio: RateJSON<string>;
    tpowDiffFormula: string;
    averageComputingPower: number;
    tpowOfWorkExemptionBlocks: number;
  }
  interface GenesisBlockAssetJSON {
    genesisAsset: GenesisAssetJSON;
  }
  type GenesisBlockJSON = BlockJSON<GenesisBlockAssetJSON>;
  //#endregion
}
