import { Type, Field } from "@bfchain/protobuf";
import { TransferAssetAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * transferAsset 交易模型
 *
 */
@Type.d("TransferAssetTransaction")
export class TransferAssetTransaction
  extends AbstractTransaction<BFChainCore.TransferAssetAssetJSON>
  implements BFChainCore.TransferAssetTransactionJSON
{
  toJSON!: () => BFChainCore.TransferAssetTransactionJSON;
  recipientId!: string;
  @Field.d(TransferAssetTransaction.INC++, TransferAssetAssetModel)
  asset!: TransferAssetAssetModel;
}
