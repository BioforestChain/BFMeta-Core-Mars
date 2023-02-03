import { GiftTransactionFactory } from "./_gift";
import { GiftAssetTransaction, GIFT_DISTRIBUTION_RULE, RANGE_TYPE } from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
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
export class GiftAssetTransactionFactory extends GiftTransactionFactory<GiftAssetTransaction> {
  /**
   * 校验输入信息
   *
   * @param body
   * @param giftAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    giftAssetAsset: BFChainCore.GiftAssetAssetJSON,
    config = this.configHelper,
  ) {
    const storage = await this.commonVerifyTransactionBody(body, giftAssetAsset, config);

    const giftAsset = giftAssetAsset.giftAsset;

    this.verifyGiftAsset(giftAsset, config);

    if (giftAsset.giftDistributionRule === GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM) {
      if (body.rangeType !== RANGE_TYPE.MULTI_ADDRESS) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `rangeType ${body.rangeType}`,
          to_target: "body",
          be_compare_prop: RANGE_TYPE.MULTI_ADDRESS,
        });
      }
    }

    if (giftAsset.beginUnfrozenBlockHeight) {
      if (giftAsset.beginUnfrozenBlockHeight >= body.effectiveBlockHeight) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LT_FIELD, {
          prop: `beginUnfrozenBlockHeight ${giftAsset.beginUnfrozenBlockHeight}`,
          field: body.effectiveBlockHeight,
          target: "giftAsset",
        });
      }
    }

    if (storage.value !== giftAsset.assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${giftAsset.assetType}`,
        to_target: "storage",
        be_target: "giftAsset",
      });
    }

    this.checkTransactionFee(body.fee, giftAsset.totalGrabableTimes, config);
  }
  /**
   * 校验`GiftAsset`内容
   * @param giftAsset
   */
  verifyGiftAsset(giftAsset: BFChainCore.GiftAssetJSON, config = this.configHelper) {
    const { baseHelper } = this;

    if (!giftAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "giftAsset",
      });
    }

    const GiftAssetAsset_Exception_Detail = {
      target: "giftAssetAsset",
    } as const;

    if (!baseHelper.isValidCipherPublicKeys(giftAsset.cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        type: "cipher publicKeys",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    const {
      sourceChainMagic,
      sourceChainName,
      assetType,
      amount,
      giftDistributionRule,
      totalGrabableTimes,
      beginUnfrozenBlockHeight,
    } = giftAsset;

    if (sourceChainMagic === this.configHelper.magic) {
      this.checkChainName(sourceChainName, "sourceChainName", GiftAssetAsset_Exception_Detail);

      this.checkChainMagic(sourceChainMagic, "sourceChainMagic", GiftAssetAsset_Exception_Detail);

      this.checkAsset(assetType, "assetType", GiftAssetAsset_Exception_Detail);
    }

    if (!baseHelper.isPositiveInteger(totalGrabableTimes)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `totalGrabableTimes ${totalGrabableTimes}`,
        type: "positive integer",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    if (totalGrabableTimes > config.maxGrabTimesOfGiftAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `totalGrabableTimes ${totalGrabableTimes}`,
        field: config.maxGrabTimesOfGiftAsset,
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    if (
      beginUnfrozenBlockHeight !== undefined &&
      !baseHelper.isPositiveInteger(beginUnfrozenBlockHeight)
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beginUnfrozenBlockHeight ${beginUnfrozenBlockHeight}`,
        type: "positive integer",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    if (
      giftDistributionRule !== GIFT_DISTRIBUTION_RULE.RANDOM &&
      giftDistributionRule !== GIFT_DISTRIBUTION_RULE.AVERAGE &&
      giftDistributionRule !== GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `giftDistributionRule ${giftDistributionRule}`,
        type: "enum of GIFT_DISTRIBUTION_RULE",
        ...GiftAssetAsset_Exception_Detail,
      });
    }

    this.checkAssetAmount(amount, "amount", GiftAssetAsset_Exception_Detail);
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
      const { amount, assetType, sourceChainMagic, totalGrabableTimes } =
        transaction.asset.giftAsset;
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
          minEffectiveHeight,
          maxEffectiveHeight,
          totalUnfrozenTimes: totalGrabableTimes,
          frozenId: transaction.signature,
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
