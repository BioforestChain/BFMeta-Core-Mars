import { ProgressEventModel } from "./progressEvent.model";
import { RangeModel } from "@bfchain/core-model-common";
export declare class TransactionsProgressEventModel extends ProgressEventModel<"transactions"> implements BFChainCore.JSONToModelType<BFChainCore.TransactionsProgressEventJSON> {
    finishedDetails: RangeModel[];
    toJSON(): BFChainCore.TransactionsProgressEventJSON;
}
