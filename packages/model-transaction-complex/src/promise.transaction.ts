import { Transaction } from "@bfchain/core-model-transaction-base";
import { PromiseAssetModel } from "./promise.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * promise 交易模型
 *
 */
@Type.d("PromiseTransaction")
export class PromiseTransaction
  extends Transaction<BFChainCore.PromiseAssetJSON>
  implements BFChainCore.PromiseTransactionJSON
{
  recipientId!: string;
  @Field.d(PromiseTransaction.INC++, PromiseAssetModel)
  asset!: PromiseAssetModel;
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.PromiseAssetJSON,
    { hasRecipientId: true }
  >;
}
