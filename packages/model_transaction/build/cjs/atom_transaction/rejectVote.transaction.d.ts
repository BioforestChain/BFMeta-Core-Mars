import { Transaction } from "@bfchain/core-model-transaction-base";
import { RejectVoteAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * transfer 交易模型
 *
 */
export declare class RejectVoteTransaction extends Transaction<BFChainCore.RejectVoteAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.RejectVoteAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.RejectVoteAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: RejectVoteAssetModel;
}
//# sourceMappingURL=rejectVote.transaction.d.ts.map