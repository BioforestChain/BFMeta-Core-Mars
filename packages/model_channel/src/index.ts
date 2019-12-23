import "./@types";
import { Message, Type, Field } from "@bfchain/protobuf";

// let _inc = 0;

export enum DUPLEX_API_CMD {
  RESPONSE = 0b1, //1 << _inc++, //= "RESPONSE",
  QUERY_TRANSACTION = 0b10, //1 << _inc++, //= "/transaction/query",
  NEW_TRANSACTION = 0b100, //1 << _inc++, //= "/transaction/broadcast",
  QUERY_BLOCK = 0b1000, //1 << _inc++, //= "/block/query",
  NEW_BLOCK = 0b10000, //1 << _inc++, //= "/block/broadcast",
  GET_PEER_INFO = 0b100000, //1 << _inc++, //= "/peer/info",

  /**
   * @TODO 使用这些RETURN替代单纯的RESPONSE，
   * 这样可以达成更细致的数据分流与简单的响应校验
   */
  QUERY_TRANSACTION_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.QUERY_TRANSACTION,
  NEW_TRANSACTION_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.NEW_TRANSACTION,
  QUERY_BLOCK_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.QUERY_BLOCK,
  NEW_BLOCK_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.NEW_BLOCK,
  GET_PEER_INFO_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.GET_PEER_INFO,
}

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

export * from "./common.chainChannel.model";
export * from "./transaction.chainChannel.model";
export * from "./block.chainChannel.model";
export * from "./peer.chainChannel.model";
