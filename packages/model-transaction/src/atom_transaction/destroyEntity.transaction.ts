import { Type, Field } from "@bfchain/protobuf";
import { DestroyEntityAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * destroyEntity 交易模型
 *
 */
@Type.d("DestroyEntityTransaction")
export class DestroyEntityTransaction
  extends AbstractTransaction<BFChainCore.DestroyEntityAssetJSON>
  implements BFChainCore.DestroyEntityTransactionJSON
{
  toJSON!: () => BFChainCore.DestroyEntityTransactionJSON;
  recipientId!: string;
  @Field.d(DestroyEntityTransaction.INC++, DestroyEntityAssetModel)
  asset!: DestroyEntityAssetModel;
}
