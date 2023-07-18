import { Field, Type } from "@bfchain/protobuf";
import { FractionBigIntModel } from "@bfchain/core-model-common";
import { BaseInputModel } from "./_baseInput";
import { MACRO_INPUT_TYPE, MACRO_NUMBER_FORMAT } from "./constants";

@Type.d("NumberInputModel")
export class NumberInputModel<T extends MACRO_INPUT_TYPE = MACRO_INPUT_TYPE.NUMBER>
  extends BaseInputModel<T>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.NumberInputJSON<T>>
{
  @Field.d(NumberInputModel.INC++, FractionBigIntModel, "optional")
  min?: FractionBigIntModel;
  @Field.d(NumberInputModel.INC++, FractionBigIntModel, "optional")
  max?: FractionBigIntModel;
  @Field.d(NumberInputModel.INC++, FractionBigIntModel, "optional")
  step?: FractionBigIntModel;

  @Field.d(NumberInputModel.INC++, "string", "required", MACRO_NUMBER_FORMAT.LITERAL)
  format!: MACRO_NUMBER_FORMAT;

  toJSON() {
    const resp: BFChainCore.Macro.NumberInputJSON<T> = {
      ...super.toJSON(),
      format: this.format,
    };
    this.min && (resp.min = this.min.toJSON());
    this.max && (resp.max = this.max.toJSON());
    this.step && (resp.step = this.step.toJSON());
    return resp;
  }
}
