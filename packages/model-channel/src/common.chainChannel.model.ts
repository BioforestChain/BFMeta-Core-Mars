import { Message, Type, Field } from "@bfchain/protobuf";
import { Exception } from "@bfchain/util-exception";
import { RESPONSE_STATUS } from "./constants";

@Type.d("ExceptionMessage")
export class ErrorMessage<D = any> extends Message<ErrorMessage>
  implements BFChainCore.JSONToModelType<BFChainCore.ErrorMessageJSON> {
  @Field.d(1, "string")
  message!: string;
  @Field.d(2, "string")
  detailJSON!: string;
  private _parsed_detail = false;
  private _detail!: D;
  get detail() {
    if (!this._parsed_detail) {
      this._parsed_detail = true;
      this._detail = JSON.parse(this.detailJSON);
    }
    return this._detail;
  }
  set detail(v: any) {
    this.detailJSON = JSON.stringify(v);
    this._detail = v;
    this._parsed_detail = true;
  }
  @Field.d(3, "string", "optional")
  PLATFORM?: string;
  @Field.d(4, "string", "optional")
  CHANNEL?: string;
  @Field.d(5, "string", "optional")
  BUSINESS?: string;
  @Field.d(6, "string", "optional")
  MODULE?: string;
  @Field.d(7, "string", "optional")
  FILE?: string;
  @Field.d(8, "string", "optional")
  CODE?: string;
  static fromException(exc: Exception) {
    const excMsg = ErrorMessage.fromObject(exc);
    excMsg.detail = exc.detail;
    return excMsg;
  }
  toJSON() {
    return {
      message: this.message,
      detailJSON: this.detailJSON,
      PLATFORM: this.PLATFORM,
      CHANNEL: this.CHANNEL,
      BUSINESS: this.BUSINESS,
      MODULE: this.MODULE,
      FILE: this.FILE,
      CODE: this.CODE,
    };
  }
}
let common_response_field_acc_index = 1;
export function getCommonResponseFieldAccIndex() {
  return common_response_field_acc_index;
}

/**
 * 通用的响应的返回值
 */
@Type.d("CommonResponse")
export class CommonResponse extends Message<CommonResponse>
  implements BFChainCore.JSONToModelType<BFChainCore.CommonResponseJSON> {
  static INC = 1;
  /**响应状态 */
  @Field.d(CommonResponse.INC++, RESPONSE_STATUS)
  status!: RESPONSE_STATUS;
  /**错误信息 */
  @Field.d(CommonResponse.INC++, ErrorMessage, "optional")
  error?: ErrorMessage;
  toJSON() {
    const res: BFChainCore.CommonResponseJSON = { status: this.status };
    if (this.error) {
      res.error = this.error.toJSON();
    }
    return res;
  }
}
