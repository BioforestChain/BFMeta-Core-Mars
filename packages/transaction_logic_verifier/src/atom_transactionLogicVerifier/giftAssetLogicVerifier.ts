import { GiftAssetTransaction, NewTransactionRefuseReason } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, TRANSACTION_FEE_NOT_ENOUGH } from "@bfchain/core-util-exception";
const { ConsensusException } = CoreExceptionGenerator("CONTROLLER", "GiftAssetLogicVerifier");

@Injectable()
export class GiftAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sourceChainMagic, assetType, sourceChainName, totalGrabableTimes } =
      transaction.asset.giftAsset;

    this.__checkTrsFee(transaction.fee, totalGrabableTimes);

    await this.helperLogicVerifier.isAssetExist(
      sourceChainName,
      sourceChainMagic,
      assetType,
      accountGetterHelper,
    );

    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private __checkTrsFee(fee: string, totalGrabableTimes: number) {
    const { maxTransactionSize, minTransactionFeePerByte } = this.configHelper;
    const byteLength = maxTransactionSize * (totalGrabableTimes + 1);
    const feePerByte = {
      numerator: BigInt(fee),
      denominator: byteLength,
    };
    const result = this.jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
    if (result < 0) {
      // 红包交易默认按照最大交易体付手续费
      const minFee = this.jsbiHelper
        .multiplyCeilFraction(feePerByte.denominator, minTransactionFeePerByte)
        .toString();
      throw new ConsensusException(TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee: minFee.toString(),
        target: "transaction",
        function: "__checkTrsFee",
      });
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: GiftAssetTransaction, byteLength: number) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionMinFeeByMaxBytes(
        transaction.asset.giftAsset.totalGrabableTimes + 1,
      ),
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
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionMinFeeByMaxBytes(
        transaction.asset.giftAsset.totalGrabableTimes + 1,
        miningMachineMinFeePerByte,
      ),
    );
  }
}
