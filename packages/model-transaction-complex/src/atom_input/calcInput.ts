import { Message, Field, Type } from "@bfchain/protobuf";
import { NumberInputModel } from "./numberInput";
import * as calc from "@bnqkl/calc";
import { MACRO_CALC_PRECISION, MACRO_INPUT_TYPE } from "./constants";

@Type.d("CalcInputModel")
export class CalcInputModel
  extends NumberInputModel<MACRO_INPUT_TYPE.CALC>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.CalcInputJSON>
{
  @Field.d(CalcInputModel.INC++, "string")
  calc!: string;
  @Field.d(CalcInputModel.INC++, "string")
  precision!: MACRO_CALC_PRECISION;
  toJSON() {
    const resp: BFChainCore.Macro.CalcInputJSON = {
      ...super.toJSON(),
      calc: this.calc,
      precision: this.precision,
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
