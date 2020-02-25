import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DestoryAssetTransaction } from "@bfchain/core-model";
export declare class DestoryAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DestoryAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
