import * as ATOM_BLOCKTKR from "./atom_block";
import { BLOCK_TYPES_BASE, Block } from "@bfchain/core-model-block";
import { Injectable, Resolve, ModuleStroge } from "@bfchain/util";
import type { BlockTicker } from "./atom_block";
import { BlockHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
const { ArgumentFormatException, log, warn } = CoreExceptionGenerator("Core", "BlockTicker");

@Injectable("bfchain-core:BlockTickerCore")
export class BlockTickerCore {
  constructor(public blockHelper: BlockHelper, public moduleMap: ModuleStroge) {}

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
    const BlockTicker = BLOCK_TICKER_TYPES_MAP.KT.get(base_type);
    if (!BlockTicker) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getBlockTicker<T>(BlockTicker);
  }
  // #endregion
}

/**
 * K : BLOCK TYPEBASE VALUE
 * T : BlockFactoryConstructror
 */
export const BLOCK_TICKER_TYPES_MAP = (() => {
  const KT = new Map<BLOCK_TYPES_BASE, BFChainCore.BlockTickerConstructor>();
  const TK = new Map<BFChainCore.BlockTickerConstructor, BLOCK_TYPES_BASE>();
  (
    [
      [BLOCK_TYPES_BASE.GENESIS, ATOM_BLOCKTKR.GenesisBlockTicker],
      [BLOCK_TYPES_BASE.COMMON, ATOM_BLOCKTKR.CommonBlockTicker],
      [BLOCK_TYPES_BASE.ROUNDEND, ATOM_BLOCKTKR.RoundLastBlockTicker],
    ] as [BLOCK_TYPES_BASE, BFChainCore.BlockTickerConstructor][]
  ).forEach(([K, F]) => {
    KT.set(K, F);
    TK.set(F, K);
  });
  return {
    KT,
    TK,
  };
})();
