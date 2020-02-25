import { Message } from "@bfchain/protobuf";
import { LocationNameRecordInfo } from "./locationNameRecord";
import { RECORD_OPERATION_TYPE } from "@bfchain/core-model-constants";
export declare class SetLnsRecordValueModel extends Message<SetLnsRecordValueModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsRecordValueJSON> {
    static INC: number;
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    operationType: RECORD_OPERATION_TYPE;
    addRecord?: LocationNameRecordInfo;
    deleteRecord?: LocationNameRecordInfo;
    toJSON(): BFChainCore.SetLnsRecordValueJSON;
}
export declare class SetLnsRecordValueAssetModel extends Message<SetLnsRecordValueAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsRecordValueAssetJSON> {
    lnsRecordValue: SetLnsRecordValueModel;
    toJSON(): {
        lnsRecordValue: BFChainCore.SetLnsRecordValueJSON;
    };
}
