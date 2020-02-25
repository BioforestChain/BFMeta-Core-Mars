import { Transaction } from "@bfchain/core-model-transaction-base";
import { LocationNameAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class LocationNameTransaction extends Transaction<BFChainCore.LocationNameAssetJSON> implements BFChainCore.LocationNameTransactionJSON {
    toJSON: () => BFChainCore.LocationNameTransactionJSON;
    recipientId: undefined;
    asset: LocationNameAssetModel;
}
