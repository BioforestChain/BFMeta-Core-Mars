import { Transaction } from "@bfchain/core-model-transaction-base";
import { MarkAssetModel } from "@bfchain/core-model-transaction-asset/mark";
import { Type, Field } from "@bfchain/protobuf";

/**
 * mark 交易模型
 *
 */
@Type.d("MarkTransaction")
export class MarkTransaction extends Transaction<BFChainCore.MarkAssetJSON>
  implements BFChainCore.TransactionMixJSON<BFChainCore.MarkAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.MarkAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(MarkTransaction.INC++, MarkAssetModel)
  asset!: MarkAssetModel;
}
