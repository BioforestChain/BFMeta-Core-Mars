import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { ToExchangeAssetTransaction, ToExchangeAssetModel } from "@bfchain/core-model";
export declare class ToExchangeAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: ToExchangeAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isExchangeAssetAlreadyExist(toExchangeAssetAsset: ToExchangeAssetModel, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
