import { Message } from "@bfchain/protobuf";
import { RoundDelegateRemarkModel } from "./roundDelegateRemark";
export declare class RoundLastBlockRemarkModel extends RoundDelegateRemarkModel<RoundLastBlockRemarkModel> implements BFChainCore.RemarkJSONToModelType<BFChainCore.RoundLastBlockRemarkJSON> {
    /**区块处理信息 */
    debug: string;
    /**备注信息 */
    info: string;
    /**区块参与度 */
    blockParticipation: string;
    /**链上链区块HASH, 包含当轮除最后一个区块外的区块signature以及上一轮 hash 合并后生成的hash*/
    hashBuffer: Uint8Array;
    get hash(): string;
    set hash(value: string);
    toJSON(): {
        newDelegates: string[];
        maxBeginBalance: string;
        maxTxCount: number;
        nextRoundDelegates: {
            address: string;
            equity: string;
        }[];
        rate: string;
    } & {
        debug: string;
        info: string;
        blockParticipation: string;
        hash: string;
    };
    getBytes(): Uint8Array;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<RoundLastBlockRemarkModel>): T;
}
//# sourceMappingURL=roundLastBlockRemark.d.ts.map