import type { MacroCallTransaction } from "@bfchain/core-model";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionCore } from "@bfchain/core-transaction";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "MacroCallLogicVerifier",
);

@Injectable()
export class MacroCallLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: MacroCallTransaction,
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

    const { macroId, inputs } = transaction.asset.call;

    const macroTransactionJson = await transactionGetterHelper.getMacroCallTransaction(
      macroId,
      inputs,
    );
    if (!macroTransactionJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `Transaction with signature ${macroId}`,
        target: "blockChain",
      });
    }
    if (macroTransactionJson.effectiveBlockHeight < currentBlockHeight) {
      throw new NoFoundException(ERROR_LIST.ALREADY_EXPIRED, {
        prop: `Transaction with signature ${macroId}`,
        target: "blockChain",
      });
    }

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    const accountMap = new Map<string, BFChainCore.AccountInfoAndAssets>([[senderId, sender]]);
    if (recipientId && recipient) {
      accountMap.set(recipientId, recipient);
    }

    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      macroTransactionJson.type,
    );
    const { senderId: subSenderId, recipientId: subRecipientId } = macroTransactionJson;
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
    const macroTransaction = await this.transactionCore.recombineTransaction(macroTransactionJson);
    await logicVerify.verify(
      macroTransaction,
      currentBlockHeight,
      { sender: subSender, recipient: subRecipient },
      accountGetterHelper,
      transactionGetterHelper,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
