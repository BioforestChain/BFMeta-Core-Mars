import { Injectable } from "@bfchain/util";
import {
  GrabAnyTransaction,
  RANGE_TYPE,
  GIFT_DISTRIBUTION_RULE,
  PARENT_ASSET_TYPE,
  NewTransactionRefuseReason,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";

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
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const grabAny = transaction.asset.grabAny;

    const { transactionSignature, giftAny } = grabAny;
    const trsWithBlockSign =
      await this.transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
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

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private async isValidAmount(transaction: GrabAnyTransaction) {
    const { senderId, recipientId, asset } = transaction;
    const grabAny = asset.grabAny;
    const { giftAny, blockSignatureBuffer, transactionSignatureBuffer } = grabAny;
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
            transactionSignatureBuffer,
            recipientId,
            amount,
            totalGrabableTimes,
          );
          break;
        case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
          should_grap_amount_BI = await this.transactionHelper.calcGrabRandomGiftAssetNumber(
            senderId,
            blockSignatureBuffer,
            transactionSignatureBuffer,
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
    const { giftAny, ciphertextSignature } = transaction.asset.grabAny;

    const {
      sourceChainMagic,
      sourceChainName,
      assetType,
      amount,
      giftDistributionRule,
      totalGrabableTimes,
      beginUnfrozenBlockHeight,
      taxInformation,
      cipherPublicKeys,
    } = giftAny;

    const trsAsset = giftAnyJson.asset.giftAny;

    if (
      trsAsset.sourceChainMagic !== sourceChainMagic ||
      trsAsset.sourceChainName !== sourceChainName ||
      trsAsset.assetType !== assetType ||
      trsAsset.amount !== amount ||
      trsAsset.giftDistributionRule !== giftDistributionRule ||
      trsAsset.totalGrabableTimes !== totalGrabableTimes
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `grabAny.giftAny: ${JSON.stringify(giftAny.toJSON())}`,
        be_compare_prop: `giftAny: ${JSON.stringify(trsAsset)}`,
        to_target: "GrabAnyTransaction",
        be_target: "GiftAnyTransaction",
      });
    }

    if (trsAsset.beginUnfrozenBlockHeight !== undefined) {
      if (beginUnfrozenBlockHeight === undefined) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `beginUnfrozenBlockHeight`,
          target: "grabAny.giftAny",
        });
      }
      if (trsAsset.beginUnfrozenBlockHeight !== beginUnfrozenBlockHeight) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `grabAny.giftAny: ${JSON.stringify(giftAny.toJSON())}`,
          be_compare_prop: `giftAny: ${JSON.stringify(trsAsset)}`,
          to_target: "GrabAnyTransaction",
          be_target: "GiftAnyTransaction",
        });
      }
    } else {
      if (beginUnfrozenBlockHeight !== undefined) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `beginUnfrozenBlockHeight`,
          target: "grabAny.giftAny",
        });
      }
    }

    if (trsAsset.taxInformation) {
      if (!taxInformation) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "taxInformation",
          target: "grabAny.giftAny",
        });
      }
      if (
        trsAsset.taxInformation.taxAssetPrealnum !== taxInformation.taxAssetPrealnum ||
        trsAsset.taxInformation.taxCollector !== taxInformation.taxCollector
      ) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `grabAny.giftAny: ${JSON.stringify(giftAny.toJSON())}`,
          be_compare_prop: `giftAny: ${JSON.stringify(trsAsset)}`,
          to_target: "GrabAnyTransaction",
          be_target: "GiftAnyTransaction",
        });
      }
    } else {
      if (taxInformation) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          target: "grabAny.giftAny",
        });
      }
    }

    if (trsAsset.cipherPublicKeys.length !== cipherPublicKeys.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `grabAny.giftAny: ${JSON.stringify(giftAny.toJSON())}`,
        be_compare_prop: `giftAny: ${JSON.stringify(trsAsset)}`,
        to_target: "GrabAnyTransaction",
        be_target: "GiftAnyTransaction",
      });
    }
    for (const pk of trsAsset.cipherPublicKeys) {
      if (!cipherPublicKeys.includes(pk)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `grabAny.giftAny: ${JSON.stringify(giftAny.toJSON())}`,
          be_compare_prop: `giftAny: ${JSON.stringify(trsAsset)}`,
          to_target: "GrabAnyTransaction",
          be_target: "GiftAnyTransaction",
        });
      }
    }
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "grabAny",
        });
      }
      const { publicKey } = ciphertextSignature;
      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "grabAny.ciphertextSignature",
          be_target: "giftAny.cipherPublicKeys",
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature`,
          target: "grabAny",
        });
      }
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
    const result = this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionBlobFee(transaction).toString(),
    );
    if (result.isFeeEnough === false) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_FEE_NOT_ENOUGH, {
        minFee: result.minFee,
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
      });
    }
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
    const result = this.isFeeEnough(
      transaction.fee,
      this.transactionHelper
        .calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
        .toString(),
    );
    if (result.isFeeEnough === false) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_FEE_NOT_ENOUGH, {
        minFee: result.minFee,
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
      });
    }
  }

  /**
   * 不能二次操作同一笔交易(权益赠送)
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async checkSecondaryTransaction(transaction: GrabAnyTransaction, currentBlockHeight: number) {
    const isSecondary = await this.transactionGetterHelper.checkSecondaryTransaction({
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
    const { transactionSignature, giftAny } = transaction.asset.grabAny;
    const { parentAssetType, assetType, taxInformation } = giftAny;
    const locks: string[] = [transactionSignature];
    if (
      parentAssetType === PARENT_ASSET_TYPE.DAPP ||
      parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      parentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(assetType);
      if (taxInformation) {
        locks.push(taxInformation.taxCollector);
      }
    }
    return locks;
  }
}
