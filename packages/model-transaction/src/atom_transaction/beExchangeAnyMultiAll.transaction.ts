import { Type, Field } from "@bfchain/protobuf";
import { BeExchangeAnyMultiAllAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * beExchangeAnyMultiAll 交易模型
 *
 */
@Type.d("BeExchangeAnyMultiAllTransaction")
export class BeExchangeAnyMultiAllTransaction
  extends AbstractTransaction<BFChainCore.BeExchangeAnyMultiAllAssetJSON>
  implements BFChainCore.BeExchangeAnyMultiAllTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAnyMultiAllTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAnyMultiAllTransaction.INC++, BeExchangeAnyMultiAllAssetModel)
  asset!: BeExchangeAnyMultiAllAssetModel;
}
