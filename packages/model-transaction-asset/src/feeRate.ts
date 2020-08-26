import { Message, Field, Type } from "@bfchain/protobuf";
import { Fraction } from "@bfchain/core-model-common";

/**
 * FeeRateModel 模型
 *
 */
@Type.d("FeeRateModel")
export class FeeRateModel
  extends Message<FeeRateModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.FeeRateJSON> {
  /**区块时间间隔 */
  @Field.d(1, Fraction)
  senderPaidFeeRate!: Fraction;
  @Field.d(2, Fraction)
  recipientPaidFeeRate!: Fraction;
  toJSON() {
    return {
      senderPaidFeeRate: this.senderPaidFeeRate.toJSON(),
      recipientPaidFeeRate: this.recipientPaidFeeRate.toJSON(),
    };
  }
}
