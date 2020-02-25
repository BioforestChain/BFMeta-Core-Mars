import { Transaction } from "@bfchain/core-model-transaction-base";
import { VoteAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class VoteTransaction extends Transaction<BFChainCore.VoteAssetJSON> implements BFChainCore.VoteTransactionJSON {
    toJSON: () => BFChainCore.VoteTransactionJSON;
    recipientId: string;
    asset: VoteAssetModel;
}
