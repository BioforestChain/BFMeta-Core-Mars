import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeAnyAssetModel } from "@bfchain/core-model-transaction-asset";

/**
 * beExchangeAny 交易模型
 *
 */
@Type.d("BeExchangeAnyTransaction")
export class BeExchangeAnyTransaction
  extends Transaction<BFChainCore.BeExchangeAnyAssetJSON>
  implements BFChainCore.BeExchangeAnyTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAnyTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAnyTransaction.INC++, BeExchangeAnyAssetModel)
  asset!: BeExchangeAnyAssetModel;
}
