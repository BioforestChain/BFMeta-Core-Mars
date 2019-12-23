import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GiftAssetTransaction } from "../../model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-helper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "GiftAssetLogicVerifier");

@Injectable()
export class GiftAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    return true;
  }
}
