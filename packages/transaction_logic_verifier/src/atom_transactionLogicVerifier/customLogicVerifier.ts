import type { CustomTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST, PROP_IS_INVALID } from "@bfchain/core-util-exception";

const { NoFoundException, ArgumentIllegalException } = CoreExceptionGenerator(
  "VERIFIER",
  "CustomLogicVerifier",
);

@Injectable()
export class CustomLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: CustomTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    customTransactionCenter = this.customTransactionCenter,
  ): Promise<boolean> {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;

    const { sender, recipient, curRound } = await this.logicVerify(
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

    this.eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo, eventEmitter);

    this.eventLogicVerifier.listenEventSetSecondPublicKey(eventEmitter);

    this.eventLogicVerifier.listenEventSetUsername(accountGetterHelper, eventEmitter);

    this.eventLogicVerifier.listenEventRegisterToDelegate(
      cloneAccountsInfo,
      curRound,
      transactionGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventAcceptVote(cloneAccountsInfo, eventEmitter);

    this.eventLogicVerifier.listenEventRejectVote(cloneAccountsInfo, eventEmitter);

    this.eventLogicVerifier.listenEventVoteEquity(
      cloneAccountsInfo,
      transaction,
      curRound,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventIssueAsset(
      cloneAccountsAssets,
      transaction,
      accountGetterHelper,
      transactionGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventDestoryAsset(transaction, accountGetterHelper, eventEmitter);

    this.eventLogicVerifier.listenEventIssueDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventSaleDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventPurchaseDAppid(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventRegisterLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventCancelLocationName(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventSaleLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventPurchaseLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventSetLnsManager(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventSetLnsRecordValue(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    this.eventLogicVerifier.listenEventRegisterChain(
      cloneAccountsAssets,
      transaction,
      accountGetterHelper,
      eventEmitter,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    if (!customTransactionCenter) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "customTransactionCenter",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const result = await customTransactionCenter.logicVerify(transaction);

    if (!(result && result.ret)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transaction",
        target: "transaction",
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
