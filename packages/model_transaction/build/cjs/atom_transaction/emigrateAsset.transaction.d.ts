import { Transaction } from "@bfchain/core-model-transaction-base";
import { EmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * emigrateAsset 交易模型
 *
 */
export declare class EmigrateAssetTransaction extends Transaction<BFChainCore.EmigrateAssetAssetJSON> implements BFChainCore.EmigrateAssetTransactionJSON {
    toJSON: () => BFChainCore.EmigrateAssetTransactionJSON;
    recipientId: undefined;
    asset: EmigrateAssetAssetModel;
}
//# sourceMappingURL=emigrateAsset.transaction.d.ts.map