import { Transaction } from "@bfchain/core-model-transaction-base";
import { EmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class EmigrateAssetTransaction extends Transaction<BFChainCore.EmigrateAssetAssetJSON> implements BFChainCore.EmigrateAssetTransactionJSON {
    toJSON: () => BFChainCore.EmigrateAssetTransactionJSON;
    recipientId: undefined;
    asset: EmigrateAssetAssetModel;
}
