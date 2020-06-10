import { Message, Type, Field, MapField } from "@bfchain/protobuf";
import { ProgressEventModel } from "./progressEvent.model";
import { TransactionsProgressEventModel } from "./transactions.model";
import { RangeModel } from "@bfchain/core-model-common";

/**批量区块的进度事件进度模型 */
@Type.d("BlocksProgressEvent")
export class BlocksProgressEventModel extends ProgressEventModel<"blocks">
  implements BFChainCore.JSONToModelType<BFChainCore.BlocksProgressEventJSON> {
  /**已经下载的区块的高度范围 */
  @Field.d(BlocksProgressEventModel.INC++, RangeModel, "repeated")
  finishedDetails!: RangeModel[];
  /**正在下载中的区块中,各自的进度 */
  @MapField.d(BlocksProgressEventModel.INC++, "uint32", TransactionsProgressEventModel)
  // processingDetails!: Map<number, TransactionsProgressEventModel>;
  processingDetails!: { [height: number]: TransactionsProgressEventModel };
  toJSON(): BFChainCore.BlocksProgressEventJSON {
    // const processingDetails = this.processingDetails
    return Object.assign(
      {
        finishedDetails: this.finishedDetails.map((range) => range.toJSON()),
        processingDetails: this.processingDetails,
      },
      super.toJSON(),
    );
  }
}
