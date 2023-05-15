import { Message, Field, Type } from "@bfchain/protobuf";
import { NumberInputModel } from "./numberInput";

@Type.d("CalcInputModel")
export class CalcInputModel
  extends NumberInputModel
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.CalcInputJSON>
{
  @Field.d(CalcInputModel.INC++, "string")
  calc!: string;
  toJSON() {
    const resp: BFChainCore.Macro.CalcInputJSON = {
      ...super.toJSON(),
      calc: this.calc,
    };
    return resp;
  }
}
