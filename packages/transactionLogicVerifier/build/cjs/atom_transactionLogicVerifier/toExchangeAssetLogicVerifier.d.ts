import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { ToExchangeAssetTransaction, ToExchangeAssetModel } from "@bfchain/core-model";
export declare class ToExchangeAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: ToExchangeAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 交换的双方资产是否已经存在
     *
     * @param toExchangeAssetAsset
     */
    isExchangeAssetAlreadyExist(toExchangeAssetAsset: ToExchangeAssetModel, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=toExchangeAssetLogicVerifier.d.ts.map