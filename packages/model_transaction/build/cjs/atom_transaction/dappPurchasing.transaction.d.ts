import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppPurchasingAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * dappPurchasing 交易模型
 *
 */
export declare class DAppPurchasingTransaction extends Transaction<BFChainCore.DAppPurchasingAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.DAppPurchasingAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.DAppPurchasingAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: DAppPurchasingAssetModel;
}
//# sourceMappingURL=dappPurchasing.transaction.d.ts.map