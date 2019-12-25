import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { VoteTransaction } from "@bfchain/core-model";
export declare class VoteLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: VoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 能否使用 dappid
     *
     * @param transaction
     * @param currentBlockHeight
     * @param accountGetterHelper
     */
    enableToUseDAppid(transaction: VoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 是否投给了接收投票的受托人
     *
     * @param address
     * @param accountGetterHelper
     */
    isVoteForAcceptVoteDelegate(address: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=voteLogicVerifier.d.ts.map