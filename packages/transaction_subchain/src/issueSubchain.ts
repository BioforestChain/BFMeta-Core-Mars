import { TransactionFactory, BNID_TYPE } from "@bfchain/core-transaction";
import { IssueSubchainTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import {
  TransactionHelper,
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
  ConfigHelperMap,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  NOT_MATCH,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  NOT_IN_EXPECTED_RANGE,
  TOO_SHORT,
  PROP_SHOULD_GTE_FIELD,
  SHOULD_BE,
  SHOULD_NOT_EXIST,
  PROP_SHOULD_GT_FIELD,
} from "@bfchain/core-util-exception";
import { Injectable, ModuleStroge, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueSubchainTransactionFactory",
);

/**
 * issueSubchain 交易工厂
 *
 */
@Injectable()
export class IssueSubchainTransactionFactory extends TransactionFactory<IssueSubchainTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private configMap: ConfigHelperMap,
    private moduleMap: ModuleStroge,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 issueSubchain 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且是 dapp 的拥有者地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   *  key 值必须是 "magic" value 值必须是设定的值
   * asset 是完整的 issueSubchain 信息
   * 需要携带子链名称：3-20 位 大小写字母或数字组成的字符串
   * 需要携带子链名称缩写：3-5 位 大写字母组成的字符串
   * 需要携带子链的网络标识符：1-16 位 大写字母或数字组成的字符串
   * 需要携带已知的子链的网络识别码 b/c
   * 需要携带子链的创世时间：自然数
   * 需要携带子链的父链的创世节点地址：字符串
   * 需要携带子链的创世节点地址：字符串
   * 需要携带子链的创世账户初始余额：数字组成的字符串
   * 需要携带子链的每字节手续费：浮点数
   * 需要携带子链的每个区块最大交易量：正整数
   * 需要携带子链的每个账户每个区块最大交易量：正整数
   * 需要携带子链的最大区块长度：正整数
   * 需要携带子链的每个区块最大的 tps：正整数
   * 需要携带子链的最大的交易字节数：正整数
   * 需要携带子链的最大区块 remark 字节数：正整数
   * 需要携带子链的区块不同数量大于某个值时同步前需要先共识的：正整数
   * 需要携带子链的每轮可处理的受托人交易数量：正整数
   * 需要携带子链的发行资产最小的持有本链资产数量：数字组成的字符串
   * 需要携带子链的发行子链最小的持有本链资产数量：数字组成的字符串
   * 需要携带子链的链资产和数字资产的兑换比例：正整数
   * 需要携带子链的链资产和子链资产的兑换比例：正整数
   * 需要携带子链的链资产的奖励权重：正整数
   * 需要携带子链的交易量的奖励权重：正整数
   * 需要携带子链的交易的发起高度和确认高度最大的区块高度间隔：正整数
   * 需要携带子链的每轮的区块数量：正整数
   * 需要携带子链的创世受托人数量：正整数
   * 需要携带子链的区块时间间隔：正整数
   * 需要携带子链的奖励比例：包含打块奖励占比和投票奖励占比，总和为 1
   * 需要携带子链的端口号：包含 默认端口号和节点扫描端口号 1-65535
   * 需要携带子链的奖励里程：包含区块高度数组和奖励数组，奖励数组比高度数组的长度大 1，区块数组中下一个值必须比上一个值大
   * 需要携带子链的父链信息：包含父链的网络标识符、父链的链域名、父链的资产名、父链的链域名
   * 需要携带子链的创世块：子链生成的创世块
   * 验证创世块信息是否合法
   *
   * @param body
   * @param issueSubchainAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueSubchainAsset: BFChainCore.IssueSubchainAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, issueSubchainAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "magic") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "magic",
        ...Function_Exception_Detail,
      });
    }

    const issueSubchain = issueSubchainAsset.issueSubchain;

    if (!issueSubchain) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "issueSubchain",
        function: "verifyTransactionBody",
      });
    }

    const IssueSubchainAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "issueSubchainAsset",
    } as const;

    const chainName = issueSubchain.chainName;
    if (!chainName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "name",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isLowerCaseString(chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "name",
        type: "lowercase",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (chainName.length < 3 || chainName.length > 8) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "name",
        type: "string length",
        min: 3,
        max: 8,
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const assetType = issueSubchain.assetType;
    if (!assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetType",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isUpperCaseString(assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assetType",
        type: "uppercase",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (assetType.length < 3 || assetType.length > 5) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "assetType",
        type: "string length",
        min: 3,
        max: 5,
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const magic = issueSubchain.magic;
    if (!magic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "magic",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isUpperCaseOrNumber(magic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "magic",
        type: "uppercase or number",
      });
    }

    if (magic.length < 9 || magic.length > 16) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "magic",
        type: "string length",
        min: 9,
        max: 16,
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (storage.value !== magic) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "magic",
        to_target: "storage",
        be_target: "issueSubchain",
        ...Function_Exception_Detail,
      });
    }

    const bnid = issueSubchain.bnid;
    if (!bnid) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "bnid",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (bnid !== BNID_TYPE.TESTNET && bnid !== BNID_TYPE.MAINNET) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "bnid",
        to_target: "issueSubchain",
        be_compare_prop: "BNID_TYPE",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.beginEpochTime)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "beginEpochTime",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const genesisNodeAddress = issueSubchain.genesisNodeAddress;
    if (!genesisNodeAddress) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisNodeAddress",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLnsName(genesisNodeAddress, chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "genesisNodeAddress",
        type: "string",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const generateTotalAmount = issueSubchain.generateTotalAmount;
    if (!generateTotalAmount) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "generateTotalAmount",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(generateTotalAmount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "generateTotalAmount",
        type: "asset number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveFloatContainZero(issueSubchain.minTransactionFeePerByte)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "minTransactionFeePerByte",
        type: "float contain zero",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.maxPayloadLength)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxPayloadLength",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.maxTPSPerBlock)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxTPSPerBlock",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.maxTransactionSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxTransactionSize",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.maxBlockRemarkSize)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxBlockRemarkSize",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(issueSubchain.consessusBeforeSyncBlockDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "consessusBeforeSyncBlockDiff",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(issueSubchain.maxDelegateTxsPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxDelegateTxsPerRound",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const issueAssetMinChainAsset = issueSubchain.issueAssetMinChainAsset;
    if (!issueAssetMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "issueAssetMinChainAsset",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(issueAssetMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "issueAssetMinChainAsset",
        type: "asset number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const issueSubchainMinChainAsset = issueSubchain.issueSubchainMinChainAsset;
    if (!issueSubchainMinChainAsset) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "issueSubchainMinChainAsset",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(issueSubchainMinChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "issueSubchainMinChainAsset",
        type: "asset number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.chainAssetAndDigitalAssetExchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainAssetAndDigitalAssetExchangeRate",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.chainAssetAndSubchainAssetExchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainAssetAndSubchainAssetExchangeRate",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(issueSubchain.chainAssetRewardWeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "chainAssetRewardWeight",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(issueSubchain.numberOfTransactionRewardWeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "numberOfTransactionRewardWeight",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (
      issueSubchain.chainAssetRewardWeight + issueSubchain.numberOfTransactionRewardWeight ===
      0
    ) {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop:
          "issueSubchain.chainAssetRewardWeight + issueSubchain.numberOfTransactionRewardWeight",
        field: 0,
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.maxApplyAndConfirmedBlockHeightDiff)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxApplyAndConfirmedBlockHeightDiff",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.blockPerRound)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "blockPerRound",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.delegates)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "delegates",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isBoolean(issueSubchain.whetherToAllowDelegateContinusElections)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "whetherToAllowDelegateContinusElections",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(issueSubchain.forgeInterval)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "forgeInterval",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const rewardPercent = issueSubchain.rewardPercent;
    if (!rewardPercent) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "rewardsPercent",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const { votePercent, forgePercent } = rewardPercent;
    if (!baseHelper.isPositiveFloatContainZero(forgePercent)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "forgePercent",
        type: "positive float",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveFloatContainZero(votePercent)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "votePercent",
        type: "positive float",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (votePercent.denominator !== forgePercent.denominator) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "denominator",
        be_compare_prop: "votePercent",
        to_target: "denominator",
        be_target: "forgePercent",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (votePercent.numerator + forgePercent.numerator !== forgePercent.denominator) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "numerator sum",
        be_compare_prop: "denominator",
        to_target: "rewardPercent",
        be_target: "rewardPercent",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const ports = issueSubchain.ports;
    if (!ports) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "ports",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const { port, scan_peer_port } = ports;

    if (!baseHelper.isNaturalNumber(port)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "port",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (port <= 0 && port >= 65536) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "port",
        min: 1,
        max: 65535,
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(scan_peer_port)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "scan_peer_port",
        type: "positive integer",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (scan_peer_port <= 0 && scan_peer_port >= 65536) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "scan_peer_port",
        min: 1,
        max: 65535,
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const rewardPerBlock = issueSubchain.rewardPerBlock;
    if (!rewardPerBlock) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "rewardPerBlock",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const { heights, rewards } = rewardPerBlock;
    if (!baseHelper.isArray(heights)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "heights",
        type: "array",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const hlen = heights.length;
    const rlen = rewards.length;
    if ((hlen === 0 && rlen !== 0) || (hlen !== 0 && rlen === 0)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "rewardPerBlock.heights and rewardPerBlock.rewards",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (hlen === 1) {
      if (!baseHelper.isPositiveInteger(heights[0])) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "height",
          type: "positive integer",
          ...IssueSubchainAsset_Exception_Detail,
        });
      }
    } else {
      for (let i = 0; i < hlen - 1; i += 2) {
        if (!baseHelper.isPositiveInteger(heights[i])) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "height",
            value: heights[i],
            type: "positive integer",
            ...IssueSubchainAsset_Exception_Detail,
          });
        }
        const nextIndex = i + 1;
        if (!baseHelper.isPositiveInteger(heights[nextIndex])) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "height",
            value: heights[nextIndex],
            type: "positive integer",
            ...IssueSubchainAsset_Exception_Detail,
          });
        }
        if (heights[i] >= heights[nextIndex]) {
          throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
            prop: "height",
            field: "next height",
            ...IssueSubchainAsset_Exception_Detail,
          });
        }
      }
    }

    if (!baseHelper.isArray(rewards)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "rewards",
        type: "array",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    for (const reward of rewards) {
      if (!baseHelper.isValidAssetNumber(reward)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "reward",
          type: "asset number",
          ...IssueSubchainAsset_Exception_Detail,
        });
      }
    }

    const {
      participationTotalChainAsset,
      participationTotalFee,
      participationNumberOfAccount,
      participationNumberOfTransaction,
    } = issueSubchain;

    if (!baseHelper.isNaturalNumber(participationTotalChainAsset)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationTotalChainAsset",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationTotalFee)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationTotalFee",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationNumberOfAccount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationNumberOfAccount",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(participationNumberOfTransaction)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "participationNumberOfTransaction",
        type: "natural number",
        ...IssueSubchainAsset_Exception_Detail,
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
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    // 校验交易POW的难度增长系数
    {
      const {
        denominator: growthFactorDenominator,
        numerator: growthFactorNumerator,
      } = issueSubchain.transactionPowOfWorkConfig.growthFactor;
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
          ...IssueSubchainAsset_Exception_Detail,
        });
      }
    }

    // 校验交易POW的参与度占比
    if (
      !baseHelper.isPositiveFloatContainZero(
        issueSubchain.transactionPowOfWorkConfig.participationRatio,
      )
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transactionPowOfWorkConfig.participationRatio",
        type: "positive float",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    const subGenesisBlock = issueSubchain.genesisBlock;
    if (!subGenesisBlock) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisBlock",
        ...IssueSubchainAsset_Exception_Detail,
      });
    }

    if (!subGenesisBlock.remark.parentGenesisBlock) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "parentGenesisBlock",
        ...IssueSubchainAsset_Exception_Detail,
        target: "issueSubchainAsset.issueSubchain.genesisBlock",
      });
    }

    let subchainConfig = this.configMap.get(subGenesisBlock.magic);
    if (!subchainConfig) {
      // FIXME: 没有子链的配置文件就生成一个
      subchainConfig = new ConfigHelper(subGenesisBlock, this.configHelper.business);
    }
    // const BFChainCoreFactory = this.moduleMap.get<typeof import("../../index").BFChainCoreFactory>(
    //   "BFChainCoreFactory",
    // );
    // if (!BFChainCoreFactory) {
    //   throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
    //     prop: "BFChainCoreFactory",
    //     ...IssueSubchainAsset_Exception_Detail,
    //   });
    // }
    // const subchainCore = BFChainCoreFactory({
    //   config: subchainConfig,
    //   Buffer: this.moduleMap.get("Buffer"),
    //   cryptoHelper: this.moduleMap.get("cryptoHelper"),
    //   keypairHelper: this.moduleMap.get("keypairHelper"),
    //   ed2curveHelper: this.moduleMap.get("ed2curveHelper"),
    // });
    // const genesisBlock = subchainCore.block.recombineBlock<
    //   BFChainCore.Block<BFChainCore.GenesisBlockRemarkJSON>
    // >(subGenesisBlock);
    // subchainCore.block
    //   .getBlockFactoryFromHeight<BFChainCore.Block<BFChainCore.GenesisBlockRemarkJSON>>(
    //     subGenesisBlock.height,
    //   )
    //   .verify(genesisBlock);
  }

  /**
   * 初始化 issueSubchain 交易
   *
   * @param body
   * @param issueSubchain
   */
  init(body: BFChainCore.TxBodyJSON, issueSubchain: BFChainCore.IssueSubchainAssetJSON) {
    const transaction = IssueSubchainTransaction.fromObject({
      ...body,
      asset: issueSubchain,
    });
    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  applyTransaction(
    transaction: IssueSubchainTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { senderId, senderPublicKeyBuffer } = transaction;
    const {
      chainName,
      assetType,
      magic,
      bnid,
      maxTPSPerBlock,
      blockPerRound,
      delegates,
      genesisBlock,
    } = transaction.asset.issueSubchain;
    // 冻结发起账户
    tasks.next = eventEmitter.emit("frozenAccount", {
      type: "frozenAccount",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        accountStatus: ACCOUNT_STATUS.FROZEN_OUT,
      },
    });
    // 发行子链
    tasks.next = eventEmitter.emit("issueSubchain", {
      type: "issueSubchain",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        chainName,
        assetType,
        magic,
        bnid,
        maxTPSPerBlock,
        blockPerRound,
        delegates,
        genesisBlock,
      },
    });
    return tasks.tryToPromise();
  }
}
