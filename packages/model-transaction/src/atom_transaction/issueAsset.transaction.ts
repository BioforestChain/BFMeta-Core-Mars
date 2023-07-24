import { Type, Field } from "@bfchain/protobuf";
import { IssueAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueAsset 交易模型
 *
 */
@Type.d("IssueAssetTransaction")
export class IssueAssetTransaction
  extends AbstractTransaction<BFChainCore.IssueAssetAssetJSON>
  implements BFChainCore.IssueAssetTransactionJSON
{
  toJSON!: () => BFChainCore.IssueAssetTransactionJSON;
  recipientId!: string;
  @Field.d(IssueAssetTransaction.INC++, IssueAssetAssetModel)
  asset!: IssueAssetAssetModel;
}
