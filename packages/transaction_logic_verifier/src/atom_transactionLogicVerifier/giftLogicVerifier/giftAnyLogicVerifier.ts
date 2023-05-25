import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { GiftAnyTransaction, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";

@Injectable()
export class GiftAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAnyTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
    const { sourceChainMagic, assetType, parentAssetType, sourceChainName } =
      transaction.asset.giftAny;

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        sourceChainName,
        sourceChainMagic,
        assetType,
        accountGetterHelper,
      );
    }

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
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
  checkTrsFeeAndWebFee(transaction: GiftAnyTransaction, byteLength: number) {
    const times = transaction.asset.giftAny.totalGrabableTimes + 1;
    return this.isFeeEnough(
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
    transaction: GiftAnyTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    const times = transaction.asset.giftAny.totalGrabableTimes + 1;
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times, miningMachineMinFeePerByte) +
        this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: GiftAnyTransaction) {
    const { parentAssetType, assetType } = transaction.asset.giftAny;
    const locks: string[] = [];
    if (
      parentAssetType === PARENT_ASSET_TYPE.DAPP ||
      parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      parentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(assetType);
    }
    return locks;
  }
}
