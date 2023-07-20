import { Type, Field } from "@bfchain/protobuf";
import { ImmigrateAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * immigrateAsset 交易模型
 *
 */
@Type.d("ImmigrateAssetTransaction")
export class ImmigrateAssetTransaction
  extends AbstractTransaction<BFChainCore.ImmigrateAssetAssetJSON>
  implements BFChainCore.ImmigrateAssetTransactionJSON
{
  toJSON!: () => BFChainCore.ImmigrateAssetTransactionJSON;
  recipientId!: string;
  @Field.d(ImmigrateAssetTransaction.INC++, ImmigrateAssetAssetModel)
  asset!: ImmigrateAssetAssetModel;
}
