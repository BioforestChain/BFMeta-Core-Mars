import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { NewTransactionRefuseReason, UsernameTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_ALREADY_HAVE_USERNAME,
} from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "UsernameLogicVerifier");

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
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
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
