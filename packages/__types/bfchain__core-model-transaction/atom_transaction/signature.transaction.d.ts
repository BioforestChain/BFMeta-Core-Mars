import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignatureAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class SignatureTransaction extends Transaction<BFChainCore.SignatureAssetJSON> implements BFChainCore.SignatureTransactionJSON {
    toJSON: () => BFChainCore.SignatureTransactionJSON;
    recipientId: undefined;
    asset: SignatureAssetModel;
}
