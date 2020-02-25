import { Transaction } from "@bfchain/core-model-transaction-base";
import { TrustAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class TrustAssetTransaction extends Transaction<BFChainCore.TrustAssetAssetJSON> implements BFChainCore.TrustAssetTransactionJSON {
    toJSON: () => BFChainCore.TrustAssetTransactionJSON;
    recipientId: string;
    asset: TrustAssetAssetModel;
}
