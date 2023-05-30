import { Transaction } from "@bfchain/core-model-transaction-base";
import { TransferAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * transferAny 交易模型
 *
 */
@Type.d("TransferAnyTransaction")
export class TransferAnyTransaction
  extends Transaction<BFChainCore.TransferAnyAssetJSON>
  implements BFChainCore.TransferAnyTransactionJSON
{
  toJSON!: () => BFChainCore.TransferAnyTransactionJSON;
  recipientId!: string;
  @Field.d(TransferAnyTransaction.INC++, TransferAnyAssetModel)
  asset!: TransferAnyAssetModel;
}
