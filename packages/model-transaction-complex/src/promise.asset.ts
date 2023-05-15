import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { Message, Field, Type } from "@bfchain/protobuf";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ArgumentFormatException, error, IllegalStateException } = CoreExceptionGenerator(
  "MODEL",
  "transactionModel",
);

const TRANSACTION_BUFFER_WM_KV = new WeakMap<Uint8Array, Transaction>();
const TRANSACTION_BUFFER_WM_VK = new WeakMap<Transaction, Uint8Array>();

/**
 * promise 交易 asset 模型
 *
 */
@Type.d("PromiseModel")
export class PromiseModel
  extends Message<PromiseModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.PromiseJSON>
{
  static INC = 1;

  /**交易 */
  @Field.d(PromiseModel.INC++, "bytes")
  transactionBuffer!: Uint8Array;
  get transaction() {
    const { transactionBuffer } = this;
    let trs = TRANSACTION_BUFFER_WM_KV.get(transactionBuffer);
    if (!trs) {
      trs = Transaction.decode(transactionBuffer);
      TRANSACTION_BUFFER_WM_VK.set(trs, transactionBuffer);
      TRANSACTION_BUFFER_WM_KV.set(transactionBuffer, trs);
    }
    return trs;
  }
  set transaction(trs: Transaction) {
    let buf = TRANSACTION_BUFFER_WM_VK.get(trs);
    if (!buf) {
      buf = trs.getBytes();
      TRANSACTION_BUFFER_WM_VK.set(trs, buf);
      TRANSACTION_BUFFER_WM_KV.set(buf, trs);
    }
    this.transactionBuffer = buf;
  }
  toJSON() {
    return {
      transaction: this.transaction.toJSON(),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<PromiseModel>,
  ) {
    const res = super.fromObject(object as any) as PromiseModel;
    if (res !== (object as unknown)) {
      if (object.transaction) {
        const obj_transaction = object.transaction;
        if (!(obj_transaction instanceof Message)) {
          const type = obj_transaction.type;
          if (type) {
            const base_type = TRANSACTION_TYPES_MAP.trsTypeToV(type);
            const ModelCtor = TRANSACTION_TYPES_MAP.VM.get(base_type);
            if (!ModelCtor) {
              throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, {
                type_base: base_type,
              });
            }
            res.transaction = ModelCtor.fromObject<Transaction>(obj_transaction);
          }
        } else {
          res.transaction = obj_transaction as Transaction;
        }
      }
    }
    return res as unknown as T;
  }
}

/**
 * promise 交易 asset 外层模型
 *
 */
@Type.d("PromiseAssetModel")
export class PromiseAssetModel
  extends Message<PromiseAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.PromiseAssetJSON>
{
  @Field.d(1, PromiseModel)
  promise!: PromiseModel;
  toJSON() {
    return {
      promise: this.promise.toJSON(),
    };
  }
}
