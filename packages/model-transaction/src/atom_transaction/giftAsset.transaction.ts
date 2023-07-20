import { Type, Field } from "@bfchain/protobuf";
import { GiftAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * giftAsset 交易模型
 *
 */
@Type.d("GiftAssetTransaction")
export class GiftAssetTransaction
  extends AbstractTransaction<BFChainCore.GiftAssetAssetJSON>
  implements BFChainCore.GiftAssetTransactionJSON
{
  toJSON!: () => BFChainCore.GiftAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(GiftAssetTransaction.INC++, GiftAssetAssetModel)
  asset!: GiftAssetAssetModel;
}
