import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field, Message } from "@bfchain/protobuf";
import { cacheGetter } from "@bfchain/util-decorator";

/**
 * exchangeAsset 交易模型
 *
 */
@Type.d("ToExchangeAssetTransaction")
export class ToExchangeAssetTransaction
  extends Transaction<BFChainCore.ToExchangeAssetAssetJSON>
  implements BFChainCore.ToExchangeAssetTransactionJSON {
  toJSON!: () => BFChainCore.ToExchangeAssetTransactionJSON;
  recipientId!: undefined;
  @Field.d(ToExchangeAssetTransaction.INC++, ToExchangeAssetAssetModel)
  asset!: ToExchangeAssetAssetModel;
}
