import { Message } from "@bfchain/protobuf";
export declare class CommonBlockRemarkModel extends Message<CommonBlockRemarkModel> implements BFChainCore.RemarkJSONToModelType<BFChainCore.CommonBlockRemarkJSON> {
    static INC: number;
    debug: string;
    info: string;
    blockParticipation: string;
    toJSON(): {
        debug: string;
        info: string;
        blockParticipation: string;
    };
}
