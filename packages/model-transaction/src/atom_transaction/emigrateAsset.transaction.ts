import { Transaction } from "@bfchain/core-model-transaction-base";
import { EmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * emigrateAsset 交易模型
 *
 */
@Type.d("EmigrateAssetTransaction")
export class EmigrateAssetTransaction
  extends Transaction<BFChainCore.EmigrateAssetAssetJSON>
  implements BFChainCore.EmigrateAssetTransactionJSON
{
  toJSON!: () => BFChainCore.EmigrateAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(EmigrateAssetTransaction.INC++, EmigrateAssetAssetModel)
  asset!: EmigrateAssetAssetModel;
}
