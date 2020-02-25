import { Block, GetBlockRemarkJSON, BLOCK_TYPES_BASE } from "@bfchain/core-model-block";
import type { TransactionInBlock } from "@bfchain/core-model-transaction";
import { AsymmetricHelper, BlockHelper } from "@bfchain/core-helper";
import { BlockFactory, BlockGeneratorCalculator } from "./atom_block";
import { ModuleStroge } from "@bfchain/util";
export declare class BlockCore {
    blockHelper: BlockHelper;
    asymmetricHelper: AsymmetricHelper;
    blockGeneratorCalculator: BlockGeneratorCalculator;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    moduleMap: ModuleStroge;
    constructor(blockHelper: BlockHelper, asymmetricHelper: AsymmetricHelper, blockGeneratorCalculator: BlockGeneratorCalculator, keypairHelper: BFChainCore.KeypairHelperInterface, cryptoHelper: BFChainCore.CryptoHelperInterface, Buffer: BFChainUtil.BufferConstructor, moduleMap: ModuleStroge);
    private _blockFactoryCache;
    getBlockFactory<T extends Block>(BlockFactory: new (...args: any[]) => BlockFactory<T>): BlockFactory<T>;
    getBlockFactoryFromHeight<T extends Block>(height: number): BlockFactory<T>;
    getBlockFactoryFromBaseType<T extends Block>(base_type: BLOCK_TYPES_BASE): BlockFactory<T>;
    generateBlock<B extends Block>(BlockFactory: new (...args: any[]) => BlockFactory<B>, body: BFChainCore.BlockBody, blockRemark: GetBlockRemarkJSON<B>, trsGenerator: AsyncIterable<TransactionInBlock>, keypair: BFChainCore.Keypair, eventEmitter?: BFChainCore.GenerateBlockEventEmitter<B>): Promise<B>;
    recombineBlock<R extends BFChainCore.CommonBlockRemarkJSON>(blockJSON: BFChainCore.BlockJSON<R>): Block<R>;
    fromJSON: <R extends BFChainCore.CommonBlockRemarkJSON>(blockJSON: BFChainCore.BlockJSON<R>) => Block<R>;
    parseBytesToBlock(bytes: Uint8Array): Block<any>;
    parseBytesToSomeBlock(bytes: Uint8Array, height?: number): Block<BFChainCore.CommonBlockRemarkJSON>;
    getBlockModelConstructorFromHeight(height: number): typeof Block;
    getBlockModelConstructorFromBaseType(height: number): typeof Block;
    getRoundLastBlockRemarkHash(...args: BFChainUtil.AllArgument<BlockHelper["calcRoundLastBlockRemarkHash"]>): Promise<string>;
}
export declare const BLOCK_FACTORY_TYPES_MAP: {
    KF: Map<BLOCK_TYPES_BASE, BFChainCore.BlockFactoryConstructor<any>>;
    FK: Map<BFChainCore.BlockFactoryConstructor<any>, BLOCK_TYPES_BASE>;
};
