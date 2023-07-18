import type { MACRO_INPUT_TYPE } from "./constants";
import { Type } from "@bfchain/protobuf";
import { TextInputModel } from "./textInput";

@Type.d("PublicKeyInputModel")
export class PublicKeyInputModel
  extends TextInputModel<MACRO_INPUT_TYPE.PUBLICKEY>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.PublicKeyInputJSON> {}
