import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { MarkTransaction } from "@bfchain/core-model";
export declare class MarkLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: MarkTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * dappid 是否已经存在
     *
     * @param magic
     * @param dappid
     * @param currentBlockHeight
     */
    isDAppidAlreadyExist(magic: string, dappid: string, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=markLogicVerifier.d.ts.map