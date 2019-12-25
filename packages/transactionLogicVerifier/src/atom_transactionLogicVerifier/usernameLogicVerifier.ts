import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, UsernameTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_ALREADY_HAVE_USERNAME,
  USERNAME_ALREADY_EXIST,
  NOT_EXIST,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "UsernameLogicVerifier",
);

@Injectable()
export class UsernameLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: UsernameTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    if (sender.accountInfo.username) {
      throw new ConsensusException(ACCOUNT_ALREADY_HAVE_USERNAME, {
        errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_HAVE_USERNAME,
        function: "verify",
      });
    }

    await this.isAliasAlreadyExist(transaction.asset.username.alias, accountGetterHelper);

    return true;
  }

  /**
   * 委托账户是否处于冻结状态
   *
   * @param trustees
   */
  async isAliasAlreadyExist(alias: string, accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isAliasAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const memUsername = await accountGetterHelper.getAlias(alias);
    if (memUsername) {
      throw new ConsensusException(USERNAME_ALREADY_EXIST, {
        errorId: NewTransactionRefuseReason.USERNAME_ALREADY_EXIST,
        ...Function_Exception_Detail,
      });
    }
  }
}
