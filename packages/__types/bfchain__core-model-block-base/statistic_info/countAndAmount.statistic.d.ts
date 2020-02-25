import { Message } from "@bfchain/protobuf";
export declare class CountAndAmountStatisticModel extends Message<CountAndAmountStatisticModel> implements BFChainCore.JSONToModelType<BFChainCore.CountAndAmountStatisticJSON> {
    static INC: number;
    changeAmount: string;
    changeCount: number;
    moveAmount: string;
    transactionCount: number;
    toJSON(): {
        changeAmount: string;
        changeCount: number;
        moveAmount: string;
        transactionCount: number;
    };
}
