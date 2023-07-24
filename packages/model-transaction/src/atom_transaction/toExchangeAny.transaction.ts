import { Type, Field } from "@bfchain/protobuf";
import { ToExchangeAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * exchangeAny 交易模型
 *
 */
@Type.d("ToExchangeAnyTransaction")
export class ToExchangeAnyTransaction
  extends AbstractTransaction<BFChainCore.ToExchangeAnyAssetJSON>
  implements BFChainCore.ToExchangeAnyTransactionJSON
{
  toJSON!: () => BFChainCore.ToExchangeAnyTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAnyTransaction.INC++, ToExchangeAnyAssetModel)
  asset!: ToExchangeAnyAssetModel;
}
