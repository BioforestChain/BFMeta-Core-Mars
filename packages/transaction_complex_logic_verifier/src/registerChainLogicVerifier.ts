import type { RegisterChainTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { TransactionLogicVerifier } from "@bfchain/core-transaction-logic-verifier";

@Injectable()
export class RegisterChainLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: RegisterChainTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: RegisterChainTransaction) {
    return [transaction.type];
  }
}
