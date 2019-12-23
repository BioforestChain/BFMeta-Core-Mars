import { Transaction } from "@bfchain/core-model-transaction-base";
import { EmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * emigrateAsset 交易模型
 *
 */
export declare class EmigrateAssetTransaction extends Transaction<BFChainCore.EmigrateAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.EmigrateAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.EmigrateAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: EmigrateAssetAssetModel;
}
//# sourceMappingURL=emigrateAsset.transaction.d.ts.map