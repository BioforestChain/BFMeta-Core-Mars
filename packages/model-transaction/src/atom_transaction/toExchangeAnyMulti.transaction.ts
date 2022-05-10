import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAnyMultiAssetModel } from "@bfchain/core-model-transaction-asset";

/**
 * exchangeAnyMulti 交易模型
 *
 */
@Type.d("ToExchangeAnyMultiTransaction")
export class ToExchangeAnyMultiTransaction
  extends Transaction<BFChainCore.ToExchangeAnyMultiAssetJSON>
  implements BFChainCore.ToExchangeAnyMultiTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAnyMultiTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAnyMultiTransaction.INC++, ToExchangeAnyMultiAssetModel)
  asset!: ToExchangeAnyMultiAssetModel;
}
