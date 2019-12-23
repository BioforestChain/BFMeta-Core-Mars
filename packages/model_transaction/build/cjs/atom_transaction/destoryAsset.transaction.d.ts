import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestoryAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * destoryAsset 交易模型
 *
 */
export declare class DestoryAssetTransaction extends Transaction<BFChainCore.DestoryAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.DestoryAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.DestoryAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: DestoryAssetAssetModel;
}
//# sourceMappingURL=destoryAsset.transaction.d.ts.map