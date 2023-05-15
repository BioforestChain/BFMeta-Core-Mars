import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { Message, Field, MapField, Type } from "@bfchain/protobuf";
import { EasyWeakMap } from "@bfchain/util-extends-map";
import { StringKeyMap } from "@bfchain/core-model-common";

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
  inputs!: { [key: string]: string };
  get inputMap() {
    const inputMap = CallInputsMapWM.forceGet(this);
    return inputMap;
  }
  toJSON() {
    return {
      macroId: this.macroId,
      inputs: this.inputs,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<MacroCallModel>,
  ) {
    const res = super.fromObject(object) as MacroCallModel;
    if (res !== object) {
      object.macroId && (res.macroId = object.macroId);
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
