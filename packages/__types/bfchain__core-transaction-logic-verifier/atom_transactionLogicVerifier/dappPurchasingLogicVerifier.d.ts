import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DAppPurchasingTransaction } from "@bfchain/core-model";
export declare class DAppPurchasingLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DAppPurchasingTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
