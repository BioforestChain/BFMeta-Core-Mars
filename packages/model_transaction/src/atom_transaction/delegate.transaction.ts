import { Transaction } from "@bfchain/core-model-transaction-base";
import { DelegateAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * delegate 交易模型
 *
 */
@Type.d("DelegateTransaction")
export class DelegateTransaction extends Transaction<BFChainCore.DelegateAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.DelegateAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.DelegateAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(DelegateTransaction.INC++, DelegateAssetModel)
  asset!: DelegateAssetModel;
}
