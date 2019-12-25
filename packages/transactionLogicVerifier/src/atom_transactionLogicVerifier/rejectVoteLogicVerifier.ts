import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { RejectVoteTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_IS_NOT_AN_DELEGATE,
  DELEGATE_IS_ALREADY_ACCEPT_VOTE,
  DELEGATE_IS_ALREADY_REJECT_VOTE,
} from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "RejectVoteLogicVerifyer");

@Injectable()
export class RejectVoteLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: RejectVoteTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    this.isDelegateAlready(sender.accountInfo);
    this.isRejectVoteAlready(sender.accountInfo);
    return true;
  }

  /**
   * 是否已经是受托人
   *
   * @param accountInfo
   */
  isDelegateAlready(accountInfo: BFChainCore.AccountInfo) {
    if (!accountInfo.isDelegate) {
      throw new ConsensusException(ACCOUNT_IS_NOT_AN_DELEGATE, {
        address: accountInfo.address,
        function: "isDelegateAlready",
      });
    }
  }

  /**
   * 是否已经开启接收投票
   *
   * @param accountInfo
   */
  isRejectVoteAlready(accountInfo: BFChainCore.AccountInfo) {
    if (!accountInfo.isAcceptVote) {
      throw new ConsensusException(DELEGATE_IS_ALREADY_REJECT_VOTE, {
        address: accountInfo.address,
        function: "isRejectVoteAlready",
      });
    }
  }
}
