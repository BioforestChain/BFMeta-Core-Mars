import { Transaction } from "@bfchain/core-model-transaction-base";
import { TrustAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * trustAsset 交易模型
 *
 */
@Type.d("TrustAssetTransaction")
export class TrustAssetTransaction extends Transaction<BFChainCore.TrustAssetAssetJSON>
  implements BFChainCore.TrustAssetTransactionJSON {
  toJSON!: () => BFChainCore.TrustAssetTransactionJSON;
  recipientId!: string;
  @Field.d(TrustAssetTransaction.INC++, TrustAssetAssetModel)
  asset!: TrustAssetAssetModel;
}
