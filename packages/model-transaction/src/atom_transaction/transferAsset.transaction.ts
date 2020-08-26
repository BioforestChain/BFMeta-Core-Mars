import { Transaction } from "@bfchain/core-model-transaction-base";
import { TransferAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * transferAsset 交易模型
 *
 */
@Type.d("TransferAssetTransaction")
export class TransferAssetTransaction
  extends Transaction<BFChainCore.TransferAssetAssetJSON>
  implements BFChainCore.TransferAssetTransactionJSON {
  toJSON!: () => BFChainCore.TransferAssetTransactionJSON;
  recipientId!: string;
  @Field.d(TransferAssetTransaction.INC++, TransferAssetAssetModel)
  asset!: TransferAssetAssetModel;
}
