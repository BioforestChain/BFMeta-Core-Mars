import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class DAppTransaction extends Transaction<BFChainCore.DAppAssetJSON> implements BFChainCore.DAppTransactionJSON {
    toJSON: () => BFChainCore.DAppTransactionJSON;
    recipientId: undefined;
    asset: DAppAssetModel;
}
