import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { VoteTransaction } from "@bfchain/core-model";
export declare class VoteLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: VoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    enableToUseDAppid(transaction: VoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    isVoteForAcceptVoteDelegate(address: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
