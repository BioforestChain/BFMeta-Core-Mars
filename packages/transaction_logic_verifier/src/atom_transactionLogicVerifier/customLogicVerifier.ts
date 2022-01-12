import type { CustomTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

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

    const { eventLogicVerifier, helperLogicVerifier } = this;

    eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventSetSecondPublicKey(eventEmitter);

    eventLogicVerifier.listenEventSetUsername(accountGetterHelper, eventEmitter);

    eventLogicVerifier.listenEventRegisterToDelegate(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventAcceptVote(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventRejectVote(cloneAccountsInfo, eventEmitter);

    eventLogicVerifier.listenEventVoteEquity(
      cloneAccountsInfo,
      curRound,
      eventEmitter,
    );

    eventLogicVerifier.listenEventIssueAsset(
      helperLogicVerifier.deepClone(sender.accountAssets),
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventUnfrozenAsset(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventDestoryAsset(accountGetterHelper, eventEmitter);

    eventLogicVerifier.listenEventIssueDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventFrozenDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventUnfrozenDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventChangeDAppidPossessor(
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
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventFrozenLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventUnfrozenLocationName(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventChangeLocationNamePossessor(
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

    eventLogicVerifier.listenEventIssueEntityFactory(
      helperLogicVerifier.deepClone(sender.accountAssets),
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventIssueEntity(
      helperLogicVerifier.deepClone(sender.accountAssets),
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventDestoryEntity(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventFrozenEntity(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventUnfrozenEntity(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventChangeEntityPossessor(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventRegisterChain(
      helperLogicVerifier.deepClone(sender.accountAssets),
      accountGetterHelper,
      eventEmitter,
    );

    eventLogicVerifier.listenEventMigrateCertificate(accountGetterHelper, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    if (!customTransactionCenter) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "customTransactionCenter",
        target: "moduleStroge",
      });
    }

    const result = await customTransactionCenter.logicVerify(transaction);

    if (!(result && result.ret)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "transaction",
        target: "transaction",
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
      throw new ConsensusException(ERROR_LIST.REGISTER_DELEGTE_QUOTA_FULL, {
        round: curRound,
      });
    }
  }
}
