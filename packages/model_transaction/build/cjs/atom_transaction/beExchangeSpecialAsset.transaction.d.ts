import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * beExchangeSpecialAsset 交易模型
 *
 */
export declare class BeExchangeSpecialAssetTransaction extends Transaction<BFChainCore.BeExchangeSpecialAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.BeExchangeSpecialAssetAssetJSON, {
    hasRecipientId: true;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.BeExchangeSpecialAssetAssetJSON, {
        hasRecipientId: true;
    }>;
    recipientId: string;
    asset: BeExchangeSpecialAssetAssetModel;
}
//# sourceMappingURL=beExchangeSpecialAsset.transaction.d.ts.map