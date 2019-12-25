import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * beExchangeSpecialAsset 交易模型
 *
 */
@Type.d("BeExchangeSpecialAssetTransaction")
export class BeExchangeSpecialAssetTransaction
  extends Transaction<BFChainCore.BeExchangeSpecialAssetAssetJSON>
  implements BFChainCore.BeExchangeSpecialAssetTransactionJSON {
  toJSON!: () => BFChainCore.BeExchangeSpecialAssetTransactionJSON;
  recipientId!: string;
  @Field.d(BeExchangeSpecialAssetTransaction.INC++, BeExchangeSpecialAssetAssetModel)
  asset!: BeExchangeSpecialAssetAssetModel;
}
