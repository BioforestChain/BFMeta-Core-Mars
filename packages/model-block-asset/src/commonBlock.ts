import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { Message, Type, Field } from "@bfchain/protobuf";

/**
 * CommonBlock 区块 asset 外层模型
 */
@Type.d("CommonAssetModel")
export class CommonAssetModel
  extends Message<CommonAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.CommonAssetJSON>
{
  static INC = 1;
  /**块内资产变动账户生成的 hash */
  @Field.d(CommonAssetModel.INC++, "string")
  assetChangeHash!: string;
  toJSON() {
    const res: BFChainCore.CommonAssetJSON = {
      assetChangeHash: this.assetChangeHash,
    };
    return res;
  }
  @cacheBytesGetter
  getBytes() {
    return this.$type.encode(this).finish();
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<CommonAssetModel>,
  ) {
    const res = super.fromObject(object) as CommonAssetModel;
    if (res !== object) {
      object.assetChangeHash && (res.assetChangeHash = object.assetChangeHash);
    }
    return res as unknown as T;
  }
}

/**
 * CommonBlock 区块 asset 外层模型
 */
@Type.d("CommonBlockAssetModel")
export class CommonBlockAssetModel
  extends Message<CommonBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.CommonBlockAssetJSON>
{
  @Field.d(1, CommonAssetModel)
  commonAsset!: CommonAssetModel;
  toJSON() {
    return {
      commonAsset: this.commonAsset.toJSON(),
    };
  }
}
