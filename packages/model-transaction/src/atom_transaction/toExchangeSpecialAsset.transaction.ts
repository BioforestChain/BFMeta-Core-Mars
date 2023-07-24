import { Type, Field } from "@bfchain/protobuf";
import { ToExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * exchangeSpecialAsset 交易模型
 *
 */
@Type.d("ToExchangeSpecialAssetTransaction")
export class ToExchangeSpecialAssetTransaction
  extends AbstractTransaction<BFChainCore.ToExchangeSpecialAssetAssetJSON>
  implements BFChainCore.ToExchangeSpecialAssetTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeSpecialAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeSpecialAssetTransaction.INC++, ToExchangeSpecialAssetAssetModel)
  asset!: ToExchangeSpecialAssetAssetModel;
}
