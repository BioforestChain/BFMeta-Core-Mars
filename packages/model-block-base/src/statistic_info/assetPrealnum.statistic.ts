import { Message, Field, Type, MapField } from "@bfchain/protobuf";

@Type.d("AssetPrealnumModel")
export class AssetPrealnumModel extends Message<AssetPrealnumModel>
  implements BFChainCore.JSONToModelType<BFChainCore.AssetPrealnumJSON> {
  static INC = 1;
  @Field.d(AssetPrealnumModel.INC++, "string")
  magic!: string;
  @Field.d(AssetPrealnumModel.INC++, "string")
  assetType!: string;
  @Field.d(AssetPrealnumModel.INC++, "string")
  remainAssetPrealnum!: string;
  @Field.d(AssetPrealnumModel.INC++, "string")
  frozenMainAssetPrealnum!: string;

  toJSON() {
    return {
      magic: this.magic,
      assetType: this.assetType,
      remainAssetPrealnum: this.remainAssetPrealnum,
      frozenMainAssetPrealnum: this.frozenMainAssetPrealnum,
    };
  }
}
