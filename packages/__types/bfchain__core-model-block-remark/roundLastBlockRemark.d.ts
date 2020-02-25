import { Message } from "@bfchain/protobuf";
import { RoundDelegateRemarkModel } from "./roundDelegateRemark";
export declare class RoundLastBlockRemarkModel extends RoundDelegateRemarkModel<RoundLastBlockRemarkModel> implements BFChainCore.RemarkJSONToModelType<BFChainCore.RoundLastBlockRemarkJSON> {
    debug: string;
    info: string;
    blockParticipation: string;
    hashBuffer: Uint8Array;
    get hash(): string;
    set hash(value: string);
    toJSON(): BFChainCore.RoundLastBlockRemarkJSON;
    getBytes(): Uint8Array;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<RoundLastBlockRemarkModel>): T;
}
