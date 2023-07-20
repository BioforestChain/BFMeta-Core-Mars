import { Type, Field } from "@bfchain/protobuf";
import { VoteAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * vote 交易模型
 *
 */
@Type.d("VoteTransaction")
export class VoteTransaction
  extends AbstractTransaction<BFChainCore.VoteAssetJSON>
  implements BFChainCore.VoteTransactionJSON
{
  toJSON!: () => BFChainCore.VoteTransactionJSON;
  recipientId!: string;
  @Field.d(VoteTransaction.INC++, VoteAssetModel)
  asset!: VoteAssetModel;
}
