import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { VoteTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
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
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    const { recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    if (!recipient) {
      throw new NoFoundException(NOT_FOUND, {
        prop: `recipient ${transaction.recipientId}`,
        ...Function_Exception_Detail,
      });
    }
    await this.isVoteForAcceptVoteDelegate(recipient, accountGetterHelper);

    return true;
  }

  /**
   * 是否投给了接收投票的受托人
   *
   * @param recipient
   * @param accountGetterHelper
   */
  async isVoteForAcceptVoteDelegate(
    recipient: BFChainCore.AccountInfoAndAssets,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "isVoteForAcceptVoteDelegate",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const accountInfo = recipient.accountInfo;

    if (!accountInfo.isDelegate) {
      throw new ConsensusException(ACCOUNT_IS_NOT_AN_DELEGATE, {
        address: recipient,
        ...Function_Exception_Detail,
      });
    }

    if (!accountInfo.isAcceptVote) {
      throw new ConsensusException(DELEGATE_IS_ALREADY_REJECT_VOTE, {
        address: recipient,
        ...Function_Exception_Detail,
      });
    }
  }
}
