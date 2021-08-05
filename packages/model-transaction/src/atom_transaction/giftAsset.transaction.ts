import { Transaction } from "@bfchain/core-model-transaction-base";
import { GiftAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * giftAsset 交易模型
 *
 */
@Type.d("GiftAssetTransaction")
export class GiftAssetTransaction
  extends Transaction<BFChainCore.GiftAssetAssetJSON>
  implements BFChainCore.GiftAssetTransactionJSON
{
  toJSON!: () => BFChainCore.GiftAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(GiftAssetTransaction.INC++, GiftAssetAssetModel)
  asset!: GiftAssetAssetModel;
}
