import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsManagerAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * setLnsManager 交易模型
 *
 */
export declare class SetLnsManagerTransaction extends Transaction<BFChainCore.SetLnsManagerAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.SetLnsManagerAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.SetLnsManagerAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: SetLnsManagerAssetModel;
}
//# sourceMappingURL=setLnsManager.transaction.d.ts.map