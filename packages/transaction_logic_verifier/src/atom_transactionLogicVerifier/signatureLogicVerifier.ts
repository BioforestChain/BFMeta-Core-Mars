import type { SignatureTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

@Injectable()
export class SignatureLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: SignatureTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

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
}
