import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { TransferAssetTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransferAssetLogicVerifier");

@Injectable()
export class TransferAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: TransferAssetTransaction,
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
