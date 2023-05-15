import { Message, Field, Type } from "@bfchain/protobuf";
import { MACRO_INPUT_TYPE } from "./constants";

@Type.d("BaseInputModel")
export class BaseInputModel
  extends Message<BaseInputModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.BaseInputJSON>
{
  static INC = 1;

  @Field.d(BaseInputModel.INC++, "string")
  type!: MACRO_INPUT_TYPE;
  @Field.d(BaseInputModel.INC++, "string")
  name!: string;
  @Field.d(BaseInputModel.INC++, "string")
  keyPath!: string;
  @Field.d(BaseInputModel.INC++, "string", "optional")
  pattern?: string;

  toJSON() {
    const resp: BFChainCore.Macro.BaseInputJSON = {
      type: this.type,
      name: this.name,
      keyPath: this.keyPath,
    };
    this.pattern && (resp.pattern = this.pattern);
    return resp;
  }
}
