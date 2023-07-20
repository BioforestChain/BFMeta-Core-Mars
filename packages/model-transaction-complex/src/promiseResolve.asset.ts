import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { Message, Field, Type } from "@bfchain/protobuf";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";

const { ArgumentFormatException } = CoreExceptionGenerator("MODEL", "transactionModel");

/**
 * promiseResolve 交易 asset 模型
 *
 */
@Type.d("PromiseResolveModel")
export class PromiseResolveModel
  extends Message<PromiseResolveModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.PromiseResolveJSON>
{
  static INC = 1;

  /**要兑现的承诺交易签名 */
  @Field.d(PromiseResolveModel.INC++, "bytes")
  promiseIdBuffer!: Uint8Array;
  public get promiseId(): string {
    return getHexFromArrayBuffer(this.promiseIdBuffer);
  }
  public set promiseId(value: string) {
    this.promiseIdBuffer = parseHexToArrayBuffer(value);
  }
  /**交易 */
  @Field.d(PromiseResolveModel.INC++, "bytes")
  transactionBuffer!: Uint8Array;
  get transaction() {
    const { transactionBuffer: buf } = this;
    const baseTrs = Transaction.decode(buf);
    const base_type = TRANSACTION_TYPES_MAP.trsTypeToV(baseTrs.type);
    const ModelCtor = TRANSACTION_TYPES_MAP.VM.get(base_type);
    if (!ModelCtor) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, {
        type_base: base_type,
      });
    }
    return ModelCtor.decode(buf);
  }
  set transaction(trs: Transaction) {
    this.transactionBuffer = trs.getBytes();
  }
  toJSON() {
    return {
      promiseId: this.promiseId,
      transaction: this.transaction.toJSON(),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<PromiseResolveModel>,
  ) {
    const res = super.fromObject(object) as PromiseResolveModel;
    if (res !== object) {
      object.promiseId && (res.promiseId = object.promiseId);
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
 * promiseResolve 交易 asset 外层模型
 *
 */
@Type.d("PromiseResolveAssetModel")
export class PromiseResolveAssetModel
  extends Message<PromiseResolveAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.PromiseResolveAssetJSON>
{
  @Field.d(1, PromiseResolveModel)
  resolve!: PromiseResolveModel;
  toJSON() {
    return {
      resolve: this.resolve.toJSON(),
    };
  }
}
