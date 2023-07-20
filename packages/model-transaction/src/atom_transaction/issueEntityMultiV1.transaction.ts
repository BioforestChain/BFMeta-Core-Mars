import { Type, Field } from "@bfchain/protobuf";
import { IssueEntityMultiAssetV1Model } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueEntityFactory 交易模型
 *
 */
@Type.d("IssueEntityMultiTransactionV1")
export class IssueEntityMultiTransactionV1
  extends AbstractTransaction<BFChainCore.IssueEntityMultiAssetV1JSON>
  implements BFChainCore.IssueEntityMultiTransactionV1JSON
{
  toJSON!: () => BFChainCore.IssueEntityMultiTransactionV1JSON;
  recipientId!: string;
  @Field.d(IssueEntityMultiTransactionV1.INC++, IssueEntityMultiAssetV1Model)
  asset!: IssueEntityMultiAssetV1Model;
}
