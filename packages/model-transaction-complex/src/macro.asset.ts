import { Message, Field, Type } from "@bfchain/protobuf";
import { BaseInputModel, MACRO_INPUT_TYPES_MAP } from "./atom_input";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";

const { ArgumentFormatException, error, IllegalStateException } = CoreExceptionGenerator(
  "MODEL",
  "transactionModel",
);

/**
 * macro 交易 asset 模型
 *
 */
@Type.d("MacroModel")
export class MacroModel
  extends Message<MacroModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MacroJSON>
{
  static INC = 1;

  @Field.d(MacroModel.INC++, "bytes", "repeated")
  inputBufferList!: Uint8Array[];
  get inputs() {
    return this.inputBufferList.map((buf) => {
      const baseInput = BaseInputModel.decode(buf);
      const ModelCtor = MACRO_INPUT_TYPES_MAP.VM.get(baseInput.type);
      if (!ModelCtor) {
        throw new ArgumentFormatException(ERROR_LIST.INVALID_MACRO_INPUT_TYPE, {
          type_base: baseInput.type,
        });
      }
      const input = ModelCtor.decode(buf);
      return input;
    });
  }
  set inputs(inputList: BaseInputModel[]) {
    const inputBufferList = inputList.map((input) => {
      return input.getBytes();
    });
    this.inputBufferList = inputBufferList;
  }
  /**交易 */
  @Field.d(MacroModel.INC++, "bytes")
  templateBuffer!: Uint8Array;
  get template() {
    const { templateBuffer: buf } = this;
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
  set template(trs: Transaction) {
    this.templateBuffer = trs.getBytes();
  }

  toJSON() {
    const resp: BFChainCore.MacroJSON = {
      inputs: this.inputs.map((input) => input.toJSON()),
      template: this.template.toJSON(),
    };
    return resp;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<MacroModel>,
  ) {
    const res = super.fromObject(object) as MacroModel;
    if (res !== object) {
      if (object.inputs) {
        const obj_inputs = object.inputs;
        const results: BaseInputModel[] = [];
        for (const obj_input of obj_inputs) {
          if (obj_input instanceof Message) {
            results.push(obj_input as BaseInputModel);
          } else {
            const type = obj_input.type as BFChainCore.Macro.MACRO_INPUT_TYPE;
            const ModelCtor = MACRO_INPUT_TYPES_MAP.VM.get(type);
            if (!ModelCtor) {
              throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, {
                type_base: type,
              });
            }
            results.push(ModelCtor.fromObject<BaseInputModel>(obj_input));
          }
        }
        res.inputs = results;
      }
      if (object.template) {
        const obj_transaction = object.template;
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
            res.template = ModelCtor.fromObject<Transaction>(obj_transaction);
          }
        } else {
          res.template = obj_transaction as Transaction;
        }
      }
    }
    return res as unknown as T;
  }
}

/**
 * macro 交易 asset 外层模型
 *
 */
@Type.d("MacroAssetModel")
export class MacroAssetModel
  extends Message<MacroAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MacroAssetJSON>
{
  @Field.d(1, MacroModel)
  macro!: MacroModel;
  toJSON() {
    return {
      macro: this.macro.toJSON(),
    };
  }
}
