import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DAppTransaction } from "@bfchain/core-model";
export declare class DAppLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DAppTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
