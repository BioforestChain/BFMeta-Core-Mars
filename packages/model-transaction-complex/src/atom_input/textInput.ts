import { Message, Field, Type } from "@bfchain/protobuf";
import { BaseInputModel } from "./_baseInput";

@Type.d("TextInputModel")
export class TextInputModel
  extends BaseInputModel
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.TextInputJSON> {}
