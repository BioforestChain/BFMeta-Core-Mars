import { Transaction } from "@bfchain/core-model-transaction-base";
import { RejectVoteAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * transfer 交易模型
 *
 */
export declare class RejectVoteTransaction extends Transaction<BFChainCore.RejectVoteAssetJSON> implements BFChainCore.RejectVoteTransactionJSON {
    toJSON: () => BFChainCore.RejectVoteTransactionJSON;
    recipientId: undefined;
    asset: RejectVoteAssetModel;
}
//# sourceMappingURL=rejectVote.transaction.d.ts.map