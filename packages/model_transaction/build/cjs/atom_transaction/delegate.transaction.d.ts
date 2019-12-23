import { Transaction } from "@bfchain/core-model-transaction-base";
import { DelegateAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * delegate 交易模型
 *
 */
export declare class DelegateTransaction extends Transaction<BFChainCore.DelegateAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.DelegateAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.DelegateAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: DelegateAssetModel;
}
//# sourceMappingURL=delegate.transaction.d.ts.map