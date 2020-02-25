import { Transaction } from "@bfchain/core-model-transaction-base";
import { ImmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class ImmigrateAssetTransaction extends Transaction<BFChainCore.ImmigrateAssetAssetJSON> implements BFChainCore.ImmigrateAssetTransactionJSON {
    toJSON: () => BFChainCore.ImmigrateAssetTransactionJSON;
    recipientId: undefined;
    asset: ImmigrateAssetAssetModel;
}
