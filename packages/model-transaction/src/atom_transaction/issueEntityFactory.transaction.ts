import { Type, Field } from "@bfchain/protobuf";
import { IssueEntityFactoryAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityFactoryTransaction")
export class IssueEntityFactoryTransaction
  extends AbstractTransaction<BFChainCore.IssueEntityFactoryAssetJSON>
  implements BFChainCore.IssueEntityFactoryTransactionJSON
{
  toJSON!: () => BFChainCore.IssueEntityFactoryTransactionJSON;
  recipientId!: string;
  @Field.d(IssueEntityFactoryTransaction.INC++, IssueEntityFactoryAssetModel)
  asset!: IssueEntityFactoryAssetModel;
}
