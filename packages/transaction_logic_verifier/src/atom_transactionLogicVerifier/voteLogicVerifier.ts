import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, VoteTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  DAPPID_IS_NOT_EXIST,
  NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE,
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
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    await this.isVoteForAcceptVoteDelegate(transaction.recipientId, accountGetterHelper);
    await this.enableToUseDAppid(transaction, currentBlockHeight, accountGetterHelper);

    return true;
  }

  /**
   * 能否使用 dappid
   *
   * @param transaction
   * @param currentBlockHeight
   * @param accountGetterHelper
   */
  async enableToUseDAppid(
    transaction: VoteTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "enableToUseDAppid",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 校验 dappid
    const { fromMagic, dappid, senderId, recipientId } = transaction;
    if (dappid) {
      const { blockHelper } = this;
      const dapp = (await accountGetterHelper.getDApp(fromMagic, dappid, currentBlockHeight)) as
        | BFChainCore.DAppInfo
        | undefined;
      if (!dapp) {
        throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
          dappid,
          ...Function_Exception_Detail,
        });
      }
      if (dapp.possessorAddress === recipientId) {
        return;
      }
      // 获取dapp开发账户
      const accountInfo = await accountGetterHelper.getAccountInfo(dapp.possessorAddress);
      if (!accountInfo) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `Account with address ${dapp.possessorAddress}`,
          target: "blockChain",
          ...Function_Exception_Detail,
        });
      }

      if (!accountInfo.isAcceptVote) {
        return;
      }

      const curRound = blockHelper.calcRoundByHeight(currentBlockHeight);
      // 判断当前账户是否给 dapp 开发者投过票
      const isVote = await accountGetterHelper.getVoteForDelegate(
        senderId,
        dapp.possessorAddress,
        dappid,
        curRound,
      );
      if (!isVote) {
        throw new ConsensusException(NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE, {
          dappid,
          errorId: NewTransactionRefuseReason.MUSET_VOTE_FOR_DAPP_POSSESSOR,
          ...Function_Exception_Detail,
        });
      }
    }
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
