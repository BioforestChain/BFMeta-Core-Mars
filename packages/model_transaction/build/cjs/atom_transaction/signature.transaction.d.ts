import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignatureAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * signature 交易模型
 *
 */
export declare class SignatureTransaction extends Transaction<BFChainCore.SignatureAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.SignatureAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.SignatureAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: SignatureAssetModel;
}
//# sourceMappingURL=signature.transaction.d.ts.map