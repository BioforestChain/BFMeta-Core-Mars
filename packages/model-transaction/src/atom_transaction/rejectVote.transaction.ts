import { Type, Field } from "@bfchain/protobuf";
import { RejectVoteAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * transfer 交易模型
 *
 */
@Type.d("RejectVoteTransaction")
export class RejectVoteTransaction
  extends AbstractTransaction<BFChainCore.RejectVoteAssetJSON>
  implements BFChainCore.RejectVoteTransactionJSON
{
  toJSON!: () => BFChainCore.RejectVoteTransactionJSON;
  recipientId!: undefined;
  @Field.d(RejectVoteTransaction.INC++, RejectVoteAssetModel)
  asset!: RejectVoteAssetModel;
}
