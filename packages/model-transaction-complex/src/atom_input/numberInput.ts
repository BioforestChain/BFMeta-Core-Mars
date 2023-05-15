import { Message, Field, Type } from "@bfchain/protobuf";
import { FractionBigIntModel } from "@bfchain/core-model-common";
import { BaseInputModel } from "./_baseInput";

@Type.d("NumberInputModel")
export class NumberInputModel
  extends BaseInputModel
  implements BFChainCore.AssetJSONToModelType<BFChainCore.Macro.NumberInputJSON>
{
  @Field.d(NumberInputModel.INC++, FractionBigIntModel, "optional")
  min?: FractionBigIntModel;
  @Field.d(NumberInputModel.INC++, FractionBigIntModel, "optional")
  max?: FractionBigIntModel;
  @Field.d(NumberInputModel.INC++, FractionBigIntModel, "optional")
  step?: FractionBigIntModel;

  toJSON() {
    const resp: BFChainCore.Macro.NumberInputJSON = super.toJSON();
    this.min !== undefined && (resp.min = this.min.toJSON());
    this.max !== undefined && (resp.max = this.max.toJSON());
    this.step !== undefined && (resp.step = this.step.toJSON());
    return resp;
  }
}
