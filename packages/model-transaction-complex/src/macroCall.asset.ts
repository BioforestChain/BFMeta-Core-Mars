import { getHexFromArrayBuffer, parseHexToArrayBuffer, EasyWeakMap } from "@bfchain/util";
import { Message, Field, MapField, Type } from "@bfchain/protobuf";
import { StringKeyMap } from "@bfchain/core-model-common";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";

const { ArgumentFormatException } = CoreExceptionGenerator("MODEL", "transactionModel");

const CallInputsMapWM = new EasyWeakMap((call: MacroCallModel) => new StringKeyMap(call.inputs));

/**
 * macroCall 交易 asset 模型
 *
 */
@Type.d("MacroCallModel")
export class MacroCallModel
  extends Message<MacroCallModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MacroCallJSON>
{
  static INC = 1;

  /**要兑现的承诺交易签名 */
  @Field.d(MacroCallModel.INC++, "bytes")
  macroIdBuffer!: Uint8Array;
  public get macroId(): string {
    return getHexFromArrayBuffer(this.macroIdBuffer);
  }
  public set macroId(value: string) {
    this.macroIdBuffer = parseHexToArrayBuffer(value);
  }
  @MapField.d(MacroCallModel.INC++, "string", "string")
  inputs!: BFChainCore.MacroCallInputs;
  get inputMap() {
    const inputMap = CallInputsMapWM.forceGet(this);
    return inputMap;
  }
  /**交易 */
  @Field.d(MacroCallModel.INC++, "bytes")
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
      macroId: this.macroId,
      inputs: this.inputs,
      transaction: this.transaction.toJSON(),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<MacroCallModel>,
  ) {
    const res = super.fromObject(object) as MacroCallModel;
    if (res !== object) {
      object.macroId && (res.macroId = object.macroId);
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
 * MacroCall 交易 asset 外层模型
 *
 */
@Type.d("MacroCallAssetModel")
export class MacroCallAssetModel
  extends Message<MacroCallAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MacroCallAssetJSON>
{
  @Field.d(1, MacroCallModel)
  call!: MacroCallModel;
  toJSON() {
    return {
      call: this.call.toJSON(),
    };
  }
}
