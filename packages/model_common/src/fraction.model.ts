import { Message, Type, Field } from "@bfchain/protobuf";
@Type.d("Fraction")
export class Fraction extends Message<Fraction>
  implements BFChainUtil.JSONAble<BFChainCore.FractionJSON> {
  /**分子 */
  @Field.d(1, "int32")
  numerator!: number;
  @Field.d(2, "int32")
  denominator!: number;
  toJSON() {
    return {
      numerator: this.numerator,
      denominator: this.denominator,
    };
  }
}
@Type.d("FractionBigIntModel")
export class FractionBigIntModel extends Message<FractionBigIntModel>
  implements BFChainUtil.JSONAble<BFChainCore.FractionJSON<string>> {
  /**分子 */
  @Field.d(1, "string")
  numerator!: string;
  @Field.d(2, "string")
  denominator!: string;
  toJSON() {
    return {
      numerator: this.numerator,
      denominator: this.denominator,
    };
  }
}
