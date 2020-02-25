import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { CustomTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST, PROP_IS_INVALID } from "@bfchain/core-util-exception";

const { NoFoundException, ArgumentIllegalException } = CoreExceptionGenerator(
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

    const result = await customTransactionCenter.logicVerify(transaction);

    if (!(result && result.ret)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transaction",
        target: "transaction",
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
