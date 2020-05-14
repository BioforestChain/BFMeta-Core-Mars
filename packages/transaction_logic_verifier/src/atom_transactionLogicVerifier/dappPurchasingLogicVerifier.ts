import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DAppPurchasingTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  DAPPID_IS_NOT_EXIST,
  NO_NEED_TO_PURCHASE_SPECIAL_ASSET,
  SHOULD_BE,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "DAppPurchasingLogicVerifier",
);

@Injectable()
export class DAppPurchasingLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppPurchasingTransaction,
    currentBlockHeight: number,
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
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    return true;
  }
}
