import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestroyAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * destroyAsset 交易模型
 *
 */
@Type.d("DestroyAssetTransaction")
export class DestroyAssetTransaction
  extends Transaction<BFChainCore.DestroyAssetAssetJSON>
  implements BFChainCore.DestroyAssetTransactionJSON
{
  toJSON!: () => BFChainCore.DestroyAssetTransactionJSON;
  recipientId!: string;
  @Field.d(DestroyAssetTransaction.INC++, DestroyAssetAssetModel)
  asset!: DestroyAssetAssetModel;
}
