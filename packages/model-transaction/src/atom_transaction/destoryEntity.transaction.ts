import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestoryEntityAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * destoryEntity 交易模型
 *
 */
@Type.d("DestoryEntityTransaction")
export class DestoryEntityTransaction
  extends Transaction<BFChainCore.DestoryEntityAssetJSON>
  implements BFChainCore.DestoryEntityTransactionJSON
{
  toJSON!: () => BFChainCore.DestoryEntityTransactionJSON;
  recipientId!: string;
  @Field.d(DestoryEntityTransaction.INC++, DestoryEntityAssetModel)
  asset!: DestoryEntityAssetModel;
}
