import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { AcceptVoteTransaction } from "@bfchain/core-model";
export declare class AcceptVoteLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: AcceptVoteTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 是否已经是受托人
     *
     * @param accountInfo
     */
    isDelegateAlready(accountInfo: BFChainCore.AccountInfo): void;
    /**
     * 是否已经关闭受托人
     *
     * @param accountInfo
     */
    isAcceptVoteAlready(accountInfo: BFChainCore.AccountInfo): void;
}
//# sourceMappingURL=acceptVoteLogicVerifier.d.ts.map