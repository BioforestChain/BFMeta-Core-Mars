import { VoteTransaction, NewTransactionRefuseReason } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_IS_NOT_AN_DELEGATE,
  DELEGATE_IS_ALREADY_REJECT_VOTE,
  NOT_FOUND,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "VoteLogicVerifier",
);

@Injectable()
export class VoteLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: VoteTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
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

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventVoteEquity(cloneAccountsInfo, curRound, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    if (!recipient) {
      throw new NoFoundException(NOT_FOUND, {
        prop: `recipient ${transaction.recipientId}`,
        ...Function_Exception_Detail,
      });
    }
    await this.isVoteForAcceptVoteDelegate(recipient);

    return true;
  }

  /**
   * 是否投给了接收投票的受托人
   *
   * @param recipient
   */
  private async isVoteForAcceptVoteDelegate(recipient: BFChainCore.AccountInfoAndAssets) {
    const Function_Exception_Detail = {
      function: "isVoteForAcceptVoteDelegate",
    } as const;

    const accountInfo = recipient.accountInfo;

    if (!accountInfo.isDelegate) {
      throw new ConsensusException(ACCOUNT_IS_NOT_AN_DELEGATE, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.ACCOUNT_IS_NOT_AN_DELEGATE,
        ...Function_Exception_Detail,
      });
    }

    if (!accountInfo.isAcceptVote) {
      throw new ConsensusException(DELEGATE_IS_ALREADY_REJECT_VOTE, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.DELEGATE_IS_ALREADY_REJECT_VOTE,
        ...Function_Exception_Detail,
      });
    }
  }
}
