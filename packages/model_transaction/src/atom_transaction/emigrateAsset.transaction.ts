import { Transaction } from "@bfchain/core-model-transaction-base";
import { EmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset/emigrateAsset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * emigrateAsset 交易模型
 *
 */
@Type.d("EmigrateAssetTransaction")
export class EmigrateAssetTransaction extends Transaction<BFChainCore.EmigrateAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.EmigrateAssetAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.EmigrateAssetAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(EmigrateAssetTransaction.INC++, EmigrateAssetAssetModel)
  asset!: EmigrateAssetAssetModel;
}
