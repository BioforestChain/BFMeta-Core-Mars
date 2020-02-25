import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppPurchasingAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class DAppPurchasingTransaction extends Transaction<BFChainCore.DAppPurchasingAssetJSON> implements BFChainCore.DAppPurchasingTransactionJSON {
    toJSON: () => BFChainCore.DAppPurchasingTransactionJSON;
    recipientId: string;
    asset: DAppPurchasingAssetModel;
}
