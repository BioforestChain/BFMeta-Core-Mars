import { Transaction } from "@bfchain/core-model-transaction-base";
import { ImmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * immigrateAsset 交易模型
 *
 */
@Type.d("ImmigrateAssetTransaction")
export class ImmigrateAssetTransaction extends Transaction<BFChainCore.ImmigrateAssetAssetJSON>
  implements BFChainCore.ImmigrateAssetTransactionJSON {
  toJSON!: () => BFChainCore.ImmigrateAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(ImmigrateAssetTransaction.INC++, ImmigrateAssetAssetModel)
  asset!: ImmigrateAssetAssetModel;
}
