import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { RejectVoteTransaction } from "@bfchain/core-model";
export declare class RejectVoteLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: RejectVoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
