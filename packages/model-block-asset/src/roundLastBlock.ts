import { Message, Type, Field } from "@bfchain/protobuf";
import { RoundDelegateModel } from "./roundDelegate";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

/**
 * RoundLastBlock 区块 asset 外层模型
 */
@Type.d("RoundLastAssetModel")
export class RoundLastAssetModel
  extends RoundDelegateModel<RoundLastAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RoundLastAssetJSON>
{
  /**块内资产变动账户生成的 hash */
  @Field.d(RoundLastAssetModel.INC++, "bytes")
  assetChangeBuffer!: Uint8Array;
  get assetChangeHash(): string {
    return getHexFromArrayBuffer(this.assetChangeBuffer);
  }
  set assetChangeHash(value: string) {
    this.assetChangeBuffer = parseHexToArrayBuffer(value);
  }
  /**链上链区块 hash, 包含当轮除最后一个区块外的区块 signature 以及上一轮 hash 合并后生成的 hash */
  @Field.d(RoundLastAssetModel.INC++, "bytes")
  chainOnChainBuffer!: Uint8Array;
  get chainOnChainHash(): string {
    return getHexFromArrayBuffer(this.chainOnChainBuffer);
  }
  set chainOnChainHash(value: string) {
    this.chainOnChainBuffer = parseHexToArrayBuffer(value);
  }
  toJSON(): BFChainCore.RoundLastAssetJSON {
    return Object.assign(
      {
        assetChangeHash: this.assetChangeHash,
        chainOnChainHash: this.chainOnChainHash,
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
    object: BFChainProtobuf.ObjectFromType<RoundLastAssetModel>,
  ) {
    const res = super.fromObject(object) as RoundLastAssetModel;
    if (res !== object) {
      object.assetChangeHash && (res.assetChangeHash = object.assetChangeHash);
      object.chainOnChainHash && (res.chainOnChainHash = object.chainOnChainHash);
    }
    return res as unknown as T;
  }
}

/**
 * RoundLastBlock 区块 asset 外层模型
 */
@Type.d("RoundLastBlockAssetModel")
export class RoundLastBlockAssetModel
  extends Message<RoundLastBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RoundLastBlockAssetJSON>
{
  @Field.d(1, RoundLastAssetModel)
  roundLastAsset!: RoundLastAssetModel;
  toJSON() {
    return {
      roundLastAsset: this.roundLastAsset.toJSON(),
    };
  }
}
