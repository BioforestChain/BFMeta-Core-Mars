import { GiftAnyTransaction, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";

@Injectable()
export class GiftAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAnyTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sourceChainMagic, assetType, parentAssetType, sourceChainName, totalGrabableTimes } =
      transaction.asset.giftAny;

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

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        sourceChainName,
        sourceChainMagic,
        assetType,
        accountGetterHelper,
      );

      eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);
    } // 冻结 dappid
    else if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
      eventLogicVerifier.listenEventFrozenDAppid(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }
    // 冻结 locationName
    else if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      eventLogicVerifier.listenEventFrozenLocationName(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }
    // 冻结 entity
    else if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      eventLogicVerifier.listenEventFrozenEntity(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );

      eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);

      eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);
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
        this.transactionHelper.calcTransactionMinBlobFeeByMaxBytes(times)
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
        this.transactionHelper.calcTransactionMinBlobFeeByMaxBytes(
          times,
          miningMachineMinFeePerByte,
        )
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
