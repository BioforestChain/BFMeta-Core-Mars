import { Message } from "@bfchain/protobuf";
export declare enum BLOCK_TYPES_BASE {
    GENESIS = 0,
    COMMON = 1,
    ROUNDEND = 2
}
export declare const BLOCK_TYPES_MAP: {
    KM: Map<BLOCK_TYPES_BASE, typeof import("@bfchain/core-model-block-base").Block>;
    MK: Map<typeof import("@bfchain/core-model-block-base").Block, BLOCK_TYPES_BASE>;
};
export declare class SomeBlockModel<T extends BFChainCore.Block = BFChainCore.Block> extends Message<T> implements BFChainCore.JSONToModelType<BFChainCore.SomeBlockJSON<T>> {
    static INC: number;
    protected _block_type: BLOCK_TYPES_BASE;
    protected _block_bytes: Uint8Array;
    get block(): T;
    set block(block: T);
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<SomeBlockModel>): T;
    toJSON(): {
        block: T;
    };
}
