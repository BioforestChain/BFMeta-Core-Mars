import { Transaction } from "@bfchain/core-model-transaction-base";
import { DelegateAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class DelegateTransaction extends Transaction<BFChainCore.DelegateAssetJSON> implements BFChainCore.DelegateTransactionJSON {
    toJSON: () => BFChainCore.DelegateTransactionJSON;
    recipientId: undefined;
    asset: DelegateAssetModel;
}
