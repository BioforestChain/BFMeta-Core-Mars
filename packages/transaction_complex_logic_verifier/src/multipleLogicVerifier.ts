import type { MultipleTransaction } from "@bfchain/core-model";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "MultipleLogicVerifier",
);

@Injectable()
export class MultipleLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: MultipleTransaction,
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

    const { senderId, recipientId } = transaction;
    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    const { transactions } = transaction.asset.multiple;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    const accountMap = new Map<string, BFChainCore.AccountInfoAndAssets>([[senderId, sender]]);
    if (recipientId && recipient) {
      accountMap.set(recipientId, recipient);
    }
    for (const subTransaction of transactions) {
      const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      const { senderId: subSenderId, recipientId: subRecipientId } = subTransaction;
      let subSender = accountMap.get(subSenderId);
      if (!subSender) {
        const result = await accountGetterHelper.getAccountInfoAndAssets(
          senderId,
          currentBlockHeight,
        );
        if (!result) {
          throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
            prop: `Account with address ${subSenderId}`,
            target: "blockChain",
          });
        }
        subSender = result;
        accountMap.set(subSenderId, subSender);
      }
      let subRecipient: BFChainCore.AccountInfoAndAssets | undefined;
      if (subRecipientId) {
        const result = await accountGetterHelper.getAccountInfoAndAssets(
          subRecipientId,
          currentBlockHeight,
        );
        if (!result) {
          throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
            prop: `Account with address ${subSenderId}`,
            target: "blockChain",
          });
        }
        subRecipient = result;
        accountMap.set(subRecipientId, subRecipient);
      }
      await logicVerify.verify(
        subTransaction,
        currentBlockHeight,
        { sender: subSender, recipient: subRecipient },
        accountGetterHelper,
        transactionGetterHelper,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
