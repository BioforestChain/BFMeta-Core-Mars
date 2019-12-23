import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueAsset 交易模型
 *
 */
@Type.d("IssueAssetTransaction")
export class IssueAssetTransaction extends Transaction<BFChainCore.IssueAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.IssueAssetAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.IssueAssetAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(IssueAssetTransaction.INC++, IssueAssetAssetModel)
  asset!: IssueAssetAssetModel;
}
