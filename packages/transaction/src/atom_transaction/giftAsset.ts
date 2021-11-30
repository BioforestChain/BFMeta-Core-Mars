import { TransactionFactory } from "./_txbase";
import {
  GiftAssetTransaction,
  GIFT_DISTRIBUTION_RULE,
  RANGE_TYPE,
  NewTransactionRefuseReason,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  NOT_MATCH,
  SHOULD_NOT_EXIST,
  PROP_SHOULD_LT_FIELD,
  TRANSACTION_FEE_NOT_ENOUGH,
  PROP_SHOULD_LTE_FIELD,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "GiftAssetTransactionFactory",
);

/**
 * giftAsset 交易工厂
 *
 */
@Injectable()
export class GiftAssetTransactionFactory extends TransactionFactory<GiftAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 giftAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 不能携带交易的接收账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "assetType" value 值必须是设定的值
   * asset 是完整的 giftAsset 信息
   * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
   * 需要携带合法的资产所属链名称
   * 需要携带合法的资产所属链的网络标识符
   * 需要携带合法的资产名称
   * 需要携带用于赠送的资产数量，并且大于 0
   * 必须指定可抢的次数，并且是一个正整数
   * 如果携带开始抢的区块间隔，这个间隔必须是正整数
   * 必须携带抢红包规则：average/random/recipient_random
   * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
   *
   * @param body
   * @param giftAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    giftAssetAsset: BFChainCore.GiftAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, giftAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
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
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const giftAsset = giftAssetAsset.giftAsset;
    this.verifyGiftAsset(giftAsset, config);

    if (giftAsset.giftDistributionRule === GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM) {
      if (body.rangeType !== RANGE_TYPE.MULTI_ADDRESS) {
        throw new ArgumentIllegalException(SHOULD_BE, {
          to_compare_prop: `rangeType ${body.rangeType}`,
          to_target: "body",
          be_compare_prop: RANGE_TYPE.MULTI_ADDRESS,
          ...Function_Exception_Detail,
        });
      }
    }

    if (giftAsset.beginUnfrozenBlockHeight) {
      if (giftAsset.beginUnfrozenBlockHeight >= body.effectiveBlockHeight) {
        throw new ArgumentIllegalException(PROP_SHOULD_LT_FIELD, {
          prop: `beginUnfrozenBlockHeight ${giftAsset.beginUnfrozenBlockHeight}`,
          field: body.effectiveBlockHeight,
          ...Function_Exception_Detail,
          target: "giftAsset",
        });
      }
    }

    if (storage.value !== giftAsset.assetType) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${giftAsset.assetType}`,
        to_target: "storage",
        be_target: "giftAsset",
        ...Function_Exception_Detail,
      });
    }

    const { maxTransactionSize, minTransactionFeePerByte } = config;
    const byteLength = maxTransactionSize * (giftAsset.totalGrabableTimes + 1);
    const feePerByte = {
      numerator: BigInt(body.fee),
      denominator: byteLength,
    };
    const result = this.jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
    if (result < 0) {
      // 红包交易默认按照最大交易体付手续费
      const minFee = this.jsbiHelper
        .multiplyCeilFraction(feePerByte.denominator, minTransactionFeePerByte)
        .toString();
      throw new ArgumentIllegalException(TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee: minFee.toString(),
        ...Function_Exception_Detail,
      });
    }
  }
  /**
   * 校验`GiftAsset`内容
   * @param giftAsset
   */
  verifyGiftAsset(giftAsset: BFChainCore.GiftAssetJSON, config = this.configHelper) {
    const { baseHelper } = this;
    const Function_Exception_Detail = { function: "verifyTransactionBody" } as const;

    if (!giftAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "giftAsset",
        ...Function_Exception_Detail,
      });
    }

    const GiftAssetAsset_Exception_Detail = {
      target: "giftAssetAsset",
      ...Function_Exception_Detail,
    } as const;

    if (!baseHelper.isValidCipherPublicKeys(giftAsset.cipherPublicKeys)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        type: "cipher publicKeys",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    const { sourceChainMagic, sourceChainName, assetType } = giftAsset;

    this.checkChainName(sourceChainName, "sourceChainName", GiftAssetAsset_Exception_Detail);

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", GiftAssetAsset_Exception_Detail);

    this.checkAsset(assetType, "assetType", GiftAssetAsset_Exception_Detail);

    if (!baseHelper.isPositiveInteger(giftAsset.totalGrabableTimes)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `totalGrabableTimes ${giftAsset.totalGrabableTimes}`,
        type: "positive integer",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    if (giftAsset.totalGrabableTimes > config.maxGrabTimesOfGiftAsset) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: `totalGrabableTimes ${giftAsset.totalGrabableTimes}`,
        field: config.maxGrabTimesOfGiftAsset,
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    // if (!baseHelper.isValidAssetNumber(giftAsset.unitReserveFee)) {
    //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
    //     prop: "unitReserveFee",
    //     type: "asset number",
    //     ...GiftAssetAsset_Exception_Detail,
    //   });
    // }

    if (
      giftAsset.beginUnfrozenBlockHeight !== undefined &&
      !baseHelper.isPositiveInteger(giftAsset.beginUnfrozenBlockHeight)
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `beginUnfrozenBlockHeight ${giftAsset.beginUnfrozenBlockHeight}`,
        type: "positive integer",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    const { giftDistributionRule } = giftAsset;
    if (
      giftDistributionRule !== GIFT_DISTRIBUTION_RULE.RANDOM &&
      giftDistributionRule !== GIFT_DISTRIBUTION_RULE.AVERAGE &&
      giftDistributionRule !== GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `giftDistributionRule ${giftDistributionRule}`,
        type: "enum of GIFT_DISTRIBUTION_RULE",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    this.checkAssetAmount(giftAsset.amount, "amount", GiftAssetAsset_Exception_Detail);
  }

  /**
   * 初始化 giftAsset 交易
   *
   * @param body
   * @param giftAsset
   */
  init(body: BFChainCore.TxBodyJSON, giftAsset: BFChainCore.GiftAssetAssetJSON) {
    const transaction = GiftAssetTransaction.fromObject({
      ...body,
      asset: giftAsset,
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
    transaction: GiftAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { chainAssetInfoHelper } = this;
      const {
        amount,
        assetType,
        sourceChainMagic,
        // unitReserveFee,
        totalGrabableTimes,
      } = transaction.asset.giftAsset;
      const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      const minEffectiveHeight =
        this.transactionHelper.getTransactionMinEffectiveHeight(transaction);
      const maxEffectiveHeight =
        this.transactionHelper.getTransactionMaxEffectiveHeight(transaction);

      // 冻结资产
      taskList.next = eventEmitter.emit("frozenAsset", {
        type: "frozenAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo,
          amount: `-${amount}`,
          sourceAmount: amount,
          frozenIdBuffer: transaction.signatureBuffer,
          minEffectiveHeight,
          maxEffectiveHeight,
          totalUnfrozenTimes: totalGrabableTimes,
        },
      });
    });
  }

  /**
   * 获取变动的权益数
   *
   * @param transaction
   * @param argv
   * @returns
   */
  getMoveAmount(
    transaction: GiftAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.giftAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
