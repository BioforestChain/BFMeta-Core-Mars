import { Transaction } from "@bfchain/core-model-transaction-base";
import { VoteAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * vote 交易模型
 *
 */
export declare class VoteTransaction extends Transaction<BFChainCore.VoteAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.VoteAssetJSON, {
    hasRecipientId: true;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.VoteAssetJSON, {
        hasRecipientId: true;
    }>;
    recipientId: string;
    asset: VoteAssetModel;
}
//# sourceMappingURL=vote.transaction.d.ts.map