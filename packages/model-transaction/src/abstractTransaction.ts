import { Type } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { TRANSACTION_TYPES_MAP } from "./constants";

/**
 * transfer 交易模型
 *
 */
@Type.d("AbstractTransaction")
export class AbstractTransaction<AJ extends object = object>
  extends Transaction<AJ>
  implements BFChainCore.TransactionJSON<AJ>
{
  as<T extends Transaction>(
    TransactionCtor: BFChainCore.TransactionModelConstructor<T>,
    subId?: string,
  ) {
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
    return undefined;
  }
}
