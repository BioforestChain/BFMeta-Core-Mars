import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueEntityMultiAssetV1Model } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityMultiTransactionV1")
export class IssueEntityMultiTransactionV1
  extends Transaction<BFChainCore.IssueEntityMultiAssetV1JSON>
  implements BFChainCore.IssueEntityMultiTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityMultiTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityMultiTransactionV1.INC++, IssueEntityMultiAssetV1Model)
  asset!: IssueEntityMultiAssetV1Model;
}
