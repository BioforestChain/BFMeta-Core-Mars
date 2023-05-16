import { Message, Field, Type } from "@bfchain/protobuf";
import { NumberInputModel } from "./numberInput";
import * as calc from "@bnqkl/calc";
import type { MACRO_INPUT_TYPE } from "./constants";

@Type.d("CalcInputModel")
export class CalcInputModel
  extends NumberInputModel<MACRO_INPUT_TYPE.CALC>
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
  /**
   * 执行函数，获得输出
   * @param params
   */
  evaluate(params: calc.$Scope) {
    return calc.evaluate(this.calc, params);
  }
}
