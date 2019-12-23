import { Transaction } from "@bfchain/core-model-transaction-base";
import { LocationNameAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * locationName 交易模型
 *
 */
export declare class LocationNameTransaction extends Transaction<BFChainCore.LocationNameAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.LocationNameAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.LocationNameAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: LocationNameAssetModel;
}
//# sourceMappingURL=locationName.transaction.d.ts.map