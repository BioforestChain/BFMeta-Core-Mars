import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestoryAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class DestoryAssetTransaction extends Transaction<BFChainCore.DestoryAssetAssetJSON> implements BFChainCore.DestoryAssetTransactionJSON {
    toJSON: () => BFChainCore.DestoryAssetTransactionJSON;
    recipientId: undefined;
    asset: DestoryAssetAssetModel;
}
