import { Type, Field } from "@bfchain/protobuf";
import { BeExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * beExchangeAsset 交易模型
 *
 */
@Type.d("BeExchangeAssetTransaction")
export class BeExchangeAssetTransaction
  extends AbstractTransaction<BFChainCore.BeExchangeAssetAssetJSON>
  implements BFChainCore.BeExchangeAssetTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeAssetTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeAssetTransaction.INC++, BeExchangeAssetAssetModel)
  asset!: BeExchangeAssetAssetModel;
}
