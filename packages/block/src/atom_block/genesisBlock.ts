import { BlockFactory } from "./_blockbase";
import { GenesisBlock, BNID_TYPE } from "@bfchain/core-model-block";
import {
  BlockHelper,
  BaseHelper,
  AccountBaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  PROP_SHOULD_GT_FIELD,
  NOT_MATCH,
  PARAM_LOST,
} from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
import { GenerateBlockCore } from "./generateBlock";
import { ReplayBlockCore } from "./replayBlock";
import { VerifyBlockCore } from "./verifyBlock";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "GenesisBlockFactory");

/**
 * genesisBlock 工厂
 *
 */
@Injectable()
export class GenesisBlockFactory extends BlockFactory<GenesisBlock> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public accountBaseHelper: AccountBaseHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public milestonesHelper: MilestonesHelper,
    public asymmetricHelper: AsymmetricHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    public blockGeneratorCalculator: BlockGeneratorCalculator,

    public commonBlockVerify: CommonBlockVerify<GenesisBlock>,
    public verifyBlockCore: VerifyBlockCore<GenesisBlock>,
    public generateBlockCore: GenerateBlockCore<GenesisBlock>,
    public replayBlockCore: ReplayBlockCore<GenesisBlock>,
  ) {
    super();
  }

  /**
   * 从 json 转出 protobuf
   * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
   *
   * @param blockBody
   */
  async fromJSON(
    blockBody: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = GenesisBlock.fromObject(blockBody);
    if (blockBody.transactions && blockBody.transactions.length > 0) {
      block.transactions = blockBody.transactions.map((twi) => {
        return this.transactionInBlockFromJSON(twi);
      });
    } else {
      block.transactions = [];
    }
    if (opts && opts.verify) {
      await this.verify(block, opts.config);
    }
    return block;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param genesisBlockAsset
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    genesisBlockAsset: BFChainCore.GenesisBlockAssetJSON,
    config = this.config,
  ) {
    await super.verifyBlockBody(body, genesisBlockAsset);

    const { baseHelper } = this;
    const Function_Exception_Detail = { function: "verifyBlockBody" };

    const genesisBlock = genesisBlockAsset.genesisBlock;

    if (!genesisBlock) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "genesisBlock",
        function: "verifyTransactionBody",
      });
    }

    const GenesisBlockAsset_Exception_Detail = {
      target: "genesisBlock",
      ...Function_Exception_Detail,
    };

    const assetType = genesisBlock.assetType;
    if (!assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetType",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `assetType ${genesisBlock.assetType}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const chainName = genesisBlock.chainName;
    if (!chainName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "chainName",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `chainName ${genesisBlock.chainName}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const magic = genesisBlock.magic;
    if (!magic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "magic",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(magic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `magic ${genesisBlock.magic}`,
        type: "chain magic",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const bnid = genesisBlock.bnid;
    if (!bnid) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "bnid",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (bnid !== BNID_TYPE.TESTNET && bnid !== BNID_TYPE.MAINNET) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `bnid ${bnid}`,
        to_target: "remark",
        be_compare_prop: "BNID_TYPE",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.beginEpochTime)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `beginEpochTime ${genesisBlock.beginEpochTime}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.genesisNodeAddress) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisNodeAddress",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLnsName(genesisBlock.genesisNodeAddress, config.chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisNodeAddress ${genesisBlock.genesisNodeAddress}`,
        type: "url",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.generateTotalAmount) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "generateTotalAmount",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(genesisBlock.generateTotalAmount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `generateTotalAmount ${genesisBlock.generateTotalAmount}`,
        type: "asset number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveFloatContainZero(genesisBlock.minTransactionFeePerByte)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `minTransactionFeePerByte ${genesisBlock.minTransactionFeePerByte}`,
        type: "float contain zero",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.maxPayloadLength)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxPayloadLength ${genesisBlock.maxPayloadLength}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.maxTPSPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxTPSPerBlock ${genesisBlock.maxTPSPerBlock}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.maxTransactionSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxTransactionSize ${genesisBlock.maxTransactionSize}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.maxBlockRemarkSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxBlockRemarkSize ${genesisBlock.maxBlockRemarkSize}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisBlock.consessusBeforeSyncBlockDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `consessusBeforeSyncBlockDiff ${genesisBlock.consessusBeforeSyncBlockDiff}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisBlock.maxDelegateTxsPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxDelegateTxsPerRound ${genesisBlock.maxDelegateTxsPerRound}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.maxGrabTimesOfGiftAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxGrabTimesOfGiftAsset ${genesisBlock.maxGrabTimesOfGiftAsset}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.issueAssetMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "issueAssetMinChainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisBlock.issueAssetMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `issueAssetMinChainAsset ${genesisBlock.issueAssetMinChainAsset}`,
        type: "asset number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.registerChainMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `registerChainMinChainAsset ${genesisBlock.registerChainMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisBlock.registerChainMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `registerChainMinChainAsset ${genesisBlock.registerChainMinChainAsset}`,
        type: "asset number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.chainAssetAndDigitalAssetExchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `chainAssetAndDigitalAssetExchangeRate ${genesisBlock.chainAssetAndDigitalAssetExchangeRate}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisBlock.chainAssetRewardWeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `chainAssetRewardWeight ${genesisBlock.chainAssetRewardWeight}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisBlock.numberOfTransactionRewardWeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `numberOfTransactionRewardWeight ${genesisBlock.numberOfTransactionRewardWeight}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisBlock.chainAssetRewardWeight + genesisBlock.numberOfTransactionRewardWeight === 0) {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: `genesisBlock.chainAssetRewardWeight + genesisBlock.numberOfTransactionRewardWeight ${
          genesisBlock.chainAssetRewardWeight + genesisBlock.numberOfTransactionRewardWeight
        }`,
        field: 0,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.maxApplyAndConfirmedBlockHeightDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxApplyAndConfirmedBlockHeightDiff ${genesisBlock.maxApplyAndConfirmedBlockHeightDiff}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.blockPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `blockPerRound ${genesisBlock.blockPerRound}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.delegates)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `delegates ${genesisBlock.delegates}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isBoolean(genesisBlock.whetherToAllowDelegateContinusElections)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `whetherToAllowDelegateContinusElections ${genesisBlock.whetherToAllowDelegateContinusElections}`,
        type: "boolean",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisBlock.forgeInterval)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `forgeInterval ${genesisBlock.forgeInterval}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.rewardPercent) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `rewardPercent`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainRewardPercent(genesisBlock.rewardPercent)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `rewardPercent ${genesisBlock.rewardPercent}`,
        type: "chain reward percent",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.ports) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "ports",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainPorts(genesisBlock.ports)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `ports ${genesisBlock.ports}`,
        type: "chain ports",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisBlock.rewardPerBlock) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "rewardPerBlock",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainRewardMilestones(genesisBlock.rewardPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `rewardPerBlock ${genesisBlock.rewardPerBlock}`,
        type: "chain rewards milestones",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisBlock.nextRoundDelegates.length !== config.blockPerRound) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `nextRoundDelegates length ${genesisBlock.nextRoundDelegates.length}`,
        be_compare_prop: config.blockPerRound,
        to_target: "genesisBlockRemark",
        be_target: "config",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisBlock.maxBeginBalance !== "0") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `maxBeginBalance ${genesisBlock.maxBeginBalance}`,
        to_target: "GenesisBlockRemark",
        be_compare_prop: "'0'",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisBlock.maxTxCount !== 0) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `maxTxCount ${genesisBlock.maxTxCount}`,
        to_target: "GenesisBlockRemark",
        be_compare_prop: "0",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const nextRoundDelegates = genesisBlock.nextRoundDelegates;
    if (baseHelper.getVariableType(nextRoundDelegates) !== "[object Array]") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "nextRoundDelegates",
        to_target: "genesisBlock",
        be_compare_prop: "array",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    for (let i = 0; i < nextRoundDelegates.length; i++) {
      const nextRoundDelegate = nextRoundDelegates[i];
      if (!(await this.accountBaseHelper.isAddress(nextRoundDelegate.address))) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `nextRoundDelegates[${i}].address ${nextRoundDelegates[i].address}`,
          type: "account address",
          target: "genesisBlock.nextRoundDelegates",
          ...Function_Exception_Detail,
        });
      }

      if (!this.baseHelper.isValidAccountEquity(nextRoundDelegate.equity)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `nextRoundDelegates[${i}].equity ${nextRoundDelegates[i].equity}`,
          type: "account equity",
          target: "genesisBlock.nextRoundDelegates",
          ...Function_Exception_Detail,
        });
      }
    }

    const {
      participationTotalChainAsset,
      participationTotalFee,
      participationNumberOfAccount,
      participationNumberOfTransaction,
    } = genesisBlock;

    if (!baseHelper.isNaturalNumber(participationTotalChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `participationTotalChainAsset ${participationTotalChainAsset}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationTotalFee)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `participationTotalFee ${participationTotalFee}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationNumberOfAccount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `participationNumberOfAccount ${participationNumberOfAccount}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationNumberOfTransaction)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `participationNumberOfTransaction ${participationNumberOfTransaction}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (
      participationTotalChainAsset +
        participationTotalFee +
        participationNumberOfAccount +
        participationNumberOfTransaction ===
      0
    ) {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: `participationTotalChainAsset + participationTotalFee + participationNumberOfAccount + participationNumberOfTransaction ${
          participationTotalChainAsset +
          participationTotalFee +
          participationNumberOfAccount +
          participationNumberOfTransaction
        }`,
        field: 0,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const {
      growthFactor,
      participationRatio,
      averageComputingPower,
    } = genesisBlock.transactionPowOfWorkConfig;
    // 校验交易POW的难度增长系数
    {
      const {
        denominator: growthFactorDenominator,
        numerator: growthFactorNumerator,
      } = growthFactor;
      const growthFactorNumerator_BI = BigInt(growthFactorNumerator);
      const growthFactorDenominator_BI = BigInt(growthFactorDenominator);
      if (
        !(
          growthFactorNumerator_BI >= growthFactorDenominator_BI &&
          growthFactorDenominator_BI >= BigInt(1)
        )
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `transactionPowOfWorkConfig.growthFactor ${growthFactorDenominator}`,
          type: "positive float",
          ...GenesisBlockAsset_Exception_Detail,
        });
      }
    }
    // 校验交易POW的参与度占比
    if (!baseHelper.isPositiveFloatContainZero(participationRatio)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `transactionPowOfWorkConfig.participationRatio ${participationRatio}`,
        type: "positive float",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(averageComputingPower)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `averageComputingPower ${averageComputingPower}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 genesisBlock
   *
   * @param body
   * @param genesisBlockAsset
   */
  _generateBlock(
    body: BFChainCore.BlockBody,
    genesisBlockAsset: BFChainCore.GenesisBlockAssetJSON,
  ) {
    const block = GenesisBlock.fromObject({
      ...body,
      asset: genesisBlockAsset,
      statisticInfo: {},
    });
    block.generatorPublicKey = body.generatorPublicKey;
    // 绑定区块奖励
    block.reward = "0";

    return block;
  }
}
