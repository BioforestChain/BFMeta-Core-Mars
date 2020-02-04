import { BlockFactory } from "./_blockbase";
import { GenesisBlock } from "@bfchain/core-model-block";
import {
  BlockHelper,
  BaseHelper,
  AccountBaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
  ConfigHelperMap,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  PROP_SHOULD_GT_FIELD,
} from "@bfchain/core-util-exception";
import { Injectable, Inject, ModuleStroge } from "@bfchain/util";
import { BNID_TYPE } from "@bfchain/core-transaction";
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
    public moduleMap: ModuleStroge,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private configMap: ConfigHelperMap,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
  ) {
    super();
  }

  /**
   * 从 json 转出 protobuf
   * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
   *
   * @param blockBody
   */
  fromJSON(
    blockBody: BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = GenesisBlock.fromObject(blockBody);
    block.transactions = blockBody.transactions.map(twi => {
      return this.transactionInBlockFromJSON(twi);
    });
    if (opts && opts.verify) {
      this.verify(block, opts.config);
    }
    return block;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param remark
   */
  verifyBlockBody(
    body: BFChainCore.BlockBody,
    remark: BFChainCore.GenesisBlockRemarkJSON,
    config = this.config,
  ) {
    super.verifyBlockBody(body, remark);

    const { baseHelper } = this;
    const Function_Exception_Detail = { function: "verifyBlockBody" };
    const GenesisBlockRemark_Exception_Detail = {
      target: "GenesisBlock.remark",
      ...Function_Exception_Detail,
    };

    if (!remark.assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetType",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetType(remark.assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assetType",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.chainName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "chainName",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainName(remark.chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainName",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.magic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "magic",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(remark.magic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "magic",
        type: "chain magic",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    const bnid = remark.bnid;
    if (!bnid) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "bnid",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (bnid !== BNID_TYPE.TESTNET && bnid !== BNID_TYPE.MAINNET) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "bnid",
        to_target: "remark",
        be_compare_prop: "BNID_TYPE",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.beginEpochTime)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "beginEpochTime",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.genesisNodeAddress) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisNodeAddress",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLnsName(remark.genesisNodeAddress, config.chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "genesisNodeAddress",
        type: "url",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.generateTotalAmount) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "generateTotalAmount",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(remark.generateTotalAmount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "generateTotalAmount",
        type: "asset number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveFloatContainZero(remark.minTransactionFeePerByte)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "minTransactionFeePerByte",
        type: "float contain zero",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.maxPayloadLength)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxPayloadLength",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.maxTPSPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxTPSPerBlock",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.maxTransactionSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxTransactionSize",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.maxBlockRemarkSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxBlockRemarkSize",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(remark.consessusBeforeSyncBlockDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "consessusBeforeSyncBlockDiff",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(remark.maxDelegateTxsPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxDelegateTxsPerRound",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.issueAssetMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "issueAssetMinChainAsset",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(remark.issueAssetMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "issueAssetMinChainAsset",
        type: "asset number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.issueSubchainMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "issueSubchainMinChainAsset",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(remark.issueSubchainMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "issueSubchainMinChainAsset",
        type: "asset number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.chainAssetAndDigitalAssetExchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainAssetAndDigitalAssetExchangeRate",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.chainAssetAndSubchainAssetExchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainAssetAndSubchainAssetExchangeRate",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(remark.chainAssetRewardWeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainAssetRewardWeight",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(remark.numberOfTransactionRewardWeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "numberOfTransactionRewardWeight",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (remark.chainAssetRewardWeight + remark.numberOfTransactionRewardWeight === 0) {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: "remark.chainAssetRewardWeight + remark.numberOfTransactionRewardWeight",
        field: 0,
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.maxApplyAndConfirmedBlockHeightDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxApplyAndConfirmedBlockHeightDiff",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.blockPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "blockPerRound",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.delegates)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "delegates",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isBoolean(remark.whetherToAllowDelegateContinusElections)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "whetherToAllowDelegateContinusElections",
        type: "boolean",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(remark.forgeInterval)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "forgeInterval",
        type: "positive integer",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.rewardPercent) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "rewardPercent",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainRewardPercent(remark.rewardPercent)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "rewardPercent",
        type: "chain reward percent",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.ports) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "ports",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainPorts(remark.ports)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "ports",
        type: "chain ports",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!remark.rewardPerBlock) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "rewardPerBlock",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainRewardMilestones(remark.rewardPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "rewardPerBlock",
        type: "chain rewards milestones",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    // FIXME: config 子链时 config 不对
    // if (nextRoundDelegates.length !== this.config.blockPerRound) {
    //   throw new ArgumentIllegalException(NOT_MATCH, {
    //     to_compare_prop: "nextRoundDelegates.length",
    //     be_compare_prop: "blockPerRound",
    //     to_target: "genesisBlockRemark",
    //     be_target: "config",
    //     ...GenesisBlockRemark_Exception_Detail,
    //   });
    // }

    if (remark.maxBeginBalance !== "0") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "maxBeginBalance",
        to_target: "GenesisBlockRemark",
        be_compare_prop: "'0'",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (remark.maxTxCount !== 0) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "maxTxCount",
        to_target: "GenesisBlockRemark",
        be_compare_prop: "0",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    const nextRoundDelegates = remark.nextRoundDelegates;
    if (baseHelper.getVariableType(nextRoundDelegates) !== "[object Array]") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "nextRoundDelegates",
        to_target: "GenesisBlockRemark",
        be_compare_prop: "array",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    nextRoundDelegates.forEach((nextRoundDelegate, i) => {
      if (!this.accountBaseHelper.isAddress(nextRoundDelegate.address)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `nextRoundDelegates[${i}].address`,
          type: "account address",
          ...Function_Exception_Detail,
        });
      }

      if (!this.baseHelper.isValidAccountEquity(nextRoundDelegate.equity)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `nextRoundDelegates[${i}].equity`,
          type: "account equity",
          ...Function_Exception_Detail,
        });
      }
    });

    if (!baseHelper.isString(remark.debug)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "debug",
        type: "string",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isString(remark.info)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "info",
        type: "string",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isValidBlockParticipation(remark.blockParticipation)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "blockParticipation",
        type: "block participation",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    const {
      participationTotalChainAsset,
      participationTotalFee,
      participationNumberOfAccount,
      participationNumberOfTransaction,
    } = remark;

    if (!baseHelper.isNaturalNumber(participationTotalChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationTotalChainAsset",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationTotalFee)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationTotalFee",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationNumberOfAccount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationNumberOfAccount",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationNumberOfTransaction)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationNumberOfTransaction",
        type: "natural number",
        ...GenesisBlockRemark_Exception_Detail,
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
        prop:
          "participationTotalChainAsset + participationTotalFee + participationNumberOfAccount + participationNumberOfTransaction",
        field: 0,
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    // 校验交易POW的难度增长系数
    {
      const {
        denominator: growthFactorDenominator,
        numerator: growthFactorNumerator,
      } = remark.transactionPowOfWorkConfig.growthFactor;
      const growthFactorNumerator_BI = BigInt(growthFactorNumerator);
      const growthFactorDenominator_BI = BigInt(growthFactorDenominator);
      if (
        !(
          growthFactorNumerator_BI >= growthFactorDenominator_BI &&
          growthFactorDenominator_BI >= BigInt(1)
        )
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "transactionPowOfWorkConfig.growthFactor",
          type: "positive float",
          ...GenesisBlockRemark_Exception_Detail,
        });
      }
    }
    // 校验交易POW的参与度占比
    if (
      !baseHelper.isPositiveFloatContainZero(remark.transactionPowOfWorkConfig.participationRatio)
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transactionPowOfWorkConfig.participationRatio",
        type: "positive float",
        ...GenesisBlockRemark_Exception_Detail,
      });
    }

    if (remark.parentGenesisBlock) {
      const parentGenesisBlock = remark.parentGenesisBlock;
      let chainConfig = this.configMap.get(parentGenesisBlock.magic);
      if (!chainConfig) {
        chainConfig = new ConfigHelper(parentGenesisBlock, config.business);
      }

      const genesisBlock = this._blockCore.recombineBlock<
        BFChainCore.Block<BFChainCore.GenesisBlockRemarkJSON>
      >(parentGenesisBlock);
      this._blockCore
        .getBlockFactoryFromHeight<BFChainCore.Block<BFChainCore.GenesisBlockRemarkJSON>>(
          parentGenesisBlock.height,
        )
        .verify(genesisBlock, chainConfig);
    }
  }
  @Inject("bfchain-core:BlockCore")
  private _blockCore!: import("../").BlockCore;
  // @Inject("___")
  // private resolveBFChainCore!:()=>{}

  /**
   * 初始化 genesisBlock
   *
   * @param body
   * @param genesisBlockRemark
   */
  _generateBlock(
    body: BFChainCore.BlockBody,
    genesisBlockRemark: BFChainCore.GenesisBlockRemarkJSON,
  ) {
    const block = GenesisBlock.fromObject({
      ...body,
      remark: genesisBlockRemark,
      statisticInfo: {},
    });
    block.generatorPublicKey = body.generatorPublicKey;
    // 绑定区块奖励
    block.reward = "0";

    return block;
  }
}
