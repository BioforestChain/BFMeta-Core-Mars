import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueSubchainAssetModel } from "./issueSubchain.asset";
/**
 * issueSubchain 交易模型
 *
 */
export declare class IssueSubchainTransaction extends Transaction<BFChainCore.IssueSubchainAssetJSON> implements BFChainCore.IssueSubchainTransactionJSON {
    recipientId: undefined;
    asset: IssueSubchainAssetModel;
    toJSON: () => BFChainCore.TransactionMixJSON<BFChainCore.IssueSubchainAssetJSON, {
        hasRecipientId: false;
    }>;
}
//# sourceMappingURL=issueSubchain.transaction.d.ts.map