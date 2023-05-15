import { Transaction } from "@bfchain/core-model-transaction-base";
import { PromiseResolveAssetModel } from "./promiseResolve.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * promiseResolve 交易模型
 *
 */
@Type.d("PromiseResolveTransaction")
export class PromiseResolveTransaction
  extends Transaction<BFChainCore.PromiseResolveAssetJSON>
  implements BFChainCore.PromiseResolveTransactionJSON
{
  recipientId!: string;
  @Field.d(PromiseResolveTransaction.INC++, PromiseResolveAssetModel)
  asset!: PromiseResolveAssetModel;
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.PromiseResolveAssetJSON,
    { hasRecipientId: true }
  >;
}
