import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeAnyMultiAssetModel } from "@bfchain/core-model-transaction-asset";

/**
 * beExchangeAnyMulti 交易模型
 *
 */
@Type.d("BeExchangeAnyMultiTransaction")
export class BeExchangeAnyMultiTransaction
  extends Transaction<BFChainCore.BeExchangeAnyMultiAssetJSON>
  implements BFChainCore.BeExchangeAnyMultiTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAnyMultiTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAnyMultiTransaction.INC++, BeExchangeAnyMultiAssetModel)
  asset!: BeExchangeAnyMultiAssetModel;
}
