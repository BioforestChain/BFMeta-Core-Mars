import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";
import {
  GrabAnyTransaction,
  RANGE_TYPE,
  GIFT_DISTRIBUTION_RULE,
  PARENT_ASSET_TYPE,
} from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "GrabAnyLogicVerifier",
);

@Injectable()
export class GrabAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GrabAnyTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const grabAny = transaction.asset.grabAny;

    const { transactionSignature, giftAny } = grabAny;
    const trsWithBlockSign =
      await transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
        transactionSignature,
        this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
      );

    if (!trsWithBlockSign) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "grabAny",
      });
    }

    const trs = trsWithBlockSign.transaction as BFChainCore.GiftAnyTransactionJSON;

    if (trs.type !== this.transactionHelper.GIFT_ANY) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    this.isValidRecipientId(transaction, trs);
    this.isBlockSignatureMatch(transaction, trsWithBlockSign.blockSignature);
    this.isDependentTransactionMatch(transaction, trs);
    await this.isValidAmount(transaction);

    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
      cloneAccountsInfo[address] = this.helperLogicVerifier.deepClone(recipient.accountInfo);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    const { parentAssetType } = giftAny;

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      eventLogicVerifier.listenEventUnfrozenAsset(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
      eventLogicVerifier.listenEventUnfrozenDAppid(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      eventLogicVerifier.listenEventUnfrozenLocationName(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      eventLogicVerifier.listenEventUnfrozenEntity(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private async isValidAmount(transaction: GrabAnyTransaction) {
    const { senderId, recipientId, asset } = transaction;
    const grabAny = asset.grabAny;
    const { giftAny, blockSignatureBuffer, giftTransactionSignatureBuffer } = grabAny;
    const { giftDistributionRule, parentAssetType, totalGrabableTimes, amount } = giftAny;

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      /**校验金额 */
      let should_grap_amount_BI: bigint | undefined;
      switch (giftDistributionRule) {
        case GIFT_DISTRIBUTION_RULE.AVERAGE:
          should_grap_amount_BI = this.transactionHelper.calcGrabAverageGiftAssetNumber(
            amount,
            totalGrabableTimes,
          );
          break;
        case GIFT_DISTRIBUTION_RULE.RANDOM:
          should_grap_amount_BI = await this.transactionHelper.calcGrabRandomGiftAssetNumber(
            senderId,
            blockSignatureBuffer,
            giftTransactionSignatureBuffer,
            recipientId,
            amount,
            totalGrabableTimes,
          );
          break;
        case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
          should_grap_amount_BI = await this.transactionHelper.calcGrabRandomGiftAssetNumber(
            senderId,
            blockSignatureBuffer,
            giftTransactionSignatureBuffer,
            recipientId,
            amount,
            totalGrabableTimes,
          );
          break;
      }

      if (!should_grap_amount_BI) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `calculate amount`,
          target: "giftAsset",
        });
      }

      if (should_grap_amount_BI.toString() !== grabAny.amount) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `amount ${grabAny.amount}`,
          to_target: `grabAny`,
          be_compare_prop: should_grap_amount_BI.toString(),
        });
      }
    } else {
      if (grabAny.amount !== "1") {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `amount ${grabAny.amount}`,
          to_target: "giftAny",
          be_compare_prop: "1",
        });
      }
    }
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param giftAnyJson
   */
  private isValidRecipientId(
    transaction: GrabAnyTransaction,
    giftAnyJson: BFChainCore.TransactionJSON<BFChainCore.GiftAnyAssetJSON>,
  ) {
    if (transaction.recipientId !== giftAnyJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `GrabAnyTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `GiftAnyTransaction.senderId ${giftAnyJson.senderId}`,
        to_target: "GrabAnyTransaction",
        be_target: "GiftAnyTransaction",
      });
    }
  }

  /**
   * 交易所在的区块签名是否匹配
   *
   * @param transaction
   * @param blockSignature
   */
  private isBlockSignatureMatch(transaction: GrabAnyTransaction, blockSignature: string) {
    if (blockSignature !== transaction.asset.grabAny.blockSignature) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `blockSignature ${blockSignature}`,
        be_compare_prop: `blockSignature ${transaction.asset.grabAny.blockSignature}`,
        to_target: "grabAny",
        be_target: "blockChain",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param giftAnyJson
   */
  private isDependentTransactionMatch(
    transaction: GrabAnyTransaction,
    giftAnyJson: BFChainCore.TransactionJSON<BFChainCore.GiftAnyAssetJSON>,
  ) {
    const giftAny = transaction.asset.grabAny.giftAny;

    const { sourceChainMagic, assetType, giftDistributionRule } = giftAny;

    const trsAsset = giftAnyJson.asset.giftAny;

    if (
      trsAsset.sourceChainMagic !== sourceChainMagic ||
      trsAsset.assetType !== assetType ||
      trsAsset.giftDistributionRule !== giftDistributionRule
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `giftAsset: ${JSON.stringify(giftAny.toJSON())}`,
        to_target: "GrabAnyTransaction",
        be_target: "GiftAnyTransaction",
      });
    }

    const { rangeType, range } = giftAnyJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "grabAnyTransaction",
          be_compare_prop: "giftAnyTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.dappid}`,
          to_target: "grabAnyTransaction",
          be_compare_prop: "giftAnyTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "grabAnyTransaction",
          be_compare_prop: "giftAnyTransaction.range",
        });
      }
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: GrabAnyTransaction, byteLength: number) {
    return {
      isFeeEnough: true,
      minFee: "0",
    };
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: GrabAnyTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    return {
      isFeeEnough: true,
      minFee: "0",
    };
  }

  /**
   * 不能二次操作同一笔交易(权益赠送)
   *
   * @param transaction
   * @param currentBlockHeight
   * @param transactionGetterHelper
   */
  async checkSecondaryTransaction(
    transaction: GrabAnyTransaction,
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(ERROR_LIST.CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary grab asset, sender ${transaction.senderId} gift transaction signature ${transaction.storageValue}`,
      });
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: GrabAnyTransaction) {
    const { transactionSignature } = transaction.asset.grabAny;
    return [transactionSignature];
  }
}
