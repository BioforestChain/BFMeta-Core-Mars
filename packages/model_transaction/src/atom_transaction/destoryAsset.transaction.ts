import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestoryAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * destoryAsset 交易模型
 *
 */
@Type.d("DestoryAssetTransaction")
export class DestoryAssetTransaction extends Transaction<BFChainCore.DestoryAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.DestoryAssetAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.DestoryAssetAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(DestoryAssetTransaction.INC++, DestoryAssetAssetModel)
  asset!: DestoryAssetAssetModel;
}
