import { ResMsg, ReqMsg } from "./base.message";
import { Type, Field } from "@bfchain/protobuf";
import { OPCODE } from "./common";
import "../types";

/**
 * SubChainCenter->Worker 请求校验
 */
export class TxVerifyReq extends ReqMsg {
  opcode = OPCODE.TX_VERIFY_REQ;
  body!: BFChainCore.TxBodyJSON;
  customAsset!: BFChainCore.CustomAssetJSON;
}

/**
 * Worker->SubChainCenter 返回校验结果
 */
@Type.d("TxVerifyRes")
export class TxVerifyRes extends ResMsg {
  opcode = OPCODE.TX_VERIFY_RES;
}
