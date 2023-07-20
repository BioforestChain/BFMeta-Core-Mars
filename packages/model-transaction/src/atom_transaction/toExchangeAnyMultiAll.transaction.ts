import { Type, Field } from "@bfchain/protobuf";
import { ToExchangeAnyMultiAllAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * toExchangeAnyMultiAll 交易模型
 *
 */
@Type.d("ToExchangeAnyMultiAllTransaction")
export class ToExchangeAnyMultiAllTransaction
  extends AbstractTransaction<BFChainCore.ToExchangeAnyMultiAllAssetJSON>
  implements BFChainCore.ToExchangeAnyMultiAllTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAnyMultiAllTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAnyMultiAllTransaction.INC++, ToExchangeAnyMultiAllAssetModel)
  asset!: ToExchangeAnyMultiAllAssetModel;
}
