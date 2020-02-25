import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { GrabAssetTransaction } from "@bfchain/core-model";
export declare class GrabAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: GrabAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isValidRecipientId(transaction: GrabAssetTransaction, giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>): void;
    isDependentTransactionMatch(transaction: GrabAssetTransaction, giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>): void;
    checkSecondaryTransaction(transaction: GrabAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
}
