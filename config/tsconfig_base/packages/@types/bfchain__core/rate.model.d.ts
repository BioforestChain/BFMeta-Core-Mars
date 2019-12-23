import { Message } from "@bfchain/protobuf";
/**
 * 比例模型
 */
export declare class RateModel extends Message<RateModel> implements BFChainUtil.JSONAble<BFChainCore.RateJSON<string>> {
    /**前部权重 */
    prevWeight: string;
    /**后部权重 */
    nextWeight: string;
    toJSON(): {
        prevWeight: string;
        nextWeight: string;
    };
}
//# sourceMappingURL=rate.model.d.ts.map