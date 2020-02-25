import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { CustomTransaction } from "@bfchain/core-model";
export declare class CustomLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: CustomTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
