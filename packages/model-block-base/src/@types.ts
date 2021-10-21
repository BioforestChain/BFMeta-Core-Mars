declare namespace BFChainCore {
  type Block<AJ extends object = object> = import("./block").Block<AJ>;
  type BlockModelConstructor = typeof import("./").Block;

  type GetBlockMessageAssetModel<T> = T extends BlockJSON<infer U> ? U : any;
  type GetBlockAssetModel<T> =
    GetBlockMessageAssetModel<T> extends import("@bfchain/protobuf").Message<infer U> ? U : any;

  type GetBlockAssetJSON<T extends Block> = T["ASSET_JSON_TYPE"];

  interface BlockWithoutTransactionJSON<AssetJSON extends object = object> {
    /**区块版本号 */
    version: number;
    /**区块高度 */
    height: number;
    /**区块大小 */
    blockSize: number;
    /**区块时间戳 */
    timestamp: number;
    /**区块签名 */
    signature: string;
    /**区块安全签名 */
    signSignature?: string;
    /**锻造者gong'yao */
    generatorPublicKey: string;
    /**锻造者的安全公钥 */
    generatorSecondPublicKey?: string;
    /**锻造者权益 */
    generatorEquity: string;
    /**区块事件数量 */
    numberOfTransactions: number;
    /**区块事件摘要 */
    payloadHash: string;
    /**区块事件摘要长度 */
    payloadLength: number;
    /**前块签名 */
    previousBlockSignature: string;
    /**总发生资产量 */
    totalAmount: string;
    /**总发生手续费 */
    totalFee: string;
    /**区块奖励值 */
    reward: string;
    /**区块的链标识符 */
    magic: string;
    /**区块参与度 */
    blockParticipation: string;
    /**区块备注信息 */
    remark: { [key: string]: string };
    /**区块附加信息 */
    asset: AssetJSON;
    /**区块统计信息 */
    statisticInfo: StatisticInfoJSON;
    /**锻造者掉线列表 */
    roundOfflineGeneratersHashMap: RoundOfflineGeneratersHashMap;
  }
  interface BlockJSON<AssetJSON extends object = object>
    extends BlockWithoutTransactionJSON<AssetJSON> {
    /**事件 */
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
    /**权益在块内的索引 */
    index: number;
    /**区块打包的事件类型统计明细，JSON 对象 */
    typeStatisticHashMap: { [baseType: number]: CountAndAmountStatisticJSON };
    /**区块打包的事件权益类型统计，JSON 对象 */
    total: CountAndAmountStatisticJSON;
  }

  interface StatisticInfoJSON {
    /**区块打包的事件的总手续费 */
    totalFee: string;
    /**区块打包的事件的总权益值（不区分权益类型） */
    totalAsset: string;
    /**区块打包的事件的总主权益值 */
    totalChainAsset: string;
    /**区块打包的事件涉及的总账户数 */
    totalAccount: number;
    /**区块打包的事件权益类型统计明细，JSON 对象 */
    assetStatisticHashMap: { [index: number]: AssetStatisticJSON };
  }

  //#endregion

  //#region CommonBlock
  interface CommonBlockAssetJSON {}
  type CommonBlockJSON = BlockJSON<CommonBlockAssetJSON>;
  //#endregion

  //#region RoundLastBlock
  interface NextRoundDelegateJSON {
    /**受托人账户地址 */
    address: string;
    /**受托人上一轮获得的权益 */
    equity: string;
  }
  interface RoundDelegateJSON {
    /**下一轮的打块账户列表 */
    nextRoundDelegates: NextRoundDelegateJSON[];
    /**新注册的受托人 */
    newDelegates: string[];
    /**上一轮投票账户中的最大轮末主权益量 */
    maxBeginBalance: string;
    /**上一轮投票账户中最大的事件量 */
    maxTxCount: number;
    /**上一轮投票账户的最大轮末主权益量和上一轮投票账户的最大事件的比 */
    rate: string;
  }
  interface RoundLastAssetJSON extends RoundDelegateJSON {
    /**链上链hash */
    hash: string;
  }
  interface RoundLastBlockAssetJSON {
    /**轮末块附带信息 */
    roundLastAsset: RoundLastAssetJSON;
  }
  type RoundLastBlockJSON = BlockJSON<RoundLastBlockAssetJSON>;
  //#endregion

  //#region GenesisBlock
  interface RewardPercentJSON {
    /**投票占区块总奖励的百分比 */
    votePercent: FractionJSON;
    /**打块占区块总奖励的百分比 */
    forgePercent: FractionJSON;
  }
  interface PortsJSON {
    /**共识端口号 */
    port: number;
    /**节点扫描端口号 */
    scan_peer_port: number;
  }
  interface RewardPerBlockJSON {
    /**奖励变动的区块里程 */
    readonly heights: number[];
    /**每个区块里程对应奖励的资产数量 */
    readonly rewards: string[];
  }
  interface TransactionPowOfWorkConfigJSON {
    /**链的 pow 难度增长系数 */
    growthFactor: FractionJSON<string>;
    /**链的 pow 计算参与比率 */
    participationRatio: FractionJSON;
  }

  interface AccountParticipationWeightRatioJSON {
    /**账户上一轮末持有的主权益量的权重 */
    balanceWeight: number;
    /**账户上一轮事件量的权重 */
    numberOfTransactionsWeight: number;
  }

  interface BlockParticipationWeightRatioJSON {
    /**区块打包的主权益量的权重 */
    balanceWeight: number;
    /**区块打包的事件量的权重 */
    numberOfTransactionsWeight: number;
  }

  interface GenesisAssetJSON extends RoundDelegateJSON {
    /**链名 */
    chainName: string;
    /**链主权益名 */
    assetType: string;
    /**链网络标识符 */
    magic: string;
    /**链网络类型，只能是 'b' 或 'c'，b 为正式网络，c 为测试网络 */
    bnid: BFChainCore.BNID_TYPE;
    /**链创世时间 */
    beginEpochTime: number;
    /**链创世位名 */
    genesisLocationName: string;
    /**链创世账户初始持有的主权益量 */
    genesisAmount: string;
    /**链事件每字节需要支付的最小手续费 */
    minTransactionFeePerByte: FractionJSON;
    /**链上事件体最大字节数 */
    maxTransactionSize: number;
    /**链上区块体最大字节数 */
    maxBlockSize: number;
    /**链上区块体最大处理的事件 tps */
    maxTPSPerBlock: number;
    /**删除分叉时至少需要落后的高度 */
    consessusBeforeSyncBlockDiff: number;
    /**每轮能处理的注册受托人数量 */
    maxDelegateTxsPerRound: number;
    /**权益赠送事件最大可抢次数 */
    maxGrabTimesOfGiftAsset: number;
    /**发行权益的账户最小持有的链主权益数量 */
    issueAssetMinChainAsset: string;
    /**冻结的主权益数允许发行的最大权益数量 */
    maxMultipleOfAssetAndMainAsset: FractionJSON<string>;
    /**注册创世块的账户最小持有的主权益数量 */
    registerChainMinChainAsset: string;
    /**最大的过期区块间隔数量 */
    maxApplyAndConfirmedBlockHeightDiff: number;
    /**每轮的区块数量 */
    blockPerRound: number;
    /**创世受托人数量 */
    delegates: number;
    /**是否允许受托人连续参与竞选 */
    whetherToAllowDelegateContinusElections: boolean;
    /**区块间隔 */
    forgeInterval: number;
    /**奖励分配比例，JSON 对象 */
    rewardPercent: RewardPercentJSON;
    /**区块链端口号，JSON 对象 */
    ports: PortsJSON;
    /**区块奖励，JSON 对象 */
    rewardPerBlock: RewardPerBlockJSON;
    /**账户参与度权重比，JSON 对象 */
    accountParticipationWeightRatio: AccountParticipationWeightRatioJSON;
    /**区块参与度权重比，JSON 对象 */
    blockParticipationWeightRatio: BlockParticipationWeightRatioJSON;
    /**构建tpow的难度系数 */
    averageComputingPower: number;
    /**tpow豁免的区块高度 */
    tpowOfWorkExemptionBlocks: number;
    /**tpow配置，JSON对象 */
    transactionPowOfWorkConfig: TransactionPowOfWorkConfigJSON;
  }
  interface GenesisBlockAssetJSON {
    /**创世块附带信息 */
    genesisAsset: GenesisAssetJSON;
  }
  type GenesisBlockJSON = BlockJSON<GenesisBlockAssetJSON>;
  //#endregion
}
