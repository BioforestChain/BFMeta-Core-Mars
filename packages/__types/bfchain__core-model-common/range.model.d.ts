import { Message } from "@bfchain/protobuf";
export declare class RangeModel extends Message<RangeModel> implements BFChainUtil.JSONAble<BFChainCore.RangeJSON> {
    start: number;
    end: number;
    toJSON(): {
        start: number;
        end: number;
    };
}
