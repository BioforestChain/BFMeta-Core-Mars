import { Message } from "@bfchain/protobuf";
import { RECORD_TYPE } from "@bfchain/core-model-constants";
export declare class LocationNameRecordInfo extends Message<LocationNameRecordInfo> implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameRecordJSON> {
    recordType: RECORD_TYPE;
    recordValue: string;
    toJSON(): {
        recordType: RECORD_TYPE;
        recordValue: string;
    };
}
