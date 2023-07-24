import { Type, Field } from "@bfchain/protobuf";
import { AcceptVoteAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * transfer 交易模型
 *
 */
@Type.d("AcceptVoteTransaction")
export class AcceptVoteTransaction
  extends AbstractTransaction<BFChainCore.AcceptVoteAssetJSON>
  implements BFChainCore.AcceptVoteTransactionJSON
{
  toJSON!: () => BFChainCore.AcceptVoteTransactionJSON;
  recipientId!: undefined;
  @Field.d(AcceptVoteTransaction.INC++, AcceptVoteAssetModel)
  asset!: AcceptVoteAssetModel;
}
