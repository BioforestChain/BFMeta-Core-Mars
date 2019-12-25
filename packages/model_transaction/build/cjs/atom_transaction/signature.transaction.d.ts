import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignatureAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * signature 交易模型
 *
 */
export declare class SignatureTransaction extends Transaction<BFChainCore.SignatureAssetJSON> implements BFChainCore.SignatureTransactionJSON {
    toJSON: () => BFChainCore.SignatureTransactionJSON;
    recipientId: undefined;
    asset: SignatureAssetModel;
}
//# sourceMappingURL=signature.transaction.d.ts.map