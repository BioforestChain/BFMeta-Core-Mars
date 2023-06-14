import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestroyEntityAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * destroyEntity 交易模型
 *
 */
@Type.d("DestroyEntityTransaction")
export class DestroyEntityTransaction
  extends Transaction<BFChainCore.DestroyEntityAssetJSON>
  implements BFChainCore.DestroyEntityTransactionJSON
{
  toJSON!: () => BFChainCore.DestroyEntityTransactionJSON;
  recipientId!: string;
  @Field.d(DestroyEntityTransaction.INC++, DestroyEntityAssetModel)
  asset!: DestroyEntityAssetModel;
}
