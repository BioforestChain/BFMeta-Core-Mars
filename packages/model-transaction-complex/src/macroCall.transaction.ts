import { Type, Field } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import { MacroCallAssetModel } from "./macroCall.asset";

/**
 * macro call 交易模型
 *
 */
@Type.d("MacroCallTransaction")
export class MacroCallTransaction extends Transaction<BFChainCore.MacroCallAssetJSON> {
  @Field.d(MacroCallTransaction.INC++, MacroCallAssetModel)
  asset!: MacroCallAssetModel;

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
    const { transaction } = this.asset.call;
    return transaction.as(TransactionCtor, subId);
  }

  get blobSize() {
    let totalSize = 0;
    const blobMap = this.blobMap.values();
    for (const items of blobMap) {
      totalSize += items[3];
    }
    totalSize += this.asset.call.transaction.blobSize;
    return totalSize;
  }
}
