import { Type, Field } from "@bfchain/protobuf";
import { IssueEntityAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueEntity 交易模型
 *
 */
@Type.d("IssueEntityTransaction")
export class IssueEntityTransaction
  extends AbstractTransaction<BFChainCore.IssueEntityAssetJSON>
  implements BFChainCore.IssueEntityTransactionJSON
{
  toJSON!: () => BFChainCore.IssueEntityTransactionJSON;
  recipientId!: string;
  @Field.d(IssueEntityTransaction.INC++, IssueEntityAssetModel)
  asset!: IssueEntityAssetModel;
}
