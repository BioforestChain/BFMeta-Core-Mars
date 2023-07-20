import { Type, Field } from "@bfchain/protobuf";
import { GiftAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * giftAny 交易模型
 *
 */
@Type.d("GiftAnyTransaction")
export class GiftAnyTransaction
  extends AbstractTransaction<BFChainCore.GiftAnyAssetJSON>
  implements BFChainCore.GiftAnyTransactionJSON
{
  toJSON!: () => BFChainCore.GiftAnyTransactionJSON;
  recipientId!: undefined;
  @Field.d(GiftAnyTransaction.INC++, GiftAnyAssetModel)
  asset!: GiftAnyAssetModel;
}
