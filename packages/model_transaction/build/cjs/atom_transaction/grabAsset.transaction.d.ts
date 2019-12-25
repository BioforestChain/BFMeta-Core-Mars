import { Transaction } from "@bfchain/core-model-transaction-base";
import { GrabAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * grabAsset 交易模型
 *
 */
export declare class GrabAssetTransaction extends Transaction<BFChainCore.GrabAssetAssetJSON> implements BFChainCore.GrabAssetTransactionJSON {
    toJSON: () => BFChainCore.GrabAssetTransactionJSON;
    recipientId: string;
    asset: GrabAssetAssetModel;
}
//# sourceMappingURL=grabAsset.transaction.d.ts.map