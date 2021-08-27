import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueEntityAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueEntity 交易模型
 *
 */
@Type.d("IssueEntityTransaction")
export class IssueEntityTransaction
  extends Transaction<BFChainCore.IssueEntityAssetJSON>
  implements BFChainCore.IssueEntityTransactionJSON
{
  toJSON!: () => BFChainCore.IssueEntityTransactionJSON;
  recipientId!: string;
  @Field.d(IssueEntityTransaction.INC++, IssueEntityAssetModel)
  asset!: IssueEntityAssetModel;
}
