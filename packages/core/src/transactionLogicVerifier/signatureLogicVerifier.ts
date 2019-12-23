import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { SignatureTransaction } from "../../model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-helper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "SignatureLogicVerifier");

@Injectable()
export class SignatureLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: SignatureTransaction,
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

    return true;
  }
}
