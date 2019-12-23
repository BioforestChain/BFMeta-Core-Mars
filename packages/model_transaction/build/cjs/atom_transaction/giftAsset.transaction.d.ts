import { Transaction } from "@bfchain/core-model-transaction-base";
import { GiftAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * giftAsset 交易模型
 *
 */
export declare class GiftAssetTransaction extends Transaction<BFChainCore.GiftAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.GiftAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.GiftAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: GiftAssetAssetModel;
}
//# sourceMappingURL=giftAsset.transaction.d.ts.map