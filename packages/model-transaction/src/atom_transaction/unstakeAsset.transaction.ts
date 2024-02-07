import { Type, Field } from "@bfchain/protobuf";
import { UnstakeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * unstakeAsset 交易模型
 *
 */
@Type.d("UnstakeAssetTransaction")
export class UnstakeAssetTransaction
  extends AbstractTransaction<BFChainCore.UnstakeAssetAssetJSON>
  implements BFChainCore.UnstakeAssetTransactionJSON
{
  toJSON!: () => BFChainCore.UnstakeAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(UnstakeAssetTransaction.INC++, UnstakeAssetAssetModel)
  asset!: UnstakeAssetAssetModel;
}
