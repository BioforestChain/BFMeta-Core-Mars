import { Type, Field } from "@bfchain/protobuf";
import { EmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * emigrateAsset 交易模型
 *
 */
@Type.d("EmigrateAssetTransaction")
export class EmigrateAssetTransaction
  extends AbstractTransaction<BFChainCore.EmigrateAssetAssetJSON>
  implements BFChainCore.EmigrateAssetTransactionJSON
{
  toJSON!: () => BFChainCore.EmigrateAssetTransactionJSON;
  recipientId!: string;
  @Field.d(EmigrateAssetTransaction.INC++, EmigrateAssetAssetModel)
  asset!: EmigrateAssetAssetModel;
}
