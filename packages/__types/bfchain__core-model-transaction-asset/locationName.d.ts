import { Message } from "@bfchain/protobuf";
import { LOCATION_NAME_OPERATION_TYPE } from "@bfchain/core-model-constants";
export declare class LocationNameInfo extends Message<LocationNameInfo> implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameJSON> {
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    operationType: LOCATION_NAME_OPERATION_TYPE;
    toJSON(): {
        name: string;
        sourceChainName: string;
        sourceChainMagic: string;
        operationType: LOCATION_NAME_OPERATION_TYPE;
    };
}
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
