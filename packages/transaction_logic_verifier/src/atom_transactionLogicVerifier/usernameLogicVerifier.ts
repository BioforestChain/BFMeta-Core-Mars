import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, UsernameTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_ALREADY_HAVE_USERNAME,
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
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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

    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventSetUsername(accountGetterHelper);

    await this.eventLogicVerifier.awaitEventResult(transaction);

    if (sender.accountInfo.username) {
      throw new ConsensusException(ACCOUNT_ALREADY_HAVE_USERNAME, {
        errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_HAVE_USERNAME,
        function: "verify",
      });
    }

    return true;
  }
}
