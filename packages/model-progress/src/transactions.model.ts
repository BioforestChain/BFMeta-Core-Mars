import { Message, Type, Field, MapField } from "@bfchain/protobuf";
import { ProgressEventModel } from "./progressEvent.model";
import { RangeModel } from "@bfchain/core-model-common";

/**批量交易的进度事件进度模型 */
@Type.d("TransactionsProgressEvent")
export class TransactionsProgressEventModel
  extends ProgressEventModel<"transactions">
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionsProgressEventJSON>
{
  /**已经下载的交易的index范围 */
  @Field.d(TransactionsProgressEventModel.INC++, RangeModel, "repeated")
  finishedDetails!: RangeModel[];
  toJSON(): BFChainCore.TransactionsProgressEventJSON {
    return Object.assign(
      {
        finishedDetails: this.finishedDetails.map((range) => range.toJSON()),
      },
      super.toJSON(),
    );
  }
}
