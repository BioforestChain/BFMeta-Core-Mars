import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset/toExchangeAsset";
import { Type, Field, Message } from "@bfchain/protobuf";
import { cacheGetter } from "@bfchain/util-decorator";

/**
 * exchangeAsset 交易模型
 *
 */
@Type.d("ToExchangeAssetTransaction")
export class ToExchangeAssetTransaction extends Transaction<BFChainCore.ToExchangeAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<
      BFChainCore.ToExchangeAssetAssetJSON,
      { hasRecipientId: false }
    > {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.ToExchangeAssetAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(ToExchangeAssetTransaction.INC++, ToExchangeAssetAssetModel)
  asset!: ToExchangeAssetAssetModel;
}
