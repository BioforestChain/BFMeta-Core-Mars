import { Transaction } from "@bfchain/core-model-transaction-base";
import { MarkAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * mark 交易模型
 *
 */
export declare class MarkTransaction extends Transaction<BFChainCore.MarkAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.MarkAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.MarkAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: MarkAssetModel;
}
//# sourceMappingURL=mark.transaction.d.ts.map