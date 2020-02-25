import * as ATOM_BLOCKLGCVFR from "./atom_block";
import { BLOCK_TYPES_BASE, Block } from "@bfchain/core-model-block";
import { Injectable, Resolve, ModuleStroge } from "@bfchain/util";
import type { BlockLogicVerifier } from "./atom_block";
import { BlockHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
const { ArgumentFormatException } = CoreExceptionGenerator("Core", "BlockLogicVerifierCore");

@Injectable("bfchain-core:BlockLogicVerifierCore")
export class BlockLogicVerifierCore {
  constructor(public blockHelper: BlockHelper, public moduleMap: ModuleStroge) {}

  // #region blockLogicVerifier
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
    const BlockLogicVerifier = BLOCK_LOGIC_VERIFIER_TYPES_MAP.KLV.get(base_type);
    if (!BlockLogicVerifier) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getBlockLogicVerifier<T>(BlockLogicVerifier);
  }
  // #endregion
}

/**
 * K : BLOCK TYPEBASE VALUE
 * LV : BlockLogicVerifierConstructor
 */
export const BLOCK_LOGIC_VERIFIER_TYPES_MAP = (() => {
  const KLV = new Map<BLOCK_TYPES_BASE, BFChainCore.BlockLogicVerifierConstructor>();
  const LVK = new Map<BFChainCore.BlockLogicVerifierConstructor, BLOCK_TYPES_BASE>();
  ([
    [BLOCK_TYPES_BASE.GENESIS, ATOM_BLOCKLGCVFR.GenesisBlockLogicVerifier],
    [BLOCK_TYPES_BASE.COMMON, ATOM_BLOCKLGCVFR.CommonBlockLogicVerifier],
    [BLOCK_TYPES_BASE.ROUNDEND, ATOM_BLOCKLGCVFR.RoundLastBlockLogicVerifier],
  ] as [BLOCK_TYPES_BASE, BFChainCore.BlockLogicVerifierConstructor][]).forEach(([K, LV]) => {
    KLV.set(K, LV);
    LVK.set(LV, K);
  });
  return {
    KLV,
    LVK,
  };
})();
