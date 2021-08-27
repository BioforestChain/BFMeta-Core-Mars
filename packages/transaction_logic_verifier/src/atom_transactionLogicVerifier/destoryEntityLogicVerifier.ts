import type { DestoryEntityTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";

@Injectable()
export class DestoryEntityLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DestoryEntityTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
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
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    // 手续费
    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    // 赎回单项冻结的资产
    this.eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    // 销毁 entity
    this.eventLogicVerifier.listenEventDestoryEntity(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: DestoryEntityTransaction) {
    return [transaction.asset.destoryEntity.entityId];
  }
}
