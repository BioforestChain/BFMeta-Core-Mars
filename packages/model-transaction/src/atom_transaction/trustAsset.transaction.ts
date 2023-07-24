import { Type, Field } from "@bfchain/protobuf";
import { TrustAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * trustAsset 交易模型
 *
 */
@Type.d("TrustAssetTransaction")
export class TrustAssetTransaction
  extends AbstractTransaction<BFChainCore.TrustAssetAssetJSON>
  implements BFChainCore.TrustAssetTransactionJSON
{
  toJSON!: () => BFChainCore.TrustAssetTransactionJSON;
  recipientId!: string;
  @Field.d(TrustAssetTransaction.INC++, TrustAssetAssetModel)
  asset!: TrustAssetAssetModel;
}
