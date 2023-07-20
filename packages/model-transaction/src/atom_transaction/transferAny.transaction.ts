import { Type, Field } from "@bfchain/protobuf";
import { TransferAnyAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * transferAny 交易模型
 *
 */
@Type.d("TransferAnyTransaction")
export class TransferAnyTransaction
  extends AbstractTransaction<BFChainCore.TransferAnyAssetJSON>
  implements BFChainCore.TransferAnyTransactionJSON
{
  toJSON!: () => BFChainCore.TransferAnyTransactionJSON;
  recipientId!: string;
  @Field.d(TransferAnyTransaction.INC++, TransferAnyAssetModel)
  asset!: TransferAnyAssetModel;
}
