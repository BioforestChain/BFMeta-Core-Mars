import { Transaction } from "@bfchain/core-model-transaction-base";
import { GrabAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * grabAny 交易模型
 *
 */
@Type.d("GrabAnyTransaction")
export class GrabAnyTransaction
  extends Transaction<BFChainCore.GrabAnyAssetJSON>
  implements BFChainCore.GrabAnyTransactionJSON
{
  toJSON!: () => BFChainCore.GrabAnyTransactionJSON;
  recipientId!: string;
  @Field.d(GrabAnyTransaction.INC++, GrabAnyAssetModel)
  asset!: GrabAnyAssetModel;
}
