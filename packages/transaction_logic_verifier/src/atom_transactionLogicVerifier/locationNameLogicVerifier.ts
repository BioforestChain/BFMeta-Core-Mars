import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { LocationNameTransaction, LOCATION_NAME_OPERATION_TYPE } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";

@Injectable()
export class LocationNameLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: LocationNameTransaction,
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

    const operationType = transaction.asset.locationName.operationType;
    if (operationType === LOCATION_NAME_OPERATION_TYPE.REGISTRATION) {
      eventLogicVerifier.listenEventRegisterLocationName(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else {
      eventLogicVerifier.listenEventCancelLocationName(
        transaction,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: LocationNameTransaction) {
    return [transaction.asset.locationName.name];
  }
}
