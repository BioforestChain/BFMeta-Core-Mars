import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { RejectVoteTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";

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
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    return true;
  }
}
