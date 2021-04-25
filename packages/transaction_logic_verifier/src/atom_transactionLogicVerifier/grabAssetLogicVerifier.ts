import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GrabAssetTransaction, RANGE_TYPE, GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
  SHOULD_BE,
  PROP_IS_INVALID,
  NOT_EXIST_OR_EXPIRED,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "GrabAssetLogicVerifier",
);

@Injectable()
export class GrabAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GrabAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;

    const grabAsset = transaction.asset.grabAsset;

    const { transactionSignature } = grabAsset;
    const trsWithBlockSign = await transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    );

    if (!trsWithBlockSign) {
      throw new NoFoundException(NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "grabAsset",
        ...Function_Exception_Detail,
      });
    }

    const trs = trsWithBlockSign.transaction as BFChainCore.TransactionJSON<
      BFChainCore.GiftAssetAssetJSON
    >;

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

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
      eventEmitter,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private async isValidAmount(transaction: GrabAssetTransaction) {
    const { senderId, recipientId, asset } = transaction;
    const grabAsset = asset.grabAsset;
    const { giftAsset, blockSignatureBuffer, giftTransactionSignatureBuffer } = grabAsset;

    const Function_Exception_Detail = {
      function: "isValidAmount",
    } as const;

    /**校验金额 */
    let should_grap_amount_BI: bigint | undefined;
    switch (giftAsset.giftDistributionRule) {
      case GIFT_DISTRIBUTION_RULE.AVERAGE:
        should_grap_amount_BI = this.transactionHelper.calcGrabAverageGiftAssetNumber(
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
      case GIFT_DISTRIBUTION_RULE.RANDOM:
        should_grap_amount_BI = await this.transactionHelper.calcGrabRandomGiftAssetNumber(
          senderId,
          blockSignatureBuffer,
          giftTransactionSignatureBuffer,
          recipientId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
      case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
        should_grap_amount_BI = await this.transactionHelper.calcGrabRandomGiftAssetNumber(
          senderId,
          blockSignatureBuffer,
          giftTransactionSignatureBuffer,
          recipientId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
    }

    if (!should_grap_amount_BI) {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: `calculate amount ${should_grap_amount_BI.toString()}`,
        ...Function_Exception_Detail,
        target: "giftAsset",
      });
    }

    if (should_grap_amount_BI.toString() !== grabAsset.amount) {
      throw new ConsensusException(SHOULD_BE, {
        to_compare_prop: `amount ${grabAsset.amount}`,
        to_target: `grabAsset`,
        be_compare_prop: should_grap_amount_BI.toString(),
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param giftAssetJson
   */
  private isValidRecipientId(
    transaction: GrabAssetTransaction,
    giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>,
  ) {
    if (transaction.recipientId !== giftAssetJson.senderId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `GrabAssetTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `GiftAssetTransaction.senderId ${giftAssetJson.senderId}`,
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 交易所在的区块签名是否匹配
   *
   * @param transaction
   * @param blockSignature
   */
  private isBlockSignatureMatch(transaction: GrabAssetTransaction, blockSignature: string) {
    if (blockSignature !== transaction.asset.grabAsset.blockSignature) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `blockSignature ${blockSignature}`,
        be_compare_prop: `blockSignature ${transaction.asset.grabAsset.blockSignature}`,
        to_target: "grabAsset",
        be_target: "blockChain",
        function: "isBlockSignatureMatch",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param giftAssetJson
   */
  private isDependentTransactionMatch(
    transaction: GrabAssetTransaction,
    giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const grabAsset = transaction.asset.grabAsset;
    const { giftAsset } = grabAsset;

    const { sourceChainMagic, assetType, giftDistributionRule } = giftAsset;

    const trsAsset = giftAssetJson.asset.giftAsset;

    if (
      trsAsset.sourceChainMagic !== sourceChainMagic ||
      trsAsset.assetType !== assetType ||
      trsAsset.giftDistributionRule !== giftDistributionRule
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `giftAsset: ${JSON.stringify(giftAsset.toJSON())}`,
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const { rangeType, range } = giftAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.dappid}`,
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
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
  checkTrsFeeAndWebFee(transaction: GrabAssetTransaction, byteLength: number) {
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
    transaction: GrabAssetTransaction,
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
    transaction: GrabAssetTransaction,
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary grab asset, sender ${transaction.senderId} gift transaction signature ${transaction.storageValue}`,
        function: "checkSecondaryTransaction",
      });
    }
  }
}
