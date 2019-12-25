import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { CustomTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "CustomLogicVerifier",
);

@Injectable()
export class CustomLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: CustomTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ): Promise<boolean> {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    if (!customTransactionCenter) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "customTransactionCenter",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    await customTransactionCenter.logicVerify(transaction);

    return true;
  }
}
