import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { ToExchangeSpecialAssetTransaction } from "@bfchain/core-model";
export declare class ToExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: ToExchangeSpecialAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
