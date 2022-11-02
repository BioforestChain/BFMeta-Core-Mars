import { Message, Field, Type } from "@bfchain/protobuf";

@Type.d("CountAndAmountStatisticModel")
export class CountAndAmountStatisticModel
  extends Message<CountAndAmountStatisticModel>
  implements BFChainCore.JSONToModelType<BFChainCore.CountAndAmountStatisticJSON>
{
  static INC = 1;

  @Field.d(CountAndAmountStatisticModel.INC++, "string", "required", "0")
  changeAmount!: string;
  @Field.d(CountAndAmountStatisticModel.INC++, "uint32", "required", 0)
  changeCount!: number;

  @Field.d(CountAndAmountStatisticModel.INC++, "string", "required", "0")
  moveAmount!: string;

  @Field.d(CountAndAmountStatisticModel.INC++, "uint32", "required", 0)
  transactionCount!: number;
  toJSON() {
    return {
      changeAmount: this.changeAmount,
      changeCount: this.changeCount,
      moveAmount: this.moveAmount,
      transactionCount: this.transactionCount,
    };
  }
}
