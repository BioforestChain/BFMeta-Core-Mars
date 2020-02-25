import { Transaction } from "@bfchain/core-model-transaction-base";
import { AcceptVoteAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class AcceptVoteTransaction extends Transaction<BFChainCore.AcceptVoteAssetJSON> implements BFChainCore.AcceptVoteTransactionJSON {
    toJSON: () => BFChainCore.AcceptVoteTransactionJSON;
    recipientId: undefined;
    asset: AcceptVoteAssetModel;
}
