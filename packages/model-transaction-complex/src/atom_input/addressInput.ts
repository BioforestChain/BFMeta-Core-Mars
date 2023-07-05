import { Message, Field, Type } from "@bfchain/protobuf";
import type { MACRO_INPUT_TYPE } from "./constants";
import { TextInputModel } from "./textInput";

@Type.d("AddressInputModel")
export class AddressInputModel
  extends TextInputModel<MACRO_INPUT_TYPE.ADDRESS>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.AddressInputJSON> {}
