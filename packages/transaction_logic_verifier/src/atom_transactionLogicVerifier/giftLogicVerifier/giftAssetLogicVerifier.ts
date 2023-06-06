import { GiftAssetTransaction, NewTransactionRefuseReason } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "GiftAssetLogicVerifier",
);

@Injectable()
export class GiftAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
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
    const result = this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times) +
        this.transactionHelper.calcTransactionBlobFee(transaction)
      ).toString(),
    );
    if (result.isFeeEnough === false) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_LOGIC_FEE_NOT_ENOUGH, {
        signature: transaction.signature,
        minFee: result.minFee,
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
      });
    }
    return result.minFee;
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
    const result = this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times, miningMachineMinFeePerByte) +
        this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
    if (result.isFeeEnough === false) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_LOGIC_FEE_NOT_ENOUGH, {
        signature: transaction.signature,
        minFee: result.minFee,
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
      });
    }
    return result.minFee;
  }
}
