import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { SetLnsManagerTransaction } from "@bfchain/core-model";
export declare class SetLnsManagerLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: SetLnsManagerTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
