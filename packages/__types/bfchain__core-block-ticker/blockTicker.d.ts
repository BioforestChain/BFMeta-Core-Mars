import * as ATOM_BLOCKTKR from "./atom_block";
import { BLOCK_TYPES_BASE, Block } from "@bfchain/core-model-block";
import { ModuleStroge } from "@bfchain/util";
import { BlockHelper } from "@bfchain/core-helper";
export declare class BlockTickerCore {
    blockHelper: BlockHelper;
    moduleMap: ModuleStroge;
    constructor(blockHelper: BlockHelper, moduleMap: ModuleStroge);
    private _blockTickerCache;
    getBlockTicker<T extends Block>(LogicVerifier: BFChainCore.BlockTickerConstructor<T>): ATOM_BLOCKTKR.BlockTicker<T>;
    getBlockTickerFromHeight<T extends Block>(height: number): ATOM_BLOCKTKR.BlockTicker<T>;
    getBlockTickerFromBaseType<T extends Block>(base_type: BLOCK_TYPES_BASE): ATOM_BLOCKTKR.BlockTicker<T>;
}
export declare const BLOCK_TICKER_TYPES_MAP: {
    KT: Map<BLOCK_TYPES_BASE, BFChainCore.BlockTickerConstructor<any>>;
    TK: Map<BFChainCore.BlockTickerConstructor<any>, BLOCK_TYPES_BASE>;
};
