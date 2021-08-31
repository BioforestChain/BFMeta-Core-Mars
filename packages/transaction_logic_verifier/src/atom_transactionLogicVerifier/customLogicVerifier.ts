import type { CustomTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  PROP_IS_INVALID,
  REGISTER_DELEGTE_QUOTA_FULL,
} from "@bfchain/core-util-exception";

const { NoFoundException, ArgumentIllegalException, ConsensusException } = CoreExceptionGenerator(
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

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventSetSecondPublicKey(eventEmitter);

    eventLogicVerifier.listenEventSetUsername(accountGetterHelper, eventEmitter);

    eventLogicVerifier.listenEventRegisterToDelegate(
      cloneAccountsInfo,
      transactionGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventAcceptVote(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventRejectVote(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventVoteEquity(
      cloneAccountsInfo,
      transaction,
      curRound,
      eventEmitter,
    );

    const accountAssets = this.helperLogicVerifier.deepClone(sender.accountAssets);
    eventLogicVerifier.listenEventIssueAsset(
      accountAssets,
      transaction,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventUnfrozenAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventDestoryAsset(transaction, accountGetterHelper, eventEmitter);

    eventLogicVerifier.listenEventIssueDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventSaleDAppid(currentBlockHeight, accountGetterHelper, eventEmitter);

    eventLogicVerifier.listenEventPurchaseDAppid(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventRegisterLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventCancelLocationName(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventSaleLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventPurchaseLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventSetLnsManager(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventSetLnsRecordValue(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventRegisterChain(
      accountAssets,
      transaction,
      accountGetterHelper,
      eventEmitter,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

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

  async checkRegisterDelegateQuota(
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { maxDelegateTxsPerRound } = this.configHelper;
    const txCount = await transactionGetterHelper.getNumberOfNewDelegate();
    let realMaxDelegateTxsPerRound = maxDelegateTxsPerRound;

    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    if (currentBlockHeight < this.configHelper.blockPerRound) {
      realMaxDelegateTxsPerRound = realMaxDelegateTxsPerRound + this.configHelper.delegates;
    }
    if (txCount >= realMaxDelegateTxsPerRound) {
      throw new ConsensusException(REGISTER_DELEGTE_QUOTA_FULL, {
        round: curRound,
        function: "eventLogicVerifier",
      });
    }
  }
}
