import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class IssueAssetTransaction extends Transaction<BFChainCore.IssueAssetAssetJSON> implements BFChainCore.IssueAssetTransactionJSON {
    toJSON: () => BFChainCore.IssueAssetTransactionJSON;
    recipientId: string;
    asset: IssueAssetAssetModel;
}
