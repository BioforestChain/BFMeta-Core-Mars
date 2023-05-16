import { Message, Field, Type } from "@bfchain/protobuf";
import type { MACRO_INPUT_TYPE } from "./constants";
import { TextInputModel } from "./textInput";

@Type.d("SignatureInputModel")
export class SignatureInputModel
  extends TextInputModel<MACRO_INPUT_TYPE.SIGNATURE>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.SignatureInputJSON> {}
