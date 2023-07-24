import { Type, Field } from "@bfchain/protobuf";
import { BeExchangeAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * beExchangeAny 交易模型
 *
 */
@Type.d("BeExchangeAnyTransaction")
export class BeExchangeAnyTransaction
  extends AbstractTransaction<BFChainCore.BeExchangeAnyAssetJSON>
  implements BFChainCore.BeExchangeAnyTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAnyTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAnyTransaction.INC++, BeExchangeAnyAssetModel)
  asset!: BeExchangeAnyAssetModel;
}
