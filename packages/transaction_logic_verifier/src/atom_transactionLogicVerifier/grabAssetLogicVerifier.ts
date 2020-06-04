import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GrabAssetTransaction, RANGE_TYPE, GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
  SHOULD_BE,
  PROP_IS_INVALID,
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
    );

    if (!trsWithBlockSign) {
      throw new NoFoundException(NOT_EXIST, {
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

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction);

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
        prop: "calculate amount",
        ...Function_Exception_Detail,
        target: "giftAsset",
      });
    }

    if (should_grap_amount_BI.toString() !== grabAsset.amount) {
      throw new ConsensusException(SHOULD_BE, {
        to_compare_prop: "amount",
        to_target: "grabAsset",
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
        to_compare_prop: transaction.recipientId,
        be_compare_prop: giftAssetJson.senderId,
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
        to_compare_prop: blockSignature,
        be_compare_prop: transaction.asset.grabAsset.blockSignature,
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
        to_compare_prop: trsAsset,
        be_compare_prop: giftAsset,
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const { rangeType, range } = giftAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "senderId",
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "dappid",
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "lns",
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(资产赠送)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: GrabAssetTransaction,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "checkSecondaryTransaction",
    } as const;

    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
    });
    if (isSecondary) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary grab asset, sender ${transaction.senderId} gift transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
