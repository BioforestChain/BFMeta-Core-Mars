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

@Type.d("ResponseModel")
export class ResponseModel extends Message<ResponseModel> {
  static INC = 1;
  @Field.d(ResponseModel.INC++, "uint32")
  version!: number;
  @Field.d(ResponseModel.INC++, "uint32")
  req_id!: number;
  @Field.d(ResponseModel.INC++, DUPLEX_API_CMD)
  cmd!: DUPLEX_API_CMD;
  @Field.d(ResponseModel.INC++, "bytes")
  binary!: Uint8Array;
}
