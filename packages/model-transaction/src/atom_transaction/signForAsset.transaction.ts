import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignForAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * signForAsset 交易模型
 *
 */
@Type.d("SignForAssetTransaction")
export class SignForAssetTransaction
  extends Transaction<BFChainCore.SignForAssetAssetJSON>
  implements BFChainCore.SignForAssetTransactionJSON {
  toJSON!: () => BFChainCore.SignForAssetTransactionJSON;
  recipientId!: string;
  @Field.d(SignForAssetTransaction.INC++, SignForAssetAssetModel)
  asset!: SignForAssetAssetModel;
}
