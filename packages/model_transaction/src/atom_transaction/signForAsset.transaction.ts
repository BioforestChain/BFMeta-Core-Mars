import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignForAssetAssetModel } from "@bfchain/core-model-transaction-asset/signForAsset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * signForAsset 交易模型
 *
 */
@Type.d("SignForAssetTransaction")
export class SignForAssetTransaction extends Transaction<BFChainCore.SignForAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.SignForAssetAssetJSON, { hasRecipientId: true }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.SignForAssetAssetJSON,
    { hasRecipientId: true }
  >;
  recipientId!: string;
  @Field.d(SignForAssetTransaction.INC++, SignForAssetAssetModel)
  asset!: SignForAssetAssetModel;
}
