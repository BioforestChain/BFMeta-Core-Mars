import { Type, Field } from "@bfchain/protobuf";
import { MarkAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * mark 交易模型
 *
 */
@Type.d("MarkTransaction")
export class MarkTransaction
  extends AbstractTransaction<BFChainCore.MarkAssetJSON>
  implements BFChainCore.MarkTransactionJSON
{
  toJSON!: () => BFChainCore.MarkTransactionJSON;
  recipientId!: string;
  @Field.d(MarkTransaction.INC++, MarkAssetModel)
  asset!: MarkAssetModel;
}
