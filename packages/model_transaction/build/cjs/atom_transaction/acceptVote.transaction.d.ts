import { Transaction } from "@bfchain/core-model-transaction-base";
import { AcceptVoteAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * transfer 交易模型
 *
 */
export declare class AcceptVoteTransaction extends Transaction<BFChainCore.AcceptVoteAssetJSON> implements BFChainCore.AcceptVoteTransactionJSON {
    toJSON: () => BFChainCore.AcceptVoteTransactionJSON;
    recipientId: undefined;
    asset: AcceptVoteAssetModel;
}
//# sourceMappingURL=acceptVote.transaction.d.ts.map