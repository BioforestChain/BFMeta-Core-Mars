import type { MACRO_INPUT_TYPE } from "./constants";
import { Message, Field, Type } from "@bfchain/protobuf";

@Type.d("BaseInputModel")
export class BaseInputModel<T extends MACRO_INPUT_TYPE>
  extends Message<BaseInputModel<T>>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.BaseInputJSON<T>>
{
  static INC = 1;

  @Field.d(BaseInputModel.INC++, "string")
  type!: T;
  @Field.d(BaseInputModel.INC++, "string")
  name!: string;
  @Field.d(BaseInputModel.INC++, "string")
  keyPath!: string;
  @Field.d(BaseInputModel.INC++, "string", "optional")
  pattern?: string;
  @Field.d(BaseInputModel.INC++, "bool", "optional")
  repeat?: boolean;

  toJSON() {
    const resp: BFChainCore.Macro.BaseInputJSON<T> = {
      type: this.type,
      name: this.name,
      keyPath: this.keyPath,
    };
    this.pattern && (resp.pattern = this.pattern);
    this.repeat !== undefined && (resp.repeat = this.repeat);
    return resp;
  }
}
