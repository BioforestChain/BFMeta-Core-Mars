import { GenesisBlock, CommonBlock, RoundLastBlock } from "./atom_block";

import { Type, Field, Message } from "@bfchain/protobuf";
import {
  CoreExceptionGenerator,
  INVALID_BLOCK_CONSTRUCTOR,
  INVALID_BLOCK_TYPE,
} from "@bfchain/util-helper-exception";
const { ArgumentFormatException } = CoreExceptionGenerator("MODEL", "blockModel");

// export type SomeBlock = GenesisBlock | CommonBlock | RoundLastBlock;

export type SomeBlockConstructor = typeof GenesisBlock | typeof CommonBlock | typeof RoundLastBlock;

/**
 * 区块类型
 *
 */
export enum BLOCK_TYPES_BASE {
  /**创世块 */
  GENESIS = 0, //= "GENESIS",
  /**普通区块 */
  COMMON = 1, //= "COMMON",
  /**每轮最后一个块 */
  ROUNDEND = 2, //= "ROUNDEND",
}

/**
 * K : BLOCK TYPEBASE VALUE
 * M : BlockModelConstructror
 * F : BlockFactoryConstructror
 */
export const BLOCK_TYPES_MAP = (() => {
  const KM = new Map<BLOCK_TYPES_BASE, BFChainCore.BlockModelConstructor>();
  const MK = new Map<BFChainCore.BlockModelConstructor, BLOCK_TYPES_BASE>();
  ([
    [BLOCK_TYPES_BASE.GENESIS, GenesisBlock],
    [BLOCK_TYPES_BASE.COMMON, CommonBlock],
    [BLOCK_TYPES_BASE.ROUNDEND, RoundLastBlock],
  ] as [BLOCK_TYPES_BASE, BFChainCore.BlockModelConstructor][]).forEach(([K, M]) => {
    KM.set(K, M);
    MK.set(M, K);
  });
  return {
    KM,
    MK,
    // KF: new Map<BLOCK_TYPES_BASE, BFChainCore.BlockFactoryConstructor>(),
    // VLV: new Map<BLOCK_TYPES_BASE, BFChainCore.BlockLogicVerifierConstructor<any>>(),
    // LVV: new Map<BFChainCore.BlockLogicVerifierConstructor<any>, BLOCK_TYPES_BASE>(),
    // TBT: new Map<BLOCK_TYPES_BASE, BFChainCore.BlockTickerConstructor<any>>(),
    // BTT: new Map<BFChainCore.BlockTickerConstructor<any>, BLOCK_TYPES_BASE>(),
  };
})();

const BLOCK_BYTE_WM = new WeakMap<Uint8Array, BFChainCore.Block>();
@Type.d("SomeBlockModel")
export class SomeBlockModel<T extends BFChainCore.Block = BFChainCore.Block> extends Message<T>
  implements BFChainCore.JSONToModelType<BFChainCore.SomeBlockJSON<T>> {
  static INC = 1;
  @Field.d(SomeBlockModel.INC++, BLOCK_TYPES_BASE)
  protected _block_type!: BLOCK_TYPES_BASE;
  @Field.d(SomeBlockModel.INC++, "bytes")
  protected _block_bytes!: Uint8Array;
  get block() {
    let block = BLOCK_BYTE_WM.get(this._block_bytes);
    if (!block) {
      const Model = BLOCK_TYPES_MAP.KM.get(this._block_type);
      if (!Model) {
        throw new ArgumentFormatException(INVALID_BLOCK_TYPE, {
          type: this._block_type,
        });
      }
      block = Model.decode(this._block_bytes);
      BLOCK_BYTE_WM.set(this._block_bytes, block);
    }
    return block as T;
  }
  set block(block: T) {
    const ctor = block.constructor as BFChainCore.BlockModelConstructor;
    const block_type = BLOCK_TYPES_MAP.MK.get(ctor);
    if (block_type === undefined) {
      throw new ArgumentFormatException(INVALID_BLOCK_CONSTRUCTOR, { name: ctor.name });
    }
    this._block_type = block_type;
    this._block_bytes = new Uint8Array(ctor.encode(block).finish());
    BLOCK_BYTE_WM.set(this._block_bytes, block);
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<SomeBlockModel>,
  ) {
    const res = super.fromObject(object) as SomeBlockModel;
    if (object !== res) {
      const obj_block = object.block;
      if (obj_block) {
        if (!(obj_block instanceof Message)) {
          let type = BLOCK_TYPES_BASE.COMMON;
          if (obj_block.height === 0) {
            type = BLOCK_TYPES_BASE.GENESIS;
          } else if (obj_block.remark && "hash" in obj_block.remark) {
            type = BLOCK_TYPES_BASE.ROUNDEND;
          }
          const ModelCtor = BLOCK_TYPES_MAP.KM.get(type);
          if (ModelCtor) {
            res.block = ModelCtor.fromObject<BFChainCore.Block>(obj_block);
          }
        } else {
          res.block = obj_block as BFChainCore.Block;
        }
      }
    }
    return (res as unknown) as T;
  }
  toJSON() {
    return {
      block: this.block,
    };
  }
}
