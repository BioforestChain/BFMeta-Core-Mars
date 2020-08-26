import { Message, Field, Type, MapField } from "@bfchain/protobuf";
import { StringKeyMap } from "@bfchain/core-model-common";
import { CountAndAmountStatisticModel } from "./countAndAmount.statistic";

@Type.d("AssetStatisticModel")
export class AssetStatisticModel
  extends Message<AssetStatisticModel>
  implements BFChainCore.JSONToModelType<BFChainCore.AssetStatisticJSON> {
  static INC = 1;
  @Field.d(AssetStatisticModel.INC++, "string")
  magic!: string;
  @Field.d(AssetStatisticModel.INC++, "string")
  assetType!: string;
  @Field.d(AssetStatisticModel.INC++, "uint32")
  index!: number;
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
      magic: this.magic,
      assetType: this.assetType,
      index: this.index,
      typeStatisticHashMap: this.typeStatisticHashMap,
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
    return (res as unknown) as T;
  }
}
