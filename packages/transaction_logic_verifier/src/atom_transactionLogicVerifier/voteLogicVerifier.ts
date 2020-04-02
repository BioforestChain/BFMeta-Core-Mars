import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { VoteTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  ACCOUNT_IS_NOT_AN_DELEGATE,
  DELEGATE_IS_ALREADY_REJECT_VOTE,
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
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    await this.isVoteForAcceptVoteDelegate(transaction.recipientId, accountGetterHelper);

    return true;
  }

  /**
   * 是否投给了接收投票的受托人
   *
   * @param address
   * @param accountGetterHelper
   */
  async isVoteForAcceptVoteDelegate(
    address: string,
    accountGetterHelper = this.accountGetterHelper,
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
    const delegate = await accountGetterHelper.getAccountInfo(address);
    if (!delegate) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Account with address ${address}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (!delegate.isDelegate) {
      throw new ConsensusException(ACCOUNT_IS_NOT_AN_DELEGATE, {
        address,
        ...Function_Exception_Detail,
      });
    }

    if (!delegate.isAcceptVote) {
      throw new ConsensusException(DELEGATE_IS_ALREADY_REJECT_VOTE, {
        address,
        ...Function_Exception_Detail,
      });
    }
  }
}
