import { Message, Field, Type } from "@bfchain/protobuf";
import { TextInputModel } from "./textInput";

@Type.d("AddressInputModel")
export class AddressInputModel
  extends TextInputModel
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.AddressInputJSON> {}
