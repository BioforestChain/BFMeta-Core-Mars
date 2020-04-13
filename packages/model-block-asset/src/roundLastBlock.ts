import { Message, Type, Field } from "@bfchain/protobuf";
import { RoundDelegateModel } from "./roundDelegate";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

/**
 * RoundLastBlock 区块 asset 外层模型
 */
@Type.d("RoundLastBlockModel")
export class RoundLastBlockModel extends RoundDelegateModel<RoundLastBlockModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RoundLastBlockJSON> {
  /**链上链区块HASH, 包含当轮除最后一个区块外的区块signature以及上一轮 hash 合并后生成的hash*/
  @Field.d(RoundLastBlockModel.INC++, "bytes")
  hashBuffer!: Uint8Array;
  get hash(): string {
    return getHexFromArrayBuffer(this.hashBuffer);
  }
  set hash(value: string) {
    this.hashBuffer = parseHexToArrayBuffer(value);
  }
  toJSON(): BFChainCore.RoundLastBlockJSON {
    return Object.assign(
      {
        hash: this.hash,
      },
      super.toJSON(),
    );
  }
  @cacheBytesGetter
  getBytes() {
    return this.$type.encode(this).finish();
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<RoundLastBlockModel>,
  ) {
    const res = super.fromObject(object) as RoundLastBlockModel;
    if (res !== object) {
      object.hash && (res.hash = object.hash);
    }
    return (res as unknown) as T;
  }
}

/**
 * RoundLastBlock 区块 asset 外层模型
 */
@Type.d("RoundLastBlockAssetModel")
export class RoundLastBlockAssetModel extends Message<RoundLastBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RoundLastBlockAssetJSON> {
  @Field.d(1, RoundLastBlockModel)
  roundLastBlock!: RoundLastBlockModel;
  toJSON() {
    return {
      roundLastBlock: this.roundLastBlock.toJSON(),
    };
  }
}
