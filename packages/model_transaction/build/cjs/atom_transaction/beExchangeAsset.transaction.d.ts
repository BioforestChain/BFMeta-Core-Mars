import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * beExchangeAsset 交易模型
 *
 */
export declare class BeExchangeAssetTransaction extends Transaction<BFChainCore.BeExchangeAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.BeExchangeAssetAssetJSON, {
    hasRecipientId: true;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.BeExchangeAssetAssetJSON, {
        hasRecipientId: true;
    }>;
    recipientId: string;
    asset: BeExchangeAssetAssetModel;
}
//# sourceMappingURL=beExchangeAsset.transaction.d.ts.map