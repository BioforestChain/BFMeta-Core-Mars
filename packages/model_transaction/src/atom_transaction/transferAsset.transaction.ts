import { Transaction } from "@bfchain/core-model-transaction-base";
import { TransferAssetAssetModel } from "@bfchain/core-model-transaction-asset/transferAsset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * transferAsset 交易模型
 *
 */
@Type.d("TransferAssetTransaction")
export class TransferAssetTransaction extends Transaction<BFChainCore.TransferAssetAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.TransferAssetAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.TransferAssetAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(TransferAssetTransaction.INC++, TransferAssetAssetModel)
  asset!: TransferAssetAssetModel;
}
