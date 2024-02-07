import { Type, Field } from "@bfchain/protobuf";
import { StakeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * stakeAsset 交易模型
 *
 */
@Type.d("StakeAssetTransaction")
export class StakeAssetTransaction
  extends AbstractTransaction<BFChainCore.StakeAssetAssetJSON>
  implements BFChainCore.StakeAssetTransactionJSON
{
  toJSON!: () => BFChainCore.StakeAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(StakeAssetTransaction.INC++, StakeAssetAssetModel)
  asset!: StakeAssetAssetModel;
}
