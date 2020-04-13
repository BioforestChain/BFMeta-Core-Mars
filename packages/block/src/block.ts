import {
  Block,
  BLOCK_TYPES_BASE,
  BLOCK_TYPES_MAP,
} from "@bfchain/core-model-block";
import type { TransactionInBlock } from "@bfchain/core-model-transaction";
import { Reader } from "@bfchain/protobuf";
import { AsymmetricHelper, BlockHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { BlockFactory, BlockGeneratorCalculator } from "./atom_block";

import { Inject, Injectable, ModuleStroge, Resolve } from "@bfchain/util";

const { ArgumentFormatException, log, warn } = CoreExceptionGenerator("Core", "Block");

type BlockFactoryCtor<T extends Block> = new (...args: any[]) => BlockFactory<T>;

@Injectable("bfchain-core:BlockCore")
export class BlockCore {
  constructor(
    public blockHelper: BlockHelper,
    public asymmetricHelper: AsymmetricHelper,
    public blockGeneratorCalculator: BlockGeneratorCalculator,
    @Inject("keypairHelper") public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
    public moduleMap: ModuleStroge,
  ) {}
  // #region blockFactory
  /**各种区块工厂的实例缓存 */
  private _blockFactoryCache = new Map<BlockFactoryCtor<any>, BlockFactory<any>>();
  /**获取区块工厂 */
  getBlockFactory<T extends Block>(BlockFactory: new (...args: any[]) => BlockFactory<T>) {
    let blockFactory = this._blockFactoryCache.get(BlockFactory) as BlockFactory<T> | undefined;
    if (!blockFactory) {
      blockFactory = Resolve(BlockFactory, this.moduleMap);
      this._blockFactoryCache.set(BlockFactory, blockFactory);
    }
    return blockFactory;
  }

  /**使用区块高度获取区块的工厂 */
  getBlockFactoryFromHeight<T extends Block>(height: number) {
    const baseType = this.blockHelper.parseTypeByHeight(height);
    return this.getBlockFactoryFromBaseType<T>(baseType);
  }

  /**使用区块的基础类型获取区块的工厂 */
  getBlockFactoryFromBaseType<T extends Block>(base_type: BLOCK_TYPES_BASE) {
    const BlockFactory = BLOCK_FACTORY_TYPES_MAP.KF.get(base_type);
    if (!BlockFactory) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getBlockFactory<T>(BlockFactory);
  }
  // #endregion

  /**生成区块 */
  async generateBlock<B extends Block>(
    BlockFactory: new (...args: any[]) => BlockFactory<B>,
    body: BFChainCore.BlockBody,
    blockAsset: BFChainCore.GetBlockAssetJSON<B>,
    trsGenerator: AsyncIterable<TransactionInBlock>,
    keypair: BFChainCore.Keypair,
    secondKeypair?: BFChainCore.Keypair,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter<B>,
  ) {
    const blockFactory = this.getBlockFactory(BlockFactory);

    // 校验keypair
    blockFactory.verifyKeypair(keypair);
    if (secondKeypair) {
      blockFactory.verifyKeypair(secondKeypair);
    }
    body.remark = body.remark || {};
    // 校验生成区块的参数
    await blockFactory.verifyBlockBody(body, blockAsset);
    // 生成区块，获取区块并签名
    const block = await blockFactory.generateBlock(
      body,
      blockAsset,
      trsGenerator,
      keypair,
      secondKeypair,
      eventEmitter,
    );

    // Cannot assign to read only property 'signatureBuffer' of object '#<GenesisBlock>'
    // return Object.freeze(block);
    return block;
  }

  // #region Block模型的序列化相关
  /**
   * blockJson => blockModel
   *
   * @param block
   */
  async recombineBlock<T extends Block>(
    blockJSON: BFChainCore.BlockJSON<BFChainCore.GetBlockAssetJSON<T>>,
  ) {
    return (await this.getBlockFactoryFromHeight(blockJSON.height).fromJSON(blockJSON)) as T;
  }
  fromJSON = this.recombineBlock;

  /**将二进制解析成区块 */
  parseBytesToBlock(bytes: Uint8Array) {
    return Block.decode(bytes);
  }

  /**将二进制解析成完整区块 */
  parseBytesToSomeBlock(bytes: Uint8Array, height?: number) {
    if (typeof height !== "number") {
      const reader = new Reader(bytes);
      reader.uint32();
      reader.uint32(); // version
      reader.uint32();
      height = reader.uint32();
    }
    const BlockFactory = this.getBlockModelConstructorFromHeight(height);
    return BlockFactory.decode(bytes) as BFChainCore.Block;
  }

  /**使用区块高度获取区块构造函数 */
  getBlockModelConstructorFromHeight(height: number) {
    return this.getBlockModelConstructorFromBaseType(height);
  }

  /**使用区块的基础类型获取区块的构造函数 */
  getBlockModelConstructorFromBaseType(height: number) {
    const base_type = this.blockHelper.parseTypeByHeight(height);
    const BlockModelConstructor = BLOCK_TYPES_MAP.KM.get(base_type);
    if (!BlockModelConstructor) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return BlockModelConstructor;
  }

  getRoundLastBlockRemarkHash(
    ...args: BFChainUtil.AllArgument<BlockHelper["calcRoundLastBlockRemarkHash"]>
  ) {
    warn("@deprecated", "请直接使用blockHelper.getRoundLastBlockRemarkHash");
    return this.blockHelper.calcRoundLastBlockRemarkHash(...args);
  }
  // #endregion
}

import * as ATOM_BLOCKFAC from "./atom_block";

/**
 * K : BLOCK TYPEBASE VALUE
 * F : BlockFactoryConstructror
 */
export const BLOCK_FACTORY_TYPES_MAP = (() => {
  const KF = new Map<BLOCK_TYPES_BASE, BFChainCore.BlockFactoryConstructor>();
  const FK = new Map<BFChainCore.BlockFactoryConstructor, BLOCK_TYPES_BASE>();
  ([
    [BLOCK_TYPES_BASE.GENESIS, ATOM_BLOCKFAC.GenesisBlockFactory],
    [BLOCK_TYPES_BASE.COMMON, ATOM_BLOCKFAC.CommonBlockFactory],
    [BLOCK_TYPES_BASE.ROUNDEND, ATOM_BLOCKFAC.RoundLastBlockFactory],
  ] as [BLOCK_TYPES_BASE, BFChainCore.BlockFactoryConstructor][]).forEach(([K, F]) => {
    KF.set(K, F);
    FK.set(F, K);
  });
  return {
    KF,
    FK,
  };
})();
