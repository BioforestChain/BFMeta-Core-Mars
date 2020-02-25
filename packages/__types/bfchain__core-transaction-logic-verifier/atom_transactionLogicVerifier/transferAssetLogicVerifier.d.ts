import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { TransferAssetTransaction } from "@bfchain/core-model";
export declare class TransferAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: TransferAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
