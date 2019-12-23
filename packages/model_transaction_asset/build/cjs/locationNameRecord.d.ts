import { Message } from "@bfchain/protobuf";
import { RECORD_TYPE } from "@bfchain/core-model-constants";
/**
 * LocationNameRecordInfo 模型
 *
 */
export declare class LocationNameRecordInfo extends Message<LocationNameRecordInfo> implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameRecordJSON> {
    /**记录类型 */
    recordType: RECORD_TYPE;
    /**记录值 */
    recordValue: string;
    toJSON(): {
        recordType: RECORD_TYPE;
        recordValue: string;
    };
}
//# sourceMappingURL=locationNameRecord.d.ts.map