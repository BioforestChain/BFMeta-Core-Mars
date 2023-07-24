import { Type, Field } from "@bfchain/protobuf";
import { IssueEntityFactoryAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityFactoryTransactionV1")
export class IssueEntityFactoryTransactionV1
  extends AbstractTransaction<BFChainCore.IssueEntityFactoryAssetJSON>
  implements BFChainCore.IssueEntityFactoryTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityFactoryTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityFactoryTransactionV1.INC++, IssueEntityFactoryAssetModel)
  asset!: IssueEntityFactoryAssetModel;
}
