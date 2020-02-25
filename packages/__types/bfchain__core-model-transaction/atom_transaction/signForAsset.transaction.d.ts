import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignForAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class SignForAssetTransaction extends Transaction<BFChainCore.SignForAssetAssetJSON> implements BFChainCore.SignForAssetTransactionJSON {
    toJSON: () => BFChainCore.SignForAssetTransactionJSON;
    recipientId: string;
    asset: SignForAssetAssetModel;
}
