import type { PromiseResolveTransaction } from "@bfchain/core-model";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionCore } from "@bfchain/core-transaction";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "PromiseResolveLogicVerifier",
);

@Injectable()
export class PromiseResolveLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: PromiseResolveTransaction,
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

    const { promiseId } = transaction.asset.resolve;
    const promiseTransactionJson = await transactionGetterHelper.getPromiseTransaction(promiseId);
    if (!promiseTransactionJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `Promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }
    if (promiseTransactionJson.effectiveBlockHeight < currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXPIRED, {
        prop: `Promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }
    const result = await transactionGetterHelper.getTransactionBySignature(
      promiseTransactionJson.signature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    );
    if (result) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `Promise transaction ${promiseTransactionJson.signature}`,
        target: "blockChain",
      });
    }

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    const accountMap = new Map<string, BFChainCore.AccountInfoAndAssets>([[senderId, sender]]);
    if (recipientId && recipient) {
      accountMap.set(recipientId, recipient);
    }

    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransactionJson.type,
    );
    const { senderId: subSenderId, recipientId: subRecipientId } = promiseTransactionJson;
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
    const promiseTransaction = await this.transactionCore.recombineTransaction(
      promiseTransactionJson,
    );
    await logicVerify.verify(
      promiseTransaction,
      currentBlockHeight,
      { sender: subSender, recipient: subRecipient },
      accountGetterHelper,
      transactionGetterHelper,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
