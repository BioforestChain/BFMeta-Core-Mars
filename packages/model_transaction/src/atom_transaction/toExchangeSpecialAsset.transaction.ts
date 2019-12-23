import { Transaction } from "@bfchain/core-model-transaction-base";
import { ToExchangeSpecialAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * exchangeSpecialAsset 交易模型
 *
 */
@Type.d("ToExchangeSpecialAssetTransaction")
export class ToExchangeSpecialAssetTransaction
  extends Transaction<BFChainCore.ToExchangeSpecialAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON,
      { hasRecipientId: false }
    > {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.ToExchangeSpecialAssetAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(ToExchangeSpecialAssetTransaction.INC++, ToExchangeSpecialAssetAssetModel)
  asset!: ToExchangeSpecialAssetAssetModel;
}
