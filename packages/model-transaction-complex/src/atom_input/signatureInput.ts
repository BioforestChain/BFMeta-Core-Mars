import { Message, Field, Type } from "@bfchain/protobuf";
import { TextInputModel } from "./textInput";

@Type.d("SignatureInputModel")
export class SignatureInputModel
  extends TextInputModel
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.SignatureInputJSON> {}
