import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueEntityFactoryAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityFactoryTransactionV1")
export class IssueEntityFactoryTransactionV1
  extends Transaction<BFChainCore.IssueEntityFactoryAssetJSON>
  implements BFChainCore.IssueEntityFactoryTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityFactoryTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityFactoryTransactionV1.INC++, IssueEntityFactoryAssetModel)
  asset!: IssueEntityFactoryAssetModel;
}
