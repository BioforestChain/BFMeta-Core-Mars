import * as ATOM_BLOCKLGCVFR from "./atom_block";
import { BLOCK_TYPES_BASE } from "@bfchain/core-model-block";

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
