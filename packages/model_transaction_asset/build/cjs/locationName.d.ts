import { Message } from "@bfchain/protobuf";
import { LOCATION_NAME_OPERATION_TYPE } from "@bfchain/core-model-constants";
/**
 * locationName 交易 asset 模型
 *
 */
export declare class LocationNameInfo extends Message<LocationNameInfo> implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameJSON> {
    /**链域名 */
    name: string;
    /**链域名所属的链名称 */
    sourceChainName: string;
    /**链域名所属的链网络标识符 */
    sourceChainMagic: string;
    operationType: LOCATION_NAME_OPERATION_TYPE;
    toJSON(): {
        name: string;
        sourceChainName: string;
        sourceChainMagic: string;
        operationType: LOCATION_NAME_OPERATION_TYPE;
    };
}
/**
 * locationName 交易 asset 模型
 *
 */
export declare class LocationNameAssetModel extends Message<LocationNameAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameAssetJSON> {
    locationName: LocationNameInfo;
    toJSON(): {
        locationName: {
            name: string;
            sourceChainName: string;
            sourceChainMagic: string;
            operationType: LOCATION_NAME_OPERATION_TYPE;
        };
    };
}
//# sourceMappingURL=locationName.d.ts.map