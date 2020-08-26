import { Transaction } from "@bfchain/core-model-transaction-base";
import { VoteAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * vote 交易模型
 *
 */
@Type.d("VoteTransaction")
export class VoteTransaction
  extends Transaction<BFChainCore.VoteAssetJSON>
  implements BFChainCore.VoteTransactionJSON {
  toJSON!: () => BFChainCore.VoteTransactionJSON;
  recipientId!: string;
  @Field.d(VoteTransaction.INC++, VoteAssetModel)
  asset!: VoteAssetModel;
}
