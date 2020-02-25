import { Message } from "@bfchain/protobuf";
export declare enum PROGRESS_EVENT_MODE {
    INDETERMINATE = 0,
    DETERMINATE = 1,
    BUFFER = 2,
    QUERY = 3
}
export declare class ProgressEventModel<EVENT extends string> extends Message<ProgressEventModel<EVENT>> implements BFChainCore.JSONToModelType<BFChainCore.ProgressEventJSON<EVENT>> {
    static INC: number;
    type: EVENT;
    mode: PROGRESS_EVENT_MODE;
    loaded: number;
    buffer?: number;
    total: number;
    toJSON(): BFChainCore.ProgressEventJSON<EVENT>;
}
