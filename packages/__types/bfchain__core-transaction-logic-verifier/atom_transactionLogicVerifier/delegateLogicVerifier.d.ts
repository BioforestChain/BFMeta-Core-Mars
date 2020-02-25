import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DelegateTransaction } from "@bfchain/core-model";
export declare class DelegateLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DelegateTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
