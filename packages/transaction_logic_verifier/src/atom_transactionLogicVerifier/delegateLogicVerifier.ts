import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DelegateTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  INVALID_ACCOUNT_ALIAS,
  SET_USERANME_AT_FIRST,
} from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "DelegateLogicVerifier");

@Injectable()
export class DelegateLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DelegateTransaction,
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

    const { sender, curRound } = await this.logicVerify(
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

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventRegisterToDelegate(
      cloneAccountsInfo,
      curRound,
      transactionGetterHelper,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction);

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

    return true;
  }
}
