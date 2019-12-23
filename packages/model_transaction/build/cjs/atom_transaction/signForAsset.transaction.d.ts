import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignForAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * signForAsset 交易模型
 *
 */
export declare class SignForAssetTransaction extends Transaction<BFChainCore.SignForAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.SignForAssetAssetJSON, {
    hasRecipientId: true;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.SignForAssetAssetJSON, {
        hasRecipientId: true;
    }>;
    recipientId: string;
    asset: SignForAssetAssetModel;
}
//# sourceMappingURL=signForAsset.transaction.d.ts.map