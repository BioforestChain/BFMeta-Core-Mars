import { Transaction } from "@bfchain/core-model-transaction-base";
import { GiftAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * giftAny 交易模型
 *
 */
@Type.d("GiftAnyTransaction")
export class GiftAnyTransaction
  extends Transaction<BFChainCore.GiftAnyAssetJSON>
  implements BFChainCore.GiftAnyTransactionJSON
{
  toJSON!: () => BFChainCore.GiftAnyTransactionJSON;
  recipientId!: undefined;
  @Field.d(GiftAnyTransaction.INC++, GiftAnyAssetModel)
  asset!: GiftAnyAssetModel;
}
