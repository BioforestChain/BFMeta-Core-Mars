import { Message } from "@bfchain/protobuf";
import { LocationNameRecordInfo } from "./locationNameRecord";
import { RECORD_OPERATION_TYPE } from "@bfchain/core-model-constants";
/**
 * setLnsRecordValue 交易 asset 模型
 *
 */
export declare class SetLnsRecordValueModel extends Message<SetLnsRecordValueModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsRecordValueJSON> {
    static INC: number;
    /**欲设置记录值的链域名 */
    name: string;
    /**欲设置记录值的链域名所属的链名称 */
    sourceChainName: string;
    /**欲设置记录值的链域名所属网络标识符 */
    sourceChainMagic: string;
    /**解析操作类型 */
    operationType: RECORD_OPERATION_TYPE;
    /**添加解析值 */
    addRecord?: LocationNameRecordInfo;
    /**删除解析值 */
    deleteRecord?: LocationNameRecordInfo;
    toJSON(): BFChainCore.SetLnsRecordValueJSON;
}
/**
 * setLnsRecordValue 交易 asset 外层模型
 *
 */
export declare class SetLnsRecordValueAssetModel extends Message<SetLnsRecordValueAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsRecordValueAssetJSON> {
    lnsRecordValue: SetLnsRecordValueModel;
    toJSON(): {
        lnsRecordValue: BFChainCore.SetLnsRecordValueJSON;
    };
}
//# sourceMappingURL=setLnsRecordValue.d.ts.map