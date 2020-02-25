import { Transaction } from "@bfchain/core-model-transaction-base";
import { GrabAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class GrabAssetTransaction extends Transaction<BFChainCore.GrabAssetAssetJSON> implements BFChainCore.GrabAssetTransactionJSON {
    toJSON: () => BFChainCore.GrabAssetTransactionJSON;
    recipientId: string;
    asset: GrabAssetAssetModel;
}
