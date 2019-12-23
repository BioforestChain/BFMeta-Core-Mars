import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppPurchasingAssetModel } from "@bfchain/core-model-transaction-asset/dappPurchasing";
import { Type, Field } from "@bfchain/protobuf";

/**
 * dappPurchasing 交易模型
 *
 */
@Type.d("DAppPurchasingTransaction")
export class DAppPurchasingTransaction extends Transaction<BFChainCore.DAppPurchasingAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.DAppPurchasingAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.DAppPurchasingAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(DAppPurchasingTransaction.INC++, DAppPurchasingAssetModel)
  asset!: DAppPurchasingAssetModel;
}
