import "./@types";
import { Message, Type, Field } from "@bfchain/protobuf";

/**范围模型 */
@Type.d("Range")
export class RangeModel extends Message<RangeModel>
  implements BFChainUtil.JSONAble<BFChainCore.RangeJSON> {
  @Field.d(1, "uint32")
  start!: number;
  @Field.d(2, "uint32")
  end!: number;
  toJSON() {
    return {
      start: this.start,
      end: this.end,
    };
  }
}
