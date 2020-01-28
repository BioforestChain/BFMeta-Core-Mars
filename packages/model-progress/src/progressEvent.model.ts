import { Message, Type, Field, MapField } from "@bfchain/protobuf";

export enum PROGRESS_EVENT_MODE {
  /**不定的 */
  INDETERMINATE = 0,
  /**确定的 */
  DETERMINATE = 1,
  /**对于想要指示来自其它节点的活动或者等待的操作,使用缓冲区指示符
   * 一般用到3个进度的时候就需要使用 buffer 模式
   * 比如直播的视频流, 最外层的是时间轴(total),中间层是已经下载的(buffer),内层是增加播放的进度(loaded)
   * 比如"重放区块":下载区块并验证.
   * 外层像是直播的时间轴, 因为区块是一直在增加的
   * 中间层就是已经同步过来的区块
   * 内层就是校验的进度
   */
  BUFFER = 2,
  /**对于想要指示预加载的情况(直到可以实际加载),使用查询指示符
   * 比如同步区块,要先下载区块头,区块头里头才会有总交易数
   */
  QUERY = 3,
}

/**通用的进度事件进度模型 */
@Type.d("ProgressEvent")
export class ProgressEventModel<EVENT extends string> extends Message<ProgressEventModel<EVENT>>
  implements BFChainCore.JSONToModelType<BFChainCore.ProgressEventJSON> {
  static INC = 1;
  @Field.d(ProgressEventModel.INC++, "string")
  type!: EVENT;
  /**进度的模式, 等价于lengthComputable */
  @Field.d(ProgressEventModel.INC++, PROGRESS_EVENT_MODE)
  mode!: PROGRESS_EVENT_MODE;
  @Field.d(ProgressEventModel.INC++, "uint32")
  loaded!: number;
  @Field.d(ProgressEventModel.INC++, "uint32", "optional")
  buffer?: number;
  @Field.d(ProgressEventModel.INC++, "uint32")
  total!: number;
  toJSON() {
    return {
      type: this.type,
      mode: this.mode,
      loaded: this.loaded,
      buffer: this.buffer,
      total: this.total,
    };
  }
}
