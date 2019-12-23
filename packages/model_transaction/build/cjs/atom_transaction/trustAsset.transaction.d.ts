import { Transaction } from "@bfchain/core-model-transaction-base";
import { TrustAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * trustAsset 交易模型
 *
 */
export declare class TrustAssetTransaction extends Transaction<BFChainCore.TrustAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.TrustAssetAssetJSON, {
    hasRecipientId: true;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.TrustAssetAssetJSON, {
        hasRecipientId: true;
    }>;
    recipientId: string;
    asset: TrustAssetAssetModel;
}
//# sourceMappingURL=trustAsset.transaction.d.ts.map