import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAnyMultiAllAssetModel } from "@bfchain/core-model-transaction-asset";

/**
 * toExchangeAnyMultiAll 交易模型
 *
 */
@Type.d("ToExchangeAnyMultiAllTransaction")
export class ToExchangeAnyMultiAllTransaction
  extends Transaction<BFChainCore.ToExchangeAnyMultiAllAssetJSON>
  implements BFChainCore.ToExchangeAnyMultiAllTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAnyMultiAllTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAnyMultiAllTransaction.INC++, ToExchangeAnyMultiAllAssetModel)
  asset!: ToExchangeAnyMultiAllAssetModel;
}
