import { Message, Field, Type } from "@bfchain/protobuf";
import { MigrateCertificateModel } from "@bfchain/core-model-common";

/**
 * immigrateAsset 交易 asset 外层模型
 *
 */
@Type.d("ImmigrateAssetAssetModel")
export class ImmigrateAssetAssetModel
  extends Message<ImmigrateAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetAssetJSON>
{
  @Field.d(1, MigrateCertificateModel)
  immigrateAsset!: MigrateCertificateModel;
  toJSON() {
    return {
      immigrateAsset: this.immigrateAsset.toJSON(),
    };
  }
}
