import { ProgressEventModel } from "./progressEvent.model";
import { TransactionsProgressEventModel } from "./transactions.model";
import { RangeModel } from "@bfchain/core-model-common";
export declare class BlocksProgressEventModel extends ProgressEventModel<"blocks"> implements BFChainCore.JSONToModelType<BFChainCore.BlocksProgressEventJSON> {
    finishedDetails: RangeModel[];
    processingDetails: {
        [height: number]: TransactionsProgressEventModel;
    };
    toJSON(): BFChainCore.BlocksProgressEventJSON;
}
