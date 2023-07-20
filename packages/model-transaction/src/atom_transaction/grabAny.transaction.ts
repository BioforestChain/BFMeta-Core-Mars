import { Type, Field } from "@bfchain/protobuf";
import { GrabAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * grabAny 交易模型
 *
 */
@Type.d("GrabAnyTransaction")
export class GrabAnyTransaction
  extends AbstractTransaction<BFChainCore.GrabAnyAssetJSON>
  implements BFChainCore.GrabAnyTransactionJSON
{
  toJSON!: () => BFChainCore.GrabAnyTransactionJSON;
  recipientId!: string;
  @Field.d(GrabAnyTransaction.INC++, GrabAnyAssetModel)
  asset!: GrabAnyAssetModel;
}
