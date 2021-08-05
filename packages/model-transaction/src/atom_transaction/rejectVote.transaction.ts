import { Transaction } from "@bfchain/core-model-transaction-base";
import { RejectVoteAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * transfer 交易模型
 *
 */
@Type.d("RejectVoteTransaction")
export class RejectVoteTransaction
  extends Transaction<BFChainCore.RejectVoteAssetJSON>
  implements BFChainCore.RejectVoteTransactionJSON
{
  toJSON!: () => BFChainCore.RejectVoteTransactionJSON;
  recipientId!: undefined;
  @Field.d(RejectVoteTransaction.INC++, RejectVoteAssetModel)
  asset!: RejectVoteAssetModel;
}
