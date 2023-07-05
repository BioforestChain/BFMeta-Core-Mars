import { Message, Field, Type } from "@bfchain/protobuf";
import type { MACRO_INPUT_TYPE } from "./constants";
import { BaseInputModel } from "./_baseInput";

@Type.d("TextInputModel")
export class TextInputModel<T extends MACRO_INPUT_TYPE = MACRO_INPUT_TYPE.TEXT>
  extends BaseInputModel<T>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.TextInputJSON<T>> {}
