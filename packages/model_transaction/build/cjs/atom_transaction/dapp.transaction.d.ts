import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * dapp 交易模型
 *
 */
export declare class DAppTransaction extends Transaction<BFChainCore.DAppAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.DAppAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.DAppAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: DAppAssetModel;
}
//# sourceMappingURL=dapp.transaction.d.ts.map