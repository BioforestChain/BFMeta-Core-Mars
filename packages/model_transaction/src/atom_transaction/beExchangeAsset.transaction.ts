import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * beExchangeAsset 交易模型
 *
 */
@Type.d("BeExchangeAssetTransaction")
export class BeExchangeAssetTransaction extends Transaction<BFChainCore.BeExchangeAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.BeExchangeAssetAssetJSON, { hasRecipientId: true }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.BeExchangeAssetAssetJSON,
    { hasRecipientId: true }
  >;
  recipientId!: string;
  @Field.d(BeExchangeAssetTransaction.INC++, BeExchangeAssetAssetModel)
  asset!: BeExchangeAssetAssetModel;
}
