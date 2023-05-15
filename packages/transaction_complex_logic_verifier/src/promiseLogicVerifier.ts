import { NewTransactionRefuseReason, PromiseTransaction } from "@bfchain/core-model";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
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
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
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
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

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

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
