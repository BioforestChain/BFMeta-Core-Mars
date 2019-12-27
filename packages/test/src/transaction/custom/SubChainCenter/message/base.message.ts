import { Message, Field, Type } from "@bfchain/protobuf";
import { OPCODE } from "./common";
import "../types";

/**
 * SubChainCenter<->Worker 请求处理消息
 */
export class ReqMsg implements SubChainCenter.IWorkerMsg {
  opcode!: number;
  __sharedBuffer!: SharedArrayBuffer; //  如果有需要立即返回的数据，写在这里头
}

/**
 * SubChainCenter<->Worker 处理返回消息
 */
//@Type.d("XXXXX")
export class ResMsg extends Message<ResMsg> implements SubChainCenter.IWorkerMsg {
  static INC = 1;

  /**opcode为每一个message类型的唯一标识，详见./common/OPCODE */
  @Field.d(ResMsg.INC++, "int32")
  opcode!: number;

  @Field.d(ResMsg.INC++, "int32")
  retCode!: number;

  @Field.d(ResMsg.INC++, "string")
  message: string = "";

  getBytes() {
    const ret: Uint8Array = (this.constructor as typeof ResMsg).encode(this).finish();
    return ret;
  }
}
