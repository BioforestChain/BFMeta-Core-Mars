import { Transaction } from "@bfchain/core-model-transaction-base";
import { GrabAssetAssetModel } from "@bfchain/core-model-transaction-asset/grabAsset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * grabAsset 交易模型
 *
 */
@Type.d("GrabAssetTransaction")
export class GrabAssetTransaction extends Transaction<BFChainCore.GrabAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.GrabAssetAssetJSON, { hasRecipientId: true }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.GrabAssetAssetJSON,
    { hasRecipientId: true }
  >;
  recipientId!: string;
  @Field.d(GrabAssetTransaction.INC++, GrabAssetAssetModel)
  asset!: GrabAssetAssetModel;
}
