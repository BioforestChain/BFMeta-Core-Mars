import { Transaction } from "@bfchain/core-model-transaction-base";
import { UsernameAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class UsernameTransaction extends Transaction<BFChainCore.UsernameAssetJSON> implements BFChainCore.UsernameTransactionJSON {
    toJSON: () => BFChainCore.UsernameTransactionJSON;
    recipientId: undefined;
    asset: UsernameAssetModel;
}
