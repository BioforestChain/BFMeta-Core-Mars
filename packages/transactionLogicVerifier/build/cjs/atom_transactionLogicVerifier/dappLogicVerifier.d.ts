import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { DAppTransaction, DAppPurchaseAssetModel, DAppModel } from "@bfchain/core-model";
export declare class DAppLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DAppTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 用于购买 dapp 的资产是否存在
     *
     * @param purchaseAsset
     */
    isPurchaseAssetExist(purchaseAsset: DAppPurchaseAssetModel, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 购买的 dappid 是否存在
     *
     * @param dapp
     * @param currentBlockHeight
     * @param accountGetterHelper
     */
    isPurchaseDAppidExist(dapp: DAppModel, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=dappLogicVerifier.d.ts.map