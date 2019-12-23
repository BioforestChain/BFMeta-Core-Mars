import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, DelegateTransaction } from "../../model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_IS_ALREADY_AN_DELEGATE,
  INVALID_ACCOUNT_ALIAS,
  SET_USERANME_AT_FIRST,
} from "@bfchain/core-helper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "DelegateLogicVerifier");

@Injectable()
export class DelegateLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DelegateTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const accountInfo = sender.accountInfo;
    if (!accountInfo.username) {
      throw new ConsensusException(SET_USERANME_AT_FIRST, {
        address: accountInfo.address,
        ...Function_Exception_Detail,
      });
    }

    if (transaction.asset.delegate.username !== accountInfo.username) {
      throw new ConsensusException(INVALID_ACCOUNT_ALIAS, {
        address: accountInfo.address,
        alias: transaction.asset.delegate.username,
        ...Function_Exception_Detail,
      });
    }

    if (accountInfo.isDelegate) {
      throw new ConsensusException(ACCOUNT_IS_ALREADY_AN_DELEGATE, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_DELEGATE,
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
