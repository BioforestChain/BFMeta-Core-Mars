import { Transaction } from "@bfchain/core-model-transaction-base";
import { TransferAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class TransferAssetTransaction extends Transaction<BFChainCore.TransferAssetAssetJSON> implements BFChainCore.TransferAssetTransactionJSON {
    toJSON: () => BFChainCore.TransferAssetTransactionJSON;
    recipientId: string;
    asset: TransferAssetAssetModel;
}
