import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAnyAssetModel } from "@bfchain/core-model-transaction-asset";

/**
 * exchangeAny 交易模型
 *
 */
@Type.d("ToExchangeAnyTransaction")
export class ToExchangeAnyTransaction
  extends Transaction<BFChainCore.ToExchangeAnyAssetJSON>
  implements BFChainCore.ToExchangeAnyTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAnyTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAnyTransaction.INC++, ToExchangeAnyAssetModel)
  asset!: ToExchangeAnyAssetModel;
}
