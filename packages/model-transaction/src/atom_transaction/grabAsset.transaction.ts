import { Transaction } from "@bfchain/core-model-transaction-base";
import { GrabAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * grabAsset 交易模型
 *
 */
@Type.d("GrabAssetTransaction")
export class GrabAssetTransaction
  extends Transaction<BFChainCore.GrabAssetAssetJSON>
  implements BFChainCore.GrabAssetTransactionJSON
{
  toJSON!: () => BFChainCore.GrabAssetTransactionJSON;
  recipientId!: string;
  @Field.d(GrabAssetTransaction.INC++, GrabAssetAssetModel)
  asset!: GrabAssetAssetModel;
}
