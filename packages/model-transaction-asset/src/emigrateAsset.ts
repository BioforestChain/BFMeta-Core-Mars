import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * emigrate 交易 asset 模型
 *
 */
@Type.d("EmigrateAssetModel")
export class EmigrateAssetModel
  extends Message<EmigrateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetJSON>
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
 * emigrateAsset 交易 asset 外层模型
 *
 */
@Type.d("EmigrateAssetAssetModel")
export class EmigrateAssetAssetModel
  extends Message<EmigrateAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetAssetJSON>
{
  @Field.d(1, EmigrateAssetModel)
  emigrateAsset!: EmigrateAssetModel;
  toJSON() {
    return {
      emigrateAsset: this.emigrateAsset.toJSON(),
    };
  }
}
