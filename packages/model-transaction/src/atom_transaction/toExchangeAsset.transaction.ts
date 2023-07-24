import { Type, Field } from "@bfchain/protobuf";
import { ToExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * exchangeAsset 交易模型
 *
 */
@Type.d("ToExchangeAssetTransaction")
export class ToExchangeAssetTransaction
  extends AbstractTransaction<BFChainCore.ToExchangeAssetAssetJSON>
  implements BFChainCore.ToExchangeAssetTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAssetTransaction.INC++, ToExchangeAssetAssetModel)
  asset!: ToExchangeAssetAssetModel;
}
