import { ResMsg, ReqMsg } from "./base.message";
import { Type, Field } from "@bfchain/protobuf";
import { OPCODE } from "./common";

/**
 * SubChainCenter->Worker 请求应用
 */
export class TxApplyReq extends ReqMsg {
  opcode = OPCODE.TX_APPLY_REQ;
  body!: BFChainCore.TxBodyJSON;
  customAsset!: BFChainCore.CustomAssetJSON;
}

/**
 * Worker->SubChainCenter 返回应用结果
 */
@Type.d("TxApplyRes")
export class TxApplyRes extends ResMsg {
  opcode = OPCODE.TX_APPLY_RES;
}
