import { GenesisBlock, CommonBlock, RoundLastBlock } from "./atom_block";
import { Message } from "@bfchain/protobuf";
export declare type SomeBlockConstructor = typeof GenesisBlock | typeof CommonBlock | typeof RoundLastBlock;
/**
 * 区块类型
 *
 */
export declare enum BLOCK_TYPES_BASE {
    /**创世块 */
    GENESIS = 0,
    /**普通区块 */
    COMMON = 1,
    /**每轮最后一个块 */
    ROUNDEND = 2
}
/**
 * K : BLOCK TYPEBASE VALUE
 * M : BlockModelConstructror
 * F : BlockFactoryConstructror
 */
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
//# sourceMappingURL=someBlock.d.ts.map