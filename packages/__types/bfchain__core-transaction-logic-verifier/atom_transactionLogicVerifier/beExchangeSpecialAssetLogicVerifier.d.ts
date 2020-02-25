import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { BeExchangeSpecialAssetTransaction } from "@bfchain/core-model";
export declare class BeExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: BeExchangeSpecialAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isValidRecipientId(transaction: BeExchangeSpecialAssetTransaction, toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>): void;
    isDependentTransactionMatch(transaction: BeExchangeSpecialAssetTransaction, toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>): void;
    checkSecondaryTransaction(transaction: BeExchangeSpecialAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
}
