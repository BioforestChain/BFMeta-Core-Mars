import { NewTransactionRefuseReason, PromiseTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "PromiseLogicVerifier",
);

@Injectable()
export class PromiseLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: PromiseTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { signature } = transaction.asset.promise.transaction;
    const promiseTransaction = await transactionGetterHelper.getTransactionBySignature(
      signature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    );
    if (promiseTransaction) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `promiseTransaction ${signature}`,
        target: "blockChain",
        errorId: NewTransactionRefuseReason.TRANSACTION_IN_TRS,
      });
    }

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
