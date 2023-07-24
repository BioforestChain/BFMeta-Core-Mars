import { Type, Field } from "@bfchain/protobuf";
import { SignForAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * signForAsset 交易模型
 *
 */
@Type.d("SignForAssetTransaction")
export class SignForAssetTransaction
  extends AbstractTransaction<BFChainCore.SignForAssetAssetJSON>
  implements BFChainCore.SignForAssetTransactionJSON
{
  toJSON!: () => BFChainCore.SignForAssetTransactionJSON;
  recipientId!: string;
  @Field.d(SignForAssetTransaction.INC++, SignForAssetAssetModel)
  asset!: SignForAssetAssetModel;
}
