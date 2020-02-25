import { Transaction } from "@bfchain/core-model-transaction-base";
import { RejectVoteAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class RejectVoteTransaction extends Transaction<BFChainCore.RejectVoteAssetJSON> implements BFChainCore.RejectVoteTransactionJSON {
    toJSON: () => BFChainCore.RejectVoteTransactionJSON;
    recipientId: undefined;
    asset: RejectVoteAssetModel;
}
