import { Transaction } from "@bfchain/core-model-transaction-base";
import { MarkAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * mark 交易模型
 *
 */
@Type.d("MarkTransaction")
export class MarkTransaction extends Transaction<BFChainCore.MarkAssetJSON>
  implements BFChainCore.MarkTransactionJSON {
  toJSON!: () => BFChainCore.MarkTransactionJSON;
  recipientId!: string;
  @Field.d(MarkTransaction.INC++, MarkAssetModel)
  asset!: MarkAssetModel;
}
