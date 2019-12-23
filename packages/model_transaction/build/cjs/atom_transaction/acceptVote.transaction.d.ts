import { Transaction } from "@bfchain/core-model-transaction-base";
import { AcceptVoteAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * transfer 交易模型
 *
 */
export declare class AcceptVoteTransaction extends Transaction<BFChainCore.AcceptVoteAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.AcceptVoteAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.AcceptVoteAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: AcceptVoteAssetModel;
}
//# sourceMappingURL=acceptVote.transaction.d.ts.map