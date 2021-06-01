import "@bfchain/core-typings";
import "./@types";
import { Message, Type, Field } from "@bfchain/protobuf";
import { DUPLEX_API_CMD } from "./constants";
import type {} from "@bfchain/core-model-block";

export * from "./constants";
export * from "./common.chainChannel.model";
export * from "./transaction.chainChannel.model";
export * from "./block.chainChannel.model";
export * from "./peer.chainChannel.model";

// let _inc = 0;

@Type.d("ChainChannelMessageModel")
export class ChainChannelMessageModel extends Message<ChainChannelMessageModel> {
  static INC = 1;
  @Field.d(ChainChannelMessageModel.INC++, "uint32")
  version!: number;
  @Field.d(ChainChannelMessageModel.INC++, "uint32")
  req_id!: number;
  @Field.d(ChainChannelMessageModel.INC++, DUPLEX_API_CMD)
  cmd!: DUPLEX_API_CMD;
  @Field.d(ChainChannelMessageModel.INC++, "bytes")
  binary!: Uint8Array;
  /**下一次数据请求的锁定时间 */
  @Field.d(ChainChannelMessageModel.INC++, "uint32")
  lockTimespan!: number;
  /**锁定时间累计超过refuseTime后会引发REFUSE响应，届时数据会丢包 */
  @Field.d(ChainChannelMessageModel.INC++, "uint32")
  refuseTimespan!: number;
}
