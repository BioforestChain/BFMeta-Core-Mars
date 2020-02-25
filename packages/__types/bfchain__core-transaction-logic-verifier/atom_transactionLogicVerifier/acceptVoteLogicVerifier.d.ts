import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { AcceptVoteTransaction } from "@bfchain/core-model";
export declare class AcceptVoteLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: AcceptVoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
