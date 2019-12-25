import { Transaction } from "@bfchain/core-model-transaction-base";
import { GiftAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * giftAsset 交易模型
 *
 */
export declare class GiftAssetTransaction extends Transaction<BFChainCore.GiftAssetAssetJSON> implements BFChainCore.GiftAssetTransactionJSON {
    toJSON: () => BFChainCore.GiftAssetTransactionJSON;
    recipientId: undefined;
    asset: GiftAssetAssetModel;
}
//# sourceMappingURL=giftAsset.transaction.d.ts.map