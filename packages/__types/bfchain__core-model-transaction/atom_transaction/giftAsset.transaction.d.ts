import { Transaction } from "@bfchain/core-model-transaction-base";
import { GiftAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class GiftAssetTransaction extends Transaction<BFChainCore.GiftAssetAssetJSON> implements BFChainCore.GiftAssetTransactionJSON {
    toJSON: () => BFChainCore.GiftAssetTransactionJSON;
    recipientId: undefined;
    asset: GiftAssetAssetModel;
}
