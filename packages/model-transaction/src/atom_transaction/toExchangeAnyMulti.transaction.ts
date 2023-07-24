import { Type, Field } from "@bfchain/protobuf";
import { ToExchangeAnyMultiAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * exchangeAnyMulti 交易模型
 *
 */
@Type.d("ToExchangeAnyMultiTransaction")
export class ToExchangeAnyMultiTransaction
  extends AbstractTransaction<BFChainCore.ToExchangeAnyMultiAssetJSON>
  implements BFChainCore.ToExchangeAnyMultiTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAnyMultiTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAnyMultiTransaction.INC++, ToExchangeAnyMultiAssetModel)
  asset!: ToExchangeAnyMultiAssetModel;
}
