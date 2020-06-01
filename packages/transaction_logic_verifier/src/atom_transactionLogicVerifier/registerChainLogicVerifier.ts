import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { RegisterChainTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";

@Injectable()
export class RegisterChainLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: RegisterChainTransaction,
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
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    this.eventLogicVerifier.listenEventFrozenAccount(cloneAccountsInfo);

    this.eventLogicVerifier.listenEventRegisterChain(
      cloneAccountsAssets,
      transaction,
      accountGetterHelper,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction);

    return true;
  }
}
