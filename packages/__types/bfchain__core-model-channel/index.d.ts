import "./@types";
import { Message } from "@bfchain/protobuf";
import { DUPLEX_API_CMD } from "./constants";
export * from "./constants";
export * from "./common.chainChannel.model";
export * from "./transaction.chainChannel.model";
export * from "./block.chainChannel.model";
export * from "./peer.chainChannel.model";
export declare class ResponseModel extends Message<ResponseModel> {
    static INC: number;
    version: number;
    req_id: number;
    cmd: DUPLEX_API_CMD;
    binary: Uint8Array;
}
