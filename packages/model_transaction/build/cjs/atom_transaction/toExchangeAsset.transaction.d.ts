import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * exchangeAsset 交易模型
 *
 */
export declare class ToExchangeAssetTransaction extends Transaction<BFChainCore.ToExchangeAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: ToExchangeAssetAssetModel;
}
//# sourceMappingURL=toExchangeAsset.transaction.d.ts.map