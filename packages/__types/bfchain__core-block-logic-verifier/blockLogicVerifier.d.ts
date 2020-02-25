import * as ATOM_BLOCKLGCVFR from "./atom_block";
import { BLOCK_TYPES_BASE, Block } from "@bfchain/core-model-block";
import { ModuleStroge } from "@bfchain/util";
import { BlockHelper } from "@bfchain/core-helper";
export declare class BlockLogicVerifierCore {
    blockHelper: BlockHelper;
    moduleMap: ModuleStroge;
    constructor(blockHelper: BlockHelper, moduleMap: ModuleStroge);
    private _blockLogicVerifierCache;
    getBlockLogicVerifier<T extends Block>(LogicVerifier: BFChainCore.BlockLogicVerifierConstructor<T>): ATOM_BLOCKLGCVFR.BlockLogicVerifier<T>;
    getBlockLogicVerifierFromHeight<T extends Block>(height: number): ATOM_BLOCKLGCVFR.BlockLogicVerifier<T>;
    getBlockLogicVerifierFromBaseType<T extends Block>(base_type: BLOCK_TYPES_BASE): ATOM_BLOCKLGCVFR.BlockLogicVerifier<T>;
}
export declare const BLOCK_LOGIC_VERIFIER_TYPES_MAP: {
    KLV: Map<BLOCK_TYPES_BASE, BFChainCore.BlockLogicVerifierConstructor<any>>;
    LVK: Map<BFChainCore.BlockLogicVerifierConstructor<any>, BLOCK_TYPES_BASE>;
};
