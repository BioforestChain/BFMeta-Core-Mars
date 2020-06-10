import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { CustomTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
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

    this.eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo);

    this.eventLogicVerifier.listenEventSetSecondPublicKey();

    this.eventLogicVerifier.listenEventSetUsername(accountGetterHelper);

    this.eventLogicVerifier.listenEventRegisterToDelegate(
      cloneAccountsInfo,
      curRound,
      transactionGetterHelper,
    );

    this.eventLogicVerifier.listenEventAcceptVote(cloneAccountsInfo);

    this.eventLogicVerifier.listenEventRejectVote(cloneAccountsInfo);

    this.eventLogicVerifier.listenEventVoteEquity(cloneAccountsInfo, transaction, curRound);

    this.eventLogicVerifier.listenEventIssueAsset(
      cloneAccountsAssets,
      transaction,
      accountGetterHelper,
      transactionGetterHelper,
    );

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    this.eventLogicVerifier.listenEventDestoryAsset(transaction, accountGetterHelper);

    this.eventLogicVerifier.listenEventIssueDAppid(currentBlockHeight, accountGetterHelper);

    this.eventLogicVerifier.listenEventSaleDAppid(currentBlockHeight, accountGetterHelper);

    this.eventLogicVerifier.listenEventPurchaseDAppid(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
    );

    this.eventLogicVerifier.listenEventRegisterLocationName(
      currentBlockHeight,
      accountGetterHelper,
    );

    this.eventLogicVerifier.listenEventCancelLocationName(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
    );

    this.eventLogicVerifier.listenEventSaleLocationName(currentBlockHeight, accountGetterHelper);

    this.eventLogicVerifier.listenEventPurchaseLocationName(
      currentBlockHeight,
      accountGetterHelper,
    );

    this.eventLogicVerifier.listenEventSetLnsManager(currentBlockHeight, accountGetterHelper);

    this.eventLogicVerifier.listenEventSetLnsRecordValue(currentBlockHeight, accountGetterHelper);

    this.eventLogicVerifier.listenEventRegisterChain(
      cloneAccountsAssets,
      transaction,
      accountGetterHelper,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction);

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
