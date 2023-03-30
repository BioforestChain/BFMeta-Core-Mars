import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeAnyMultiAllAssetModel } from "@bfchain/core-model-transaction-asset";

/**
 * beExchangeAnyMultiAll 交易模型
 *
 */
@Type.d("BeExchangeAnyMultiAllTransaction")
export class BeExchangeAnyMultiAllTransaction
  extends Transaction<BFChainCore.BeExchangeAnyMultiAllAssetJSON>
  implements BFChainCore.BeExchangeAnyMultiAllTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAnyMultiAllTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAnyMultiAllTransaction.INC++, BeExchangeAnyMultiAllAssetModel)
  asset!: BeExchangeAnyMultiAllAssetModel;
}
