import { ProgressEventModel } from "./progressEvent.model";
import { RangeModel } from "@bfchain/core-model-common";
/**批量交易的进度事件进度模型 */
export declare class TransactionsProgressEventModel extends ProgressEventModel<"transactions"> implements BFChainCore.JSONToModelType<BFChainCore.TransactionsProgressEventJSON> {
    /**已经下载的交易的index范围 */
    finishedDetails: RangeModel[];
    toJSON(): {
        type: "transactions";
        mode: import("./progressEvent.model").PROGRESS_EVENT_MODE;
        loaded: number;
        buffer: number | undefined;
        total: number;
    } & {
        finishedDetails: {
            start: number;
            end: number;
        }[];
    };
}
//# sourceMappingURL=transactions.model.d.ts.map