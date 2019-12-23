import { Transaction } from "@bfchain/core-model-transaction-base";
import { ImmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * immigrateAsset 交易模型
 *
 */
export declare class ImmigrateAssetTransaction extends Transaction<BFChainCore.ImmigrateAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.ImmigrateAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.ImmigrateAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: ImmigrateAssetAssetModel;
}
//# sourceMappingURL=immigrateAsset.transaction.d.ts.map