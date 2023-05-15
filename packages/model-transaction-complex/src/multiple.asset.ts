import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { Message, Field, Type } from "@bfchain/protobuf";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ArgumentFormatException, error, IllegalStateException } = CoreExceptionGenerator(
  "MODEL",
  "transactionModel",
);

/**缓存trasList解析结果 */
const TRANSACTION_BUFFER_LIST_WM = new WeakMap<Uint8Array[], Transaction[]>();
const TRANSACTION_BUFFER_WM = new WeakMap<Transaction, Uint8Array>();

/**
 * multiple 交易 asset 模型
 *
 */
@Type.d("MultipleModel")
export class MultipleModel
  extends Message<MultipleModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MultipleJSON>
{
  static INC = 1;

  /**交易列表 */
  @Field.d(MultipleModel.INC++, "bytes", "repeated")
  transactionBufferList!: Uint8Array[];
  get transactions() {
    const { transactionBufferList } = this;
    let trsList = TRANSACTION_BUFFER_LIST_WM.get(transactionBufferList);
    if (!trsList) {
      trsList = this.transactionBufferList.map((buf) => {
        const baseTrs = Transaction.decode(buf);
        const base_type = TRANSACTION_TYPES_MAP.trsTypeToV(baseTrs.type);
        const ModelCtor = TRANSACTION_TYPES_MAP.VM.get(base_type);
        if (!ModelCtor) {
          throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, {
            type_base: base_type,
          });
        }
        const trs = ModelCtor.decode(buf);
        TRANSACTION_BUFFER_WM.set(trs, buf);
        return trs;
      });
    }
    return trsList;
  }
  set transactions(trsList: Transaction[]) {
    const bufList = trsList.map((trs) => {
      let buf = TRANSACTION_BUFFER_WM.get(trs);
      if (!buf) {
        buf = trs.getBytes();
        TRANSACTION_BUFFER_WM.set(trs, buf);
      }
      return buf;
    });
    TRANSACTION_BUFFER_LIST_WM.set(bufList, trsList);
    this.transactionBufferList = bufList;
  }
  toJSON() {
    return {
      transactions: this.transactions.map((transaction) => transaction.toJSON()),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<MultipleModel>,
  ) {
    const res = super.fromObject(object as any) as MultipleModel;
    if (res !== (object as unknown)) {
      if (object.transactions) {
        const transactions = object.transactions;
        const results: Transaction[] = [];
        for (const obj_transaction of transactions) {
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
              results.push(ModelCtor.fromObject<Transaction>(obj_transaction));
            }
          } else {
            results.push(obj_transaction as Transaction);
          }
        }
        res.transactions = results;
      }
    }
    return res as unknown as T;
  }
}

/**
 * multiple 交易 asset 外层模型
 *
 */
@Type.d("MultipleAssetModel")
export class MultipleAssetModel
  extends Message<MultipleAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MultipleAssetJSON>
{
  @Field.d(1, MultipleModel)
  multiple!: MultipleModel;
  toJSON() {
    return {
      multiple: this.multiple.toJSON(),
    };
  }
}
