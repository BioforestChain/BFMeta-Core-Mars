import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * CustomAsset 类型
 *
 */

@Type.d("CustomModel")
export class CustomModel extends Message<CustomModel>
  implements BFChainUtil.JSONAble<BFChainCore.CustomJSON> {
  @Field.d(2, "string")
  type!: string;
  @Field.d(1, "string")
  data!: string;

  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }
}

/**
 * 自定义 交易 asset 外层模型
 *
 */
@Type.d("CustomAssetModel")
export class CustomAssetModel extends Message<CustomAssetModel>
  implements BFChainUtil.JSONAble<BFChainCore.CustomAssetJSON> {
  @Field.d(1, CustomModel)
  custom!: CustomModel;
  toJSON() {
    return {
      custom: this.custom.toJSON(),
    };
  }
}
