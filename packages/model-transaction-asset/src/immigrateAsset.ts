import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * immigrateAsset 交易 asset 模型
 *
 */
@Type.d("ImmigrateAssetModel")
export class ImmigrateAssetModel
  extends Message<ImmigrateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetJSON>
{
  /**迁移凭证信息 */
  @Field.d(1, "string")
  migrateCertificate!: string;
  toJSON() {
    return {
      migrateCertificate: this.migrateCertificate,
    };
  }
}

/**
 * immigrateAsset 交易 asset 外层模型
 *
 */
@Type.d("ImmigrateAssetAssetModel")
export class ImmigrateAssetAssetModel
  extends Message<ImmigrateAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetAssetJSON>
{
  @Field.d(1, ImmigrateAssetModel)
  immigrateAsset!: ImmigrateAssetModel;
  toJSON() {
    return {
      immigrateAsset: this.immigrateAsset.toJSON(),
    };
  }
}
