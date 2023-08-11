import { GiftTransactionFactory } from "./_gift";
import {
  GiftAnyTransaction,
  GIFT_DISTRIBUTION_RULE,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
  ASSET_STATUS,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";

const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "GiftAnyTransactionFactory",
);

/**
 * giftAny 交易工厂
 *
 */
@Injectable()
export class GiftAnyTransactionFactory extends GiftTransactionFactory<GiftAnyTransaction> {
  /**
   * 校验输入信息
   *
   * @param body
   * @param giftAnyAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    giftAnyAsset: BFChainCore.GiftAnyAssetJSON,
    config = this.configHelper,
  ) {
    const storage = await this.commonVerifyTransactionBody(body, giftAnyAsset, config);

    const giftAny = giftAnyAsset.giftAny;

    await this.verifyGiftAny(giftAny, config);

    if (giftAny.giftDistributionRule === GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM) {
      if (body.rangeType !== RANGE_TYPE.MULTI_ADDRESS) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `rangeType ${body.rangeType}`,
          to_target: "body",
          be_compare_prop: RANGE_TYPE.MULTI_ADDRESS,
        });
      }
    }

    if (giftAny.beginUnfrozenBlockHeight) {
      if (giftAny.beginUnfrozenBlockHeight >= body.effectiveBlockHeight) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LT_FIELD, {
          prop: `beginUnfrozenBlockHeight ${giftAny.beginUnfrozenBlockHeight}`,
          field: body.effectiveBlockHeight,
          target: "giftAsset",
        });
      }
    }

    if (storage.value !== giftAny.assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${giftAny.assetType}`,
        to_target: "storage",
        be_target: "giftAsset",
      });
    }

    this.checkTransactionFee(body.fee, giftAny.totalGrabableTimes, config);
  }

  /**
   * 校验`GiftAny`内容
   *
   * @param giftAny
   */
  async verifyGiftAny(giftAny: BFChainCore.GiftAnyJSON, config = this.configHelper) {
    const { baseHelper } = this;

    if (!giftAny) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "giftAny",
      });
    }

    const GiftAnyAsset_Exception_Detail = {
      target: "giftAnyAsset",
    } as const;

    const cipherPublicKeys = giftAny.cipherPublicKeys;
    const cipherPublicKeySet = new Set(cipherPublicKeys);
    if (cipherPublicKeys.length !== cipherPublicKeySet.size) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
        prop: "cipherPublicKeys",
        ...GiftAnyAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidCipherPublicKeys(giftAny.cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        ...GiftAnyAsset_Exception_Detail,
      });
    }

    const {
      sourceChainMagic,
      sourceChainName,
      parentAssetType,
      assetType,
      amount,
      giftDistributionRule,
      totalGrabableTimes,
      beginUnfrozenBlockHeight,
      taxInformation,
    } = giftAny;

    if (sourceChainMagic === this.configHelper.magic) {
      this.checkChainName(sourceChainName, "sourceChainName", GiftAnyAsset_Exception_Detail);

      this.checkChainMagic(sourceChainMagic, "sourceChainMagic", GiftAnyAsset_Exception_Detail);

      this.checkAssetType(parentAssetType, assetType, "assetType", GiftAnyAsset_Exception_Detail);
    }

    if (!baseHelper.isPositiveInteger(totalGrabableTimes)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `totalGrabableTimes ${totalGrabableTimes}`,
        type: "positive integer",
        ...GiftAnyAsset_Exception_Detail,
      });
    }

    if (totalGrabableTimes > config.maxGrabTimesOfGiftAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `totalGrabableTimes ${totalGrabableTimes}`,
        field: config.maxGrabTimesOfGiftAsset,
        ...GiftAnyAsset_Exception_Detail,
      });
    }

    if (
      beginUnfrozenBlockHeight !== undefined &&
      !baseHelper.isPositiveInteger(beginUnfrozenBlockHeight)
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beginUnfrozenBlockHeight ${giftAny.beginUnfrozenBlockHeight}`,
        type: "positive integer",
        ...GiftAnyAsset_Exception_Detail,
      });
    }

    this.checkAssetAmount(amount, "amount", GiftAnyAsset_Exception_Detail);

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      if (giftDistributionRule === undefined) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "giftDistributionRule",
          ...GiftAnyAsset_Exception_Detail,
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
          ...GiftAnyAsset_Exception_Detail,
        });
      }
    } else {
      if (totalGrabableTimes !== 1) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `totalGrabableTimes ${totalGrabableTimes}`,
          to_target: "giftAny",
          be_compare_prop: 1,
        });
      }
      if (amount !== "1") {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `amount ${amount}`,
          to_target: "giftAny",
          be_compare_prop: "1",
        });
      }
      if (giftDistributionRule !== undefined) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "giftDistributionRule",
          target: "giftAny",
        });
      }
    }

    if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      await this.checkTaxInformation(GiftAnyAsset_Exception_Detail, taxInformation);
    } else {
      if (taxInformation) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          ...GiftAnyAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 giftAny 交易
   *
   * @param body
   * @param giftAny
   */
  init(body: BFChainCore.TxBodyJSON, giftAny: BFChainCore.GiftAnyAssetJSON) {
    const transaction = GiftAnyTransaction.fromObject({
      ...body,
      asset: giftAny,
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
    transaction: GiftAnyTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { chainAssetInfoHelper } = this;
      const { senderId, senderPublicKeyBuffer, signature, asset } = transaction;
      const {
        taxInformation,
        amount,
        assetType,
        parentAssetType,
        sourceChainMagic,
        sourceChainName,
        totalGrabableTimes,
      } = asset.giftAny;

      const minEffectiveHeight =
        this.transactionHelper.getTransactionMinEffectiveHeight(transaction);
      const maxEffectiveHeight =
        this.transactionHelper.getTransactionMaxEffectiveHeight(transaction);

      if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        // 冻结资产
        taskList.next = eventEmitter.emit("frozenAsset", {
          type: "frozenAsset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo,
            amount: `-${amount}`,
            sourceAmount: amount,
            minEffectiveHeight,
            maxEffectiveHeight,
            totalUnfrozenTimes: totalGrabableTimes,
            frozenId: signature,
          },
        });
      } else if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
        // 冻结 dappid
        taskList.next = eventEmitter.emit("frozenDAppid", {
          type: "frozenDAppid",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName,
            sourceChainMagic,
            dappid: assetType,
            minEffectiveHeight,
            maxEffectiveHeight,
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
      } else if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        // 冻结位名
        taskList.next = eventEmitter.emit("frozenLocationName", {
          type: "frozenLocationName",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName,
            sourceChainMagic,
            name: assetType,
            minEffectiveHeight,
            maxEffectiveHeight,
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
      } else if (parentAssetType === PARENT_ASSET_TYPE.ENTITY && taxInformation) {
        // 冻结 entityId
        taskList.next = eventEmitter.emit("frozenEntity", {
          type: "frozenEntity",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName,
            sourceChainMagic,
            entityId: assetType,
            minEffectiveHeight,
            maxEffectiveHeight,
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
        // 纳税
        taskList.next = eventEmitter.emit("payTax", {
          type: "payTax",
          transaction,
          applyInfo: {
            sourceChainName,
            sourceChainMagic,
            parentAssetType,
            assetType,
            taxInformation: taxInformation.toJSON(),
          },
        });
        const { taxAssetPrealnum } = taxInformation;
        if (taxAssetPrealnum !== "0") {
          const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
            config.magic,
            config.assetType,
          );
          taskList.next = eventEmitter.emit("frozenAsset", {
            type: "frozenAsset",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              assetInfo: chainAssetInfo,
              amount: `-${taxAssetPrealnum}`,
              sourceAmount: taxAssetPrealnum,
              maxEffectiveHeight:
                this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
              minEffectiveHeight:
                this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
              frozenId: signature,
            },
          });
        }
      } else if (parentAssetType === PARENT_ASSET_TYPE.CERTIFICATE) {
        // 冻结 certificateId
        taskList.next = eventEmitter.emit("frozenCertificate", {
          type: "frozenCertificate",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName,
            sourceChainMagic,
            certificateId: assetType,
            minEffectiveHeight,
            maxEffectiveHeight,
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
      } else {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `parentAssetType ${parentAssetType}`,
          target: "transaction.asset.giftAny",
        });
      }
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
    transaction: GiftAnyTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.giftAny;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
