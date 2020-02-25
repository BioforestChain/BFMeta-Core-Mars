import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { UsernameTransaction } from "@bfchain/core-model";
export declare class UsernameLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: UsernameTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
