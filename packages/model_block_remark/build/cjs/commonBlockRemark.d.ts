import { Message } from "@bfchain/protobuf";
export declare class CommonBlockRemarkModel extends Message<CommonBlockRemarkModel> implements BFChainCore.RemarkJSONToModelType<BFChainCore.CommonBlockRemarkJSON> {
    static INC: number;
    /**区块处理信息 */
    debug: string;
    /**备注信息 */
    info: string;
    /**区块参与度 */
    blockParticipation: string;
    toJSON(): {
        debug: string;
        info: string;
        blockParticipation: string;
    };
}
//# sourceMappingURL=commonBlockRemark.d.ts.map