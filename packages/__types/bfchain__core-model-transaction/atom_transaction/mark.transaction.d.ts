import { Transaction } from "@bfchain/core-model-transaction-base";
import { MarkAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class MarkTransaction extends Transaction<BFChainCore.MarkAssetJSON> implements BFChainCore.MarkTransactionJSON {
    toJSON: () => BFChainCore.MarkTransactionJSON;
    recipientId: string;
    asset: MarkAssetModel;
}
