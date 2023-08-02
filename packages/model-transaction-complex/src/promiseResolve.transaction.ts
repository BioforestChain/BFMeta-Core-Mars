import { Transaction } from "@bfchain/core-model-transaction-base";
import { PromiseResolveAssetModel } from "./promiseResolve.asset";
import { Type, Field } from "@bfchain/protobuf";
import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";

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
  as<T extends Transaction>(
    TransactionCtor: BFChainCore.TransactionModelConstructor<T>,
    subId?: string,
  ): T | undefined {
    const base_type = TRANSACTION_TYPES_MAP.MV.get(TransactionCtor as any);
    let baseType = TRANSACTION_TYPES_MAP.trsTypeToV(this.type);
    if (base_type === baseType) {
      if (subId) {
        if (this.signature === subId) {
          return this as any;
        }
      } else {
        return this as any;
      }
    }
    const { transaction } = this.asset.resolve;
    return transaction.as(TransactionCtor, subId);
  }

  getBlobSize(skipSubTransaction = false) {
    let totalSize = 0;
    const blobMap = this.blobMap.values();
    for (const items of blobMap) {
      totalSize += items[3];
    }
    if (skipSubTransaction === false) {
      totalSize += this.asset.resolve.transaction.getBlobSize(skipSubTransaction);
    }
    return totalSize;
  }
}
