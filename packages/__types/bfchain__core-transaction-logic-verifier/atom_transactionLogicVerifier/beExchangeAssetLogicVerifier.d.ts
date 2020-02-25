import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { BeExchangeAssetTransaction } from "@bfchain/core-model";
export declare class BeExchangeAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: BeExchangeAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isValidRecipientId(transaction: BeExchangeAssetTransaction, toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>): void;
    isDependentTransactionMatch(transaction: BeExchangeAssetTransaction, toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>): void;
    checkSecondaryTransaction(transaction: BeExchangeAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
}
