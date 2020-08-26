import { Message, Field, Type } from "@bfchain/protobuf";
/**
 * 比例模型
 */
@Type.d("RateModel")
export class RateModel
  extends Message<RateModel>
  implements BFChainUtil.JSONAble<BFChainCore.RateJSON<string>> {
  /**前部权重 */
  @Field.d(1, "string")
  prevWeight!: string;
  /**后部权重 */
  @Field.d(2, "string")
  nextWeight!: string;
  toJSON() {
    return {
      prevWeight: this.prevWeight,
      nextWeight: this.nextWeight,
    };
  }
}
