import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { DelegateTransaction } from "@bfchain/core-model";
export declare class DelegateLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DelegateTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=delegateLogicVerifier.d.ts.map