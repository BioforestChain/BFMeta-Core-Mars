import { Message, Field, Type } from "@bfchain/protobuf";
import { RECORD_TYPE } from "@bfchain/core-model-constants";

/**
 * LocationNameRecordInfo 模型
 *
 */
@Type.d("LocationNameRecordInfo")
export class LocationNameRecordInfo
  extends Message<LocationNameRecordInfo>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.LocationNameRecordJSON> {
  /**记录类型 */
  @Field.d(1, "string")
  recordType!: RECORD_TYPE;
  /**记录值 */
  @Field.d(2, "string")
  recordValue!: string;
  toJSON() {
    return {
      recordType: this.recordType,
      recordValue: this.recordValue,
    };
  }
}
