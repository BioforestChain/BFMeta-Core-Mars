import { Transaction } from "@bfchain/core-model-transaction-base";
import { AcceptVoteAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * transfer 交易模型
 *
 */
@Type.d("AcceptVoteTransaction")
export class AcceptVoteTransaction
  extends Transaction<BFChainCore.AcceptVoteAssetJSON>
  implements BFChainCore.AcceptVoteTransactionJSON
{
  toJSON!: () => BFChainCore.AcceptVoteTransactionJSON;
  recipientId!: undefined;
  @Field.d(AcceptVoteTransaction.INC++, AcceptVoteAssetModel)
  asset!: AcceptVoteAssetModel;
}
