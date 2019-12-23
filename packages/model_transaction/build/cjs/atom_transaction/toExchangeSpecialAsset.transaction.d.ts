import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * exchangeSpecialAsset 交易模型
 *
 */
export declare class ToExchangeSpecialAssetTransaction extends Transaction<BFChainCore.ToExchangeSpecialAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: ToExchangeSpecialAssetAssetModel;
}
//# sourceMappingURL=toExchangeSpecialAsset.transaction.d.ts.map