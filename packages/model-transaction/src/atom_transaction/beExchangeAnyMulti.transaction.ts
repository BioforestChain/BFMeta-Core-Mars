import { Type, Field } from "@bfchain/protobuf";
import { BeExchangeAnyMultiAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * beExchangeAnyMulti 交易模型
 *
 */
@Type.d("BeExchangeAnyMultiTransaction")
export class BeExchangeAnyMultiTransaction
  extends AbstractTransaction<BFChainCore.BeExchangeAnyMultiAssetJSON>
  implements BFChainCore.BeExchangeAnyMultiTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAnyMultiTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAnyMultiTransaction.INC++, BeExchangeAnyMultiAssetModel)
  asset!: BeExchangeAnyMultiAssetModel;
}
