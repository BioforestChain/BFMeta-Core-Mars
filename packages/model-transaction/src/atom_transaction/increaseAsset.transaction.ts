import { Type, Field } from "@bfchain/protobuf";
import { IncreaseAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * increaseAsset 交易模型
 *
 */
@Type.d("IncreaseAssetTransaction")
export class IncreaseAssetTransaction
  extends AbstractTransaction<BFChainCore.IncreaseAssetAssetJSON>
  implements BFChainCore.IncreaseAssetTransactionJSON
{
  toJSON!: () => BFChainCore.IncreaseAssetTransactionJSON;
  recipientId!: string;
  @Field.d(IncreaseAssetTransaction.INC++, IncreaseAssetAssetModel)
  asset!: IncreaseAssetAssetModel;
}
