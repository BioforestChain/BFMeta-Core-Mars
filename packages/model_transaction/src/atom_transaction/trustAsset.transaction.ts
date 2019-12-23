import { Transaction } from "@bfchain/core-model-transaction-base";
import { TrustAssetAssetModel } from "@bfchain/core-model-transaction-asset/trustAsset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * trustAsset 交易模型
 *
 */
@Type.d("TrustAssetTransaction")
export class TrustAssetTransaction extends Transaction<BFChainCore.TrustAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.TrustAssetAssetJSON, { hasRecipientId: true }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.TrustAssetAssetJSON,
    { hasRecipientId: true }
  >;
  recipientId!: string;
  @Field.d(TrustAssetTransaction.INC++, TrustAssetAssetModel)
  asset!: TrustAssetAssetModel;
}
