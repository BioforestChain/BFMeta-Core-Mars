import { Transaction } from "@bfchain/core-model-transaction-base";
import { MultipleAssetModel } from "./multiple.asset";
import { Type, Field } from "@bfchain/protobuf";
import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";

/**
 * multiple 交易模型
 *
 */
@Type.d("MultipleTransaction")
export class MultipleTransaction extends Transaction<BFChainCore.MultipleAssetJSON> {
  @Field.d(MultipleTransaction.INC++, MultipleAssetModel)
  asset!: MultipleAssetModel;

  as<T extends Transaction>(
    TransactionCtor: BFChainCore.TransactionModelConstructor<T>,
    subId?: string,
  ): T | undefined {
    const base_type = TRANSACTION_TYPES_MAP.MV.get(TransactionCtor as any);
    const baseType = TRANSACTION_TYPES_MAP.trsTypeToV(this.type);
    if (base_type === baseType) {
      if (subId) {
        if (this.signature === subId) {
          return this as any;
        }
      } else {
        return this as any;
      }
    }
    const { transactions } = this.asset.multiple;
    for (const transaction of transactions) {
      const resp = transaction.as(TransactionCtor, subId);
      if (resp) {
        return resp;
      }
    }
    return undefined;
  }

  get blobSize() {
    let totalSize = 0;
    const blobMap = this.blobMap.values();
    for (const items of blobMap) {
      totalSize += items[3];
    }
    const { transactions } = this.asset.multiple;
    for (const transaction of transactions) {
      totalSize += transaction.blobSize;
    }
    return totalSize;
  }
}
