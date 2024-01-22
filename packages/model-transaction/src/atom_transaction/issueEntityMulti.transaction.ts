import { Type, Field } from "@bfchain/protobuf";
import { IssueEntityMultiAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityMultiTransaction")
export class IssueEntityMultiTransaction
  extends AbstractTransaction<BFChainCore.IssueEntityMultiAssetJSON>
  implements BFChainCore.IssueEntityMultiTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityMultiTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityMultiTransaction.INC++, IssueEntityMultiAssetModel)
  asset!: IssueEntityMultiAssetModel;
}
