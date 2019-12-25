import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { DAppPurchasingTransaction } from "@bfchain/core-model";
export declare class DAppPurchasingLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DAppPurchasingTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=dappPurchasingLogicVerifier.d.ts.map