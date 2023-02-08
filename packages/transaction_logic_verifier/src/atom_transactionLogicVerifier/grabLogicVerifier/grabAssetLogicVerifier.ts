import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";
import { GrabAssetTransaction, RANGE_TYPE, GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

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
    const grabAsset = transaction.asset.grabAsset;

    const { transactionSignature } = grabAsset;
    const trsWithBlockSign =
      await transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
        transactionSignature,
        this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
      );

    if (!trsWithBlockSign) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "grabAsset",
      });
    }

    const trs = trsWithBlockSign.transaction as BFChainCore.GiftAssetTransactionJSON;

    if (trs.type !== this.transactionHelper.GIFT_ASSET) {
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

    eventLogicVerifier.listenEventUnfrozenAsset(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private async isValidAmount(transaction: GrabAssetTransaction) {
    const { senderId, recipientId, asset } = transaction;
    const grabAsset = asset.grabAsset;
    const { giftAsset, blockSignatureBuffer, transactionSignatureBuffer } = grabAsset;

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
          transactionSignatureBuffer,
          recipientId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
      case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
        should_grap_amount_BI = await this.transactionHelper.calcGrabRandomGiftAssetNumber(
          senderId,
          blockSignatureBuffer,
          transactionSignatureBuffer,
          recipientId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
    }

    if (!should_grap_amount_BI) {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `calculate amount ${should_grap_amount_BI.toString()}`,

        target: "giftAsset",
      });
    }

    if (should_grap_amount_BI.toString() !== grabAsset.amount) {
      throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `amount ${grabAsset.amount}`,
        to_target: `grabAsset`,
        be_compare_prop: should_grap_amount_BI.toString(),
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
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `GrabAssetTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `GiftAssetTransaction.senderId ${giftAssetJson.senderId}`,
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
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
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `blockSignature ${blockSignature}`,
        be_compare_prop: `blockSignature ${transaction.asset.grabAsset.blockSignature}`,
        to_target: "grabAsset",
        be_target: "blockChain",
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
    const grabAsset = transaction.asset.grabAsset;
    const { giftAsset, ciphertextSignature } = grabAsset;

    const {
      sourceChainMagic,
      sourceChainName,
      assetType,
      amount,
      giftDistributionRule,
      totalGrabableTimes,
      cipherPublicKeys,
      beginUnfrozenBlockHeight,
    } = giftAsset;

    const trsAsset = giftAssetJson.asset.giftAsset;

    if (
      trsAsset.sourceChainMagic !== sourceChainMagic ||
      trsAsset.sourceChainName !== sourceChainName ||
      trsAsset.assetType !== assetType ||
      trsAsset.totalGrabableTimes !== totalGrabableTimes ||
      trsAsset.amount !== amount ||
      trsAsset.giftDistributionRule !== giftDistributionRule
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `grabAsset.giftAsset: ${JSON.stringify(giftAsset.toJSON())}`,
        be_compare_prop: `giftAsset: ${JSON.stringify(trsAsset)}`,
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
      });
    }

    if (trsAsset.beginUnfrozenBlockHeight !== undefined) {
      if (beginUnfrozenBlockHeight === undefined) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `beginUnfrozenBlockHeight`,
          target: "grabAsset.giftAsset",
        });
      }
      if (trsAsset.beginUnfrozenBlockHeight !== beginUnfrozenBlockHeight) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `grabAsset.giftAsset: ${JSON.stringify(giftAsset.toJSON())}`,
          be_compare_prop: `giftAsset: ${JSON.stringify(trsAsset)}`,
          to_target: "GrabAssetTransaction",
          be_target: "GiftAssetTransaction",
        });
      }
    } else {
      if (beginUnfrozenBlockHeight !== undefined) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `beginUnfrozenBlockHeight`,
          target: "grabAsset.giftAsset",
        });
      }
    }

    if (trsAsset.cipherPublicKeys.length !== cipherPublicKeys.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `grabAsset.giftAsset: ${JSON.stringify(giftAsset.toJSON())}`,
        be_compare_prop: `giftAsset: ${JSON.stringify(trsAsset)}`,
        to_target: "GrabAssetTransaction",
        be_target: "GiftAssetTransaction",
      });
    }
    for (const pk of trsAsset.cipherPublicKeys) {
      if (!cipherPublicKeys.includes(pk)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `grabAsset.giftAsset: ${JSON.stringify(giftAsset.toJSON())}`,
          be_compare_prop: `giftAsset: ${JSON.stringify(trsAsset)}`,
          to_target: "GrabAssetTransaction",
          be_target: "GiftAssetTransaction",
        });
      }
    }
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `ciphertextSignature`,
          target: "grabAsset",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "grabAsset.ciphertextSignature",
          be_target: "giftAsset.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "grabAsset",
        });
      }
    }

    const { rangeType, range } = giftAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.dappid}`,
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "grabAssetTransaction",
          be_compare_prop: "giftAssetTransaction.range",
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
  getLockData(transaction: GrabAssetTransaction) {
    const { transactionSignature } = transaction.asset.grabAsset;
    return [transactionSignature];
  }
}
