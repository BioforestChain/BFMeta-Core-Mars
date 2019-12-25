import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * exchangeSpecialAsset 交易模型
 *
 */
@Type.d("ToExchangeSpecialAssetTransaction")
export class ToExchangeSpecialAssetTransaction
  extends Transaction<BFChainCore.ToExchangeSpecialAssetAssetJSON>
  implements BFChainCore.ToExchangeSpecialAssetTransactionJSON {
  toJSON!: () => BFChainCore.ToExchangeSpecialAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeSpecialAssetTransaction.INC++, ToExchangeSpecialAssetAssetModel)
  asset!: ToExchangeSpecialAssetAssetModel;
}
