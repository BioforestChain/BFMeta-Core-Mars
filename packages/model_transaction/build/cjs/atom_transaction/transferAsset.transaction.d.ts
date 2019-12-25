import { Transaction } from "@bfchain/core-model-transaction-base";
import { TransferAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * transferAsset 交易模型
 *
 */
export declare class TransferAssetTransaction extends Transaction<BFChainCore.TransferAssetAssetJSON> implements BFChainCore.TransferAssetTransactionJSON {
    toJSON: () => BFChainCore.TransferAssetTransactionJSON;
    recipientId: string;
    asset: TransferAssetAssetModel;
}
//# sourceMappingURL=transferAsset.transaction.d.ts.map