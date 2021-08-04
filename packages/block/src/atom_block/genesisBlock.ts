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
  NOT_MATCH,
  PARAM_LOST,
  GENESIS_DELEGATE_NOT_ENOUGH,
  PROP_SHOULD_GTE_FIELD,
} from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
import { GenerateBlockCore } from "./generateBlock";
import { ReplayBlockCore } from "./replayBlock";
import { VerifyBlockCore } from "./verifyBlock";
import { TPOWDiffHelper } from "@bfchain/core-helper-transaction-pow";
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
    public tpowDiffHelper: TPOWDiffHelper,
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

    const genesisAsset = genesisBlockAsset.genesisAsset;

    if (!genesisAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "genesisBlock",
        function: "verifyTransactionBody",
      });
    }

    const GenesisBlockAsset_Exception_Detail = {
      target: "genesisBlock",
      ...Function_Exception_Detail,
    };

    const assetType = genesisAsset.assetType;
    if (!assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetType",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `assetType ${genesisAsset.assetType}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const chainName = genesisAsset.chainName;
    if (!chainName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "chainName",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `chainName ${genesisAsset.chainName}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const magic = genesisAsset.magic;
    if (!magic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "magic",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(magic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `magic ${genesisAsset.magic}`,
        type: "chain magic",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const bnid = genesisAsset.bnid;
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

    if (!baseHelper.isPositiveInteger(genesisAsset.beginEpochTime)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `beginEpochTime ${genesisAsset.beginEpochTime}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const genesisLocationName = genesisAsset.genesisLocationName;
    if (!genesisLocationName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisLocationName",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLnsName(genesisLocationName, config.chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisLocationName ${genesisAsset.genesisLocationName}`,
        type: "url",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.genesisAmount) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisAmount",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(genesisAsset.genesisAmount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisAmount ${genesisAsset.genesisAmount}`,
        type: "asset number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveFloatContainZero(genesisAsset.minTransactionFeePerByte)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `minTransactionFeePerByte ${genesisAsset.minTransactionFeePerByte}`,
        type: "float contain zero",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxTPSPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxTPSPerBlock ${genesisAsset.maxTPSPerBlock}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxTransactionSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxTransactionSize ${genesisAsset.maxTransactionSize}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxBlockSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxBlockSize ${genesisAsset.maxBlockSize}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisAsset.consessusBeforeSyncBlockDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `consessusBeforeSyncBlockDiff ${genesisAsset.consessusBeforeSyncBlockDiff}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisAsset.maxDelegateTxsPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxDelegateTxsPerRound ${genesisAsset.maxDelegateTxsPerRound}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxGrabTimesOfGiftAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxGrabTimesOfGiftAsset ${genesisAsset.maxGrabTimesOfGiftAsset}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.issueAssetMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "issueAssetMinChainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisAsset.issueAssetMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `issueAssetMinChainAsset ${genesisAsset.issueAssetMinChainAsset}`,
        type: "asset number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    // if (!genesisAsset.maxMultipleOfAssetAndMainAsset) {
    //   throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
    //     prop: "maxMultipleOfAssetAndMainAsset",
    //     ...GenesisBlockAsset_Exception_Detail,
    //   });
    // }
    // if (!baseHelper.isPositiveBigFloatNotContainZero(genesisAsset.maxMultipleOfAssetAndMainAsset)) {
    //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
    //     prop: `maxMultipleOfAssetAndMainAsset ${genesisAsset.maxMultipleOfAssetAndMainAsset}`,
    //     type: "big float not contain zero",
    //     ...GenesisBlockAsset_Exception_Detail,
    //   });
    // }

    if (!genesisAsset.registerChainMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `registerChainMinChainAsset ${genesisAsset.registerChainMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisAsset.registerChainMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `registerChainMinChainAsset ${genesisAsset.registerChainMinChainAsset}`,
        type: "asset number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (
      !baseHelper.isValidAccountParticipationWeightRatio(
        genesisAsset.accountParticipationWeightRatio,
      )
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `accountParticipationWeightRatio ${genesisAsset.accountParticipationWeightRatio}`,
        type: "accountParticipationWeightRatio",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (
      !baseHelper.isValidBlockParticipationWeightRatio(genesisAsset.blockParticipationWeightRatio)
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `blockParticipationWeightRatio ${genesisAsset.blockParticipationWeightRatio}`,
        type: "blockParticipationWeightRatio",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxApplyAndConfirmedBlockHeightDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `maxApplyAndConfirmedBlockHeightDiff ${genesisAsset.maxApplyAndConfirmedBlockHeightDiff}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const { blockPerRound, forgeInterval, delegates, whetherToAllowDelegateContinusElections } =
      genesisAsset;

    if (!baseHelper.isPositiveInteger(blockPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `blockPerRound ${blockPerRound}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (blockPerRound < 2) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: "blockPerRound",
        field: 2,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(delegates)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `delegates ${delegates}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isBoolean(whetherToAllowDelegateContinusElections)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `whetherToAllowDelegateContinusElections ${whetherToAllowDelegateContinusElections}`,
        type: "boolean",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (whetherToAllowDelegateContinusElections) {
      if (delegates < blockPerRound) {
        throw new ArgumentIllegalException(GENESIS_DELEGATE_NOT_ENOUGH, {
          expected: blockPerRound,
          actual: delegates,
          ...GenesisBlockAsset_Exception_Detail,
        });
      }
    } else {
      if (delegates < blockPerRound * 2) {
        throw new ArgumentIllegalException(GENESIS_DELEGATE_NOT_ENOUGH, {
          expected: blockPerRound * 2,
          actual: delegates,
          ...GenesisBlockAsset_Exception_Detail,
        });
      }
    }

    if (!baseHelper.isPositiveInteger(forgeInterval)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `forgeInterval ${forgeInterval}`,
        type: "positive integer",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (forgeInterval < 5) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: `forgeInterval ${forgeInterval}`,
        field: 5,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.rewardPercent) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `rewardPercent`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainRewardPercent(genesisAsset.rewardPercent)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `rewardPercent ${genesisAsset.rewardPercent}`,
        type: "chain reward percent",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.ports) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "ports",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainPorts(genesisAsset.ports)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `ports ${genesisAsset.ports}`,
        type: "chain ports",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.rewardPerBlock) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "rewardPerBlock",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainRewardMilestones(genesisAsset.rewardPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `rewardPerBlock ${genesisAsset.rewardPerBlock}`,
        type: "chain rewards milestones",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisAsset.nextRoundDelegates.length !== config.blockPerRound) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `nextRoundDelegates length ${genesisAsset.nextRoundDelegates.length}`,
        be_compare_prop: `config.blockPerRound: ${config.blockPerRound}`,
        to_target: "genesisBlockRemark",
        be_target: "config",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisAsset.maxBeginBalance !== "0") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `maxBeginBalance ${genesisAsset.maxBeginBalance}`,
        to_target: "GenesisBlockRemark",
        be_compare_prop: "'0'",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisAsset.maxTxCount !== 0) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `maxTxCount ${genesisAsset.maxTxCount}`,
        to_target: "GenesisBlockRemark",
        be_compare_prop: "0",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const nextRoundDelegates = genesisAsset.nextRoundDelegates;
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

    // 校验 TPOW 难度计算公式是否合法
    // if (!this.tpowDiffHelper.isValidTpowDiffFormula(genesisAsset.tpowDiffFormula)) {
    //   console.log(genesisAsset.tpowDiffFormula);
    //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
    //     prop: "tpowDiffFormula",
    //     type: "tpow diff formula",
    //     ...GenesisBlockAsset_Exception_Detail,
    //   });
    // }

    if (!baseHelper.isNaturalNumber(genesisAsset.averageComputingPower)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `averageComputingPower ${genesisAsset.averageComputingPower}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisAsset.tpowOfWorkExemptionBlocks)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `tpowOfWorkExemptionBlocks ${genesisAsset.tpowOfWorkExemptionBlocks}`,
        type: "natural number",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const { growthFactor, participationRatio } = genesisAsset.transactionPowOfWorkConfig;
    // 校验交易POW的难度增长系数
    {
      const { denominator: growthFactorDenominator, numerator: growthFactorNumerator } =
        growthFactor;
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
