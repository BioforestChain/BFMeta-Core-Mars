import { Message } from "@bfchain/protobuf";
export declare class RateModel extends Message<RateModel> implements BFChainUtil.JSONAble<BFChainCore.RateJSON<string>> {
    prevWeight: string;
    nextWeight: string;
    toJSON(): {
        prevWeight: string;
        nextWeight: string;
    };
}
