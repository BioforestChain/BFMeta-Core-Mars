import { Type, Field } from "@bfchain/protobuf";
import { BeExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * beExchangeSpecialAsset 交易模型
 *
 */
@Type.d("BeExchangeSpecialAssetTransaction")
export class BeExchangeSpecialAssetTransaction
  extends AbstractTransaction<BFChainCore.BeExchangeSpecialAssetAssetJSON>
  implements BFChainCore.BeExchangeSpecialAssetTransactionJSON
{
  toJSON!: () => BFChainCore.BeExchangeSpecialAssetTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeSpecialAssetTransaction.INC++, BeExchangeSpecialAssetAssetModel)
  asset!: BeExchangeSpecialAssetAssetModel;
}
