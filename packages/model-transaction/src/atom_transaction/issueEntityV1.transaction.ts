import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueEntityAssetV1Model } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueEntity 交易模型
 *
 */
@Type.d("IssueEntityTransactionV1")
export class IssueEntityTransactionV1
  extends Transaction<BFChainCore.IssueEntityAssetV1JSON>
  implements BFChainCore.IssueEntityTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityTransactionV1.INC++, IssueEntityAssetV1Model)
  asset!: IssueEntityAssetV1Model;
}
