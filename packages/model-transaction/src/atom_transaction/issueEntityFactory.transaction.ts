import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueEntityFactoryAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityFactoryTransaction")
export class IssueEntityFactoryTransaction
  extends Transaction<BFChainCore.IssueEntityFactoryAssetJSON>
  implements BFChainCore.IssueEntityFactoryTransactionJSON
{
  toJSON!: () => BFChainCore.IssueEntityFactoryTransactionJSON;
  recipientId!: string;
  @Field.d(IssueEntityFactoryTransaction.INC++, IssueEntityFactoryAssetModel)
  asset!: IssueEntityFactoryAssetModel;
}
