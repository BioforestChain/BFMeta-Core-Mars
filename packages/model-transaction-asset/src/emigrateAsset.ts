import { Message, Field, Type } from "@bfchain/protobuf";
import { MigrateCertificateModel } from "@bfchain/core-model-common";

/**
 * emigrateAsset 交易 asset 外层模型
 *
 */
@Type.d("EmigrateAssetAssetModel")
export class EmigrateAssetAssetModel
  extends Message<EmigrateAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetAssetJSON>
{
  @Field.d(1, MigrateCertificateModel)
  emigrateAsset!: MigrateCertificateModel;
  toJSON() {
    return {
      emigrateAsset: this.emigrateAsset.toJSON(),
    };
  }
}
