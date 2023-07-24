import { Type, Field } from "@bfchain/protobuf";
import { DestroyAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * destroyAsset 交易模型
 *
 */
@Type.d("DestroyAssetTransaction")
export class DestroyAssetTransaction
  extends AbstractTransaction<BFChainCore.DestroyAssetAssetJSON>
  implements BFChainCore.DestroyAssetTransactionJSON
{
  toJSON!: () => BFChainCore.DestroyAssetTransactionJSON;
  recipientId!: string;
  @Field.d(DestroyAssetTransaction.INC++, DestroyAssetAssetModel)
  asset!: DestroyAssetAssetModel;
}
