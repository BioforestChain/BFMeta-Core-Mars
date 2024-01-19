import type { GiftAssetTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";

@Injectable()
export class GiftAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { sourceChainMagic, assetType, sourceChainName, totalGrabableTimes } =
      transaction.asset.giftAsset;

    await this.helperLogicVerifier.isAssetExist(sourceChainName, sourceChainMagic, assetType);

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: GiftAssetTransaction, byteLength: number) {
    const times = transaction.asset.giftAsset.totalGrabableTimes + 1;
    return this.isFeeEnough(
      transaction.signature,
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times) +
        this.transactionHelper.calcTransactionBlobFee(transaction)
      ).toString(),
    );
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: GiftAssetTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    const times = transaction.asset.giftAsset.totalGrabableTimes + 1;
    return this.isFeeEnough(
      transaction.signature,
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times, miningMachineMinFeePerByte) +
        this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
  }
}
