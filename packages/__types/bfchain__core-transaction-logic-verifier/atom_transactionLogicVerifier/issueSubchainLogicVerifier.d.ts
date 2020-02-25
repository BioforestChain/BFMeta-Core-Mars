import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { IssueSubchainTransaction } from "@bfchain/core-model";
export declare class IssueSubchainLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: IssueSubchainTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
