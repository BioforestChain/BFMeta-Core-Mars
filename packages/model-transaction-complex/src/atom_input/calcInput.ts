import { Message, Field, Type } from "@bfchain/protobuf";
import { NumberInputModel } from "./numberInput";
import * as calc from "@bnqkl/calc";

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
  // /**
  //  * 编译成 js 函数
  //  */
  // @cacheGetter
  // private _calc() {
  //   new calc.Parser(this.calc)
  // }
  /**
   * 执行函数，获得输出
   * @param params
   */
  evaluate(params: calc.$Scope) {
    return calc.evaluate(this.calc, params);
  }
}
