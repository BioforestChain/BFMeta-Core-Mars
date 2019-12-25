import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { RejectVoteTransaction } from "@bfchain/core-model";
export declare class RejectVoteLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: RejectVoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 是否已经是受托人
     *
     * @param accountInfo
     */
    isDelegateAlready(accountInfo: BFChainCore.AccountInfo): void;
    /**
     * 是否已经开启接收投票
     *
     * @param accountInfo
     */
    isRejectVoteAlready(accountInfo: BFChainCore.AccountInfo): void;
}
//# sourceMappingURL=rejectVoteLogicVerifier.d.ts.map