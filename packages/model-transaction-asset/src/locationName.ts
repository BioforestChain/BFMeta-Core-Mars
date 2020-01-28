import { Message, Field, Type } from "@bfchain/protobuf";
import { LOCATION_NAME_OPERATION_TYPE } from "@bfchain/core-model-constants";

/**
 * locationName 交易 asset 模型
 *
 */
@Type.d("LocationNameInfo")
export class LocationNameInfo extends Message<LocationNameInfo>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameJSON> {
  /**链域名 */
  @Field.d(1, "string")
  name!: string;
  /**链域名所属的链名称 */
  @Field.d(2, "string")
  sourceChainName!: string;
  /**链域名所属的链网络标识符 */
  @Field.d(3, "string")
  sourceChainMagic!: string;
  @Field.d(4, LOCATION_NAME_OPERATION_TYPE)
  operationType!: LOCATION_NAME_OPERATION_TYPE;
  toJSON() {
    return {
      name: this.name,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      operationType: this.operationType,
    };
  }
}

/**
 * locationName 交易 asset 模型
 *
 */
@Type.d("LocationNameAssetModel")
export class LocationNameAssetModel extends Message<LocationNameAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameAssetJSON> {
  @Field.d(1, LocationNameInfo)
  locationName!: LocationNameInfo;
  toJSON() {
    return {
      locationName: this.locationName.toJSON(),
    };
  }
}
