import { ProgressEventModel } from "./progressEvent.model";
import { TransactionsProgressEventModel } from "./transactions.model";
import { RangeModel } from "@bfchain/core-model-common";
/**批量区块的进度事件进度模型 */
export declare class BlocksProgressEventModel extends ProgressEventModel<"blocks"> implements BFChainCore.JSONToModelType<BFChainCore.BlocksProgressEventJSON> {
    /**已经下载的区块的高度范围 */
    finishedDetails: RangeModel[];
    /**正在下载中的区块中,各自的进度 */
    processingDetails: {
        [height: number]: TransactionsProgressEventModel;
    };
    toJSON(): {
        type: "blocks";
        mode: import("./progressEvent.model").PROGRESS_EVENT_MODE;
        loaded: number;
        buffer: number | undefined;
        total: number;
    } & {
        finishedDetails: {
            start: number;
            end: number;
        }[];
        processingDetails: {
            [height: number]: TransactionsProgressEventModel;
        };
    };
}
//# sourceMappingURL=blocks.model.d.ts.map