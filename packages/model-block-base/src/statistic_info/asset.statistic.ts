import { StringKeyMap } from "@bfchain/core-model-common";
import { Message, Field, Type, MapField } from "@bfchain/protobuf";
import { assetStatisticformat } from "./assetStatisticformat";
import { CountAndAmountStatisticModel } from "./countAndAmount.statistic";

@Type.d("AssetStatisticModel")
export class AssetStatisticModel
  extends Message<AssetStatisticModel>
  implements BFChainCore.JSONToModelType<BFChainCore.AssetStatisticJSON>
{
  static INC = 1;
  @MapField.d(AssetStatisticModel.INC++, "string", CountAndAmountStatisticModel)
  typeStatisticHashMap!: { [baseType: string]: CountAndAmountStatisticModel };
  _typeStatisticMap?: StringKeyMap<CountAndAmountStatisticModel>;
  get typeStatisticMap() {
    return (
      this._typeStatisticMap ||
      (this._typeStatisticMap = new StringKeyMap<CountAndAmountStatisticModel>(
        this.typeStatisticHashMap,
      ))
    );
  }
  @Field.d(AssetStatisticModel.INC++, CountAndAmountStatisticModel)
  total!: CountAndAmountStatisticModel;

  toJSON() {
    return {
      typeStatisticHashMap: this.typeStatisticMap.toJSON(),
      total: this.total.toJSON(),
    };
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<AssetStatisticModel>,
  ) {
    if (!object.total) {
      object = Object.create(object, {
        total: {},
      });
    }
    const res = super.fromObject(object) as AssetStatisticModel;
    return res as unknown as T;
  }

  format() {
    assetStatisticformat(this.typeStatisticHashMap, this.typeStatisticMap, (argv) => argv);
    return this;
  }
}

@Type.d("AssetTypeAssetStatisticModel")
export class AssetTypeAssetStatisticModel
  extends Message<AssetTypeAssetStatisticModel>
  implements BFChainCore.JSONToModelType<BFChainCore.AssetTypeAssetStatisticJSON>
{
  static INC = 1;
  @MapField.d(AssetTypeAssetStatisticModel.INC++, "string", AssetStatisticModel)
  assetTypeTypeStatisticHashMap!: { [assetType: string]: AssetStatisticModel };
  _assetTypeTypeStatisticMap?: StringKeyMap<AssetStatisticModel>;
  get assetTypeTypeStatisticMap() {
    return (
      this._assetTypeTypeStatisticMap ||
      (this._assetTypeTypeStatisticMap = new StringKeyMap<AssetStatisticModel>(
        this.assetTypeTypeStatisticHashMap,
      ))
    );
  }

  toJSON() {
    return {
      assetTypeTypeStatisticHashMap: this.assetTypeTypeStatisticMap.toJSON(),
    };
  }

  format() {
    assetStatisticformat(
      this.assetTypeTypeStatisticHashMap,
      this.assetTypeTypeStatisticMap,
      (argv) => argv.format(),
    );
    return this;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<AssetTypeAssetStatisticModel>,
  ) {
    const res = super.fromObject(object) as AssetTypeAssetStatisticModel;
    return res as unknown as T;
  }
}
