import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueAssetAssetModel } from "@bfchain/core-model-transaction-asset";
/**
 * issueAsset 交易模型
 *
 */
export declare class IssueAssetTransaction extends Transaction<BFChainCore.IssueAssetAssetJSON> implements BFChainCore.TransactionMixJSON<BFChainCore.IssueAssetAssetJSON, {
    hasRecipientId: false;
}> {
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.IssueAssetAssetJSON, {
        hasRecipientId: false;
    }>;
    recipientId: undefined;
    asset: IssueAssetAssetModel;
}
//# sourceMappingURL=issueAsset.transaction.d.ts.map