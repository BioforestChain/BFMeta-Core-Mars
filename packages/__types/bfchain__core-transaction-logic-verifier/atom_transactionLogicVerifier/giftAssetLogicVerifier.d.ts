import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { GiftAssetTransaction } from "@bfchain/core-model";
export declare class GiftAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: GiftAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
