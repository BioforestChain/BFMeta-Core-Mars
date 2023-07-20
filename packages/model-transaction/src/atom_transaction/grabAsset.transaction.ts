import { Type, Field } from "@bfchain/protobuf";
import { GrabAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * grabAsset 交易模型
 *
 */
@Type.d("GrabAssetTransaction")
export class GrabAssetTransaction
  extends AbstractTransaction<BFChainCore.GrabAssetAssetJSON>
  implements BFChainCore.GrabAssetTransactionJSON
{
  toJSON!: () => BFChainCore.GrabAssetTransactionJSON;
  recipientId!: string;
  @Field.d(GrabAssetTransaction.INC++, GrabAssetAssetModel)
  asset!: GrabAssetAssetModel;
}
