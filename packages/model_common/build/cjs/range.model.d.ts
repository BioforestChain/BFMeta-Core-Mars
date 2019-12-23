import "./@types";
import { Message } from "@bfchain/protobuf";
/**范围模型 */
export declare class RangeModel extends Message<RangeModel> implements BFChainUtil.JSONAble<BFChainCore.RangeJSON> {
    start: number;
    end: number;
    toJSON(): {
        start: number;
        end: number;
    };
}
//# sourceMappingURL=range.model.d.ts.map