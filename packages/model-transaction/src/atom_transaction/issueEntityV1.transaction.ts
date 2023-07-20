import { Type, Field } from "@bfchain/protobuf";
import { IssueEntityAssetV1Model } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueEntity 交易模型
 *
 */
@Type.d("IssueEntityTransactionV1")
export class IssueEntityTransactionV1
  extends AbstractTransaction<BFChainCore.IssueEntityAssetV1JSON>
  implements BFChainCore.IssueEntityTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityTransactionV1.INC++, IssueEntityAssetV1Model)
  asset!: IssueEntityAssetV1Model;
}
