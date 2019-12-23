import {
  Block,
  TransactionInBlock,
  GetBlockRemarkJSON,
  BLOCK_TYPES_BASE,
  BLOCK_TYPES_MAP,
  RoundLastBlock,
} from "../model";
import { Reader } from "@bfchain/protobuf";
import {
  AsymmetricHelper,
  ConfigHelper,
  AccountBaseHelper,
  BlockHelper,
  CoreExceptionGenerator,
  ChainTimeHelper,
} from "@bfchain/core-helper";

import {
  BlockFactory,
  BlockBody,
  GenesisBlockFactory,
  RoundLastBlockFactory,
  CommonBlockFactory,
  BlockGeneratorCalculator,
} from "./block/index";

import {
  GenesisBlockLogicVerifier,
  CommonBlockLogicVerifier,
  RoundLastBlockLogicVerifier,
  BlockLogicVerifier,
} from "./blockLogicVerifier/index";

import {
  GenesisBlockTicker,
  CommonBlockTicker,
  RoundLastBlockTicker,
  BlockTicker,
} from "./blockTicker/index";

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
    private timeHelper: ChainTimeHelper,
    private config: ConfigHelper,
    private accountBaseHelper: AccountBaseHelper,
  ) {}
  // #region blockFactory
  /**各种区块工厂的实例缓存 */
  private _blockFactoryCache = new Map<BlockFactoryCtor<any>, BlockFactory<any>>();
  /**获取区块工厂 */
  getBlockFactory<T extends Block>(BlockFactory: new (...args: any[]) => BlockFactory<T>) {
    let blockFactory: BlockFactory<T> | undefined = this._blockFactoryCache.get(BlockFactory);
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
    const BlockFactory = BLOCK_TYPES_MAP.KF.get(base_type);
    if (!BlockFactory) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getBlockFactory<T>(BlockFactory);
  }
  // #endregion

  // #region blockFactory
  /**各种区块校验器的实例缓存 */
  private _blockLogicVerifierCache = new Map<
    BFChainCore.BlockLogicVerifierConstructor<any>,
    BFChainCore.BlockLogicVerifier<any>
  >();
  /**获取区块校验器 */
  getBlockLogicVerifier<T extends Block>(
    LogicVerifier: BFChainCore.BlockLogicVerifierConstructor<T>,
  ) {
    let blockLogicVerifier: BlockLogicVerifier<T> | undefined = this._blockLogicVerifierCache.get(
      LogicVerifier,
    );
    if (!blockLogicVerifier) {
      blockLogicVerifier = Resolve(LogicVerifier, this.moduleMap);
      this._blockLogicVerifierCache.set(LogicVerifier, blockLogicVerifier);
    }
    return blockLogicVerifier;
  }

  /**使用区块高度获取区块的校验器 */
  getBlockLogicVerifierFromHeight<T extends Block>(height: number) {
    const baseType = this.blockHelper.parseTypeByHeight(height);
    return this.getBlockLogicVerifierFromBaseType<T>(baseType);
  }

  /**使用区块的基础类型获取区块的校验器 */
  getBlockLogicVerifierFromBaseType<T extends Block>(base_type: BLOCK_TYPES_BASE) {
    const BlockLogicVerifier = BLOCK_TYPES_MAP.VLV.get(base_type);
    if (!BlockLogicVerifier) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getBlockLogicVerifier<T>(BlockLogicVerifier);
  }
  // #endregion

  // #region blockTicker
  /**各种区块校验器的实例缓存 */
  private _blockTickerCache = new Map<
    BFChainCore.BlockTickerConstructor<any>,
    BFChainCore.BlockTicker<any>
  >();
  /**获取区块 ticker */
  getBlockTicker<T extends Block>(LogicVerifier: BFChainCore.BlockTickerConstructor<T>) {
    let blockTicker: BlockTicker<T> | undefined = this._blockTickerCache.get(LogicVerifier);
    if (!blockTicker) {
      blockTicker = Resolve(LogicVerifier, this.moduleMap);
      this._blockTickerCache.set(LogicVerifier, blockTicker);
    }
    return blockTicker;
  }

  /**使用区块高度获取区块的 ticker */
  getBlockTickerFromHeight<T extends Block>(height: number) {
    const baseType = this.blockHelper.parseTypeByHeight(height);
    return this.getBlockTickerFromBaseType<T>(baseType);
  }

  /**使用区块的基础类型获取区块的 ticker */
  getBlockTickerFromBaseType<T extends Block>(base_type: BLOCK_TYPES_BASE) {
    const BlockTicker = BLOCK_TYPES_MAP.TBT.get(base_type);
    if (!BlockTicker) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getBlockTicker<T>(BlockTicker);
  }
  // #endregion

  /**生成区块 */
  async generateBlock<T extends Block>(
    BlockFactory: new (...args: any[]) => BlockFactory<T>,
    body: BlockBody,
    blockRemark: GetBlockRemarkJSON<T>,
    trsGenerator: AsyncIterable<TransactionInBlock>,
    keypair: BFChainCore.Keypair,
    eventEmitter?: BFChainCore.ApplyTransactionEventEmitter<{
      beforeSignatureBlock: BFChainUtil.EventInOut<T, unknown>;
    }>,
  ) {
    const blockFactory = this.getBlockFactory(BlockFactory);

    // 校验keypair
    blockFactory.verifyKeypair(keypair);
    // 校验生成区块的参数
    blockFactory.verifyBlockBody(body, blockRemark);
    // 生成区块，获取区块并签名
    const block = await blockFactory.generateBlock(
      body,
      blockRemark,
      trsGenerator,
      keypair,
      eventEmitter as any,
    );
    if (eventEmitter) {
      await eventEmitter.emit("beforeSignatureBlock", block);
    }
    // 校验 remark 大小
    this.blockHelper.verifyBlockRemarkSize(block);
    // 区块签名
    block.blockSignatureBuffer = this.asymmetricHelper.detachedSign(
      block.getBytes(true, true),
      keypair.secretKey,
    );

    // Cannot assign to read only property 'blockSignatureBuffer' of object '#<GenesisBlock>'
    // return Object.freeze(block);
    return block;
  }

  //#region Block模型的序列化相关

  /**
   * blockJson => blockModel
   *
   * @param block
   */
  recombineBlock<T extends BFChainCore.Block>(blockJSON: BFChainCore.BlockJSON<any>) {
    return this.getBlockFactoryFromHeight(blockJSON.height).fromJSON(blockJSON) as T;
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
  //#endregion
}

// const BLOCK_BASE_TYPE_MODEL = new Map<BLOCK_TYPES_BASE, typeof Block>([
//   [BLOCK_TYPES_BASE.GENESIS, GenesisBlock],
//   [BLOCK_TYPES_BASE.COMMON, CommonBlock],
//   [BLOCK_TYPES_BASE.ROUNDEND, RoundLastBlock],
// ]);

BLOCK_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
BLOCK_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.COMMON, CommonBlockFactory);
BLOCK_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.ROUNDEND, RoundLastBlockFactory);

BLOCK_TYPES_MAP.VLV.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockLogicVerifier);
BLOCK_TYPES_MAP.VLV.set(BLOCK_TYPES_BASE.COMMON, CommonBlockLogicVerifier);
BLOCK_TYPES_MAP.VLV.set(BLOCK_TYPES_BASE.ROUNDEND, RoundLastBlockLogicVerifier);

BLOCK_TYPES_MAP.TBT.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockTicker);
BLOCK_TYPES_MAP.TBT.set(BLOCK_TYPES_BASE.COMMON, CommonBlockTicker);
BLOCK_TYPES_MAP.TBT.set(BLOCK_TYPES_BASE.ROUNDEND, RoundLastBlockTicker);
