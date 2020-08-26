import { Message, Field, Type } from "@bfchain/protobuf";
import { LocationNameRecordInfo } from "./locationNameRecord";
import { RECORD_OPERATION_TYPE } from "@bfchain/core-model-constants";

/**
 * setLnsRecordValue 交易 asset 模型
 *
 */
@Type.d("SetLnsRecordValueModel")
export class SetLnsRecordValueModel
  extends Message<SetLnsRecordValueModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsRecordValueJSON> {
  static INC = 1;
  /**欲设置记录值的链域名 */
  @Field.d(SetLnsRecordValueModel.INC++, "string")
  name!: string;
  /**欲设置记录值的链域名所属的链名称 */
  @Field.d(SetLnsRecordValueModel.INC++, "string")
  sourceChainName!: string;
  /**欲设置记录值的链域名所属网络标识符 */
  @Field.d(SetLnsRecordValueModel.INC++, "string")
  sourceChainMagic!: string;
  /**解析操作类型 */
  @Field.d(SetLnsRecordValueModel.INC++, RECORD_OPERATION_TYPE)
  operationType!: RECORD_OPERATION_TYPE;
  /**添加解析值 */
  @Field.d(SetLnsRecordValueModel.INC++, LocationNameRecordInfo, "optional")
  addRecord?: LocationNameRecordInfo;
  /**删除解析值 */
  @Field.d(SetLnsRecordValueModel.INC++, LocationNameRecordInfo, "optional")
  deleteRecord?: LocationNameRecordInfo;
  toJSON() {
    const res: BFChainCore.SetLnsRecordValueJSON = {
      name: this.name,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      operationType: this.operationType,
    };
    this.addRecord && (res.addRecord = this.addRecord.toJSON());
    this.deleteRecord && (res.deleteRecord = this.deleteRecord.toJSON());

    return res;
  }
}

/**
 * setLnsRecordValue 交易 asset 外层模型
 *
 */
@Type.d("SetLnsRecordValueAssetModel")
export class SetLnsRecordValueAssetModel
  extends Message<SetLnsRecordValueAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsRecordValueAssetJSON> {
  @Field.d(1, SetLnsRecordValueModel)
  lnsRecordValue!: SetLnsRecordValueModel;
  toJSON() {
    return {
      lnsRecordValue: this.lnsRecordValue.toJSON(),
    };
  }
}
