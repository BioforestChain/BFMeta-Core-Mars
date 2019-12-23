import { Message } from "@bfchain/protobuf";
import { Exception } from "@bfchain/util-exception";
import { RESPONSE_STATUS } from "./constants";
export declare class ErrorMessage<D = any> extends Message<ErrorMessage> implements BFChainCore.JSONToModelType<BFChainCore.ErrorMessageJSON> {
    message: string;
    detailJSON: string;
    private _parsed_detail;
    private _detail;
    get detail(): any;
    set detail(v: any);
    PLATFORM?: string;
    CHANNEL?: string;
    BUSINESS?: string;
    MODULE?: string;
    FILE?: string;
    CODE?: string;
    static fromException(exc: Exception): ErrorMessage<unknown>;
    toJSON(): {
        message: string;
        detailJSON: string;
        PLATFORM: string | undefined;
        CHANNEL: string | undefined;
        BUSINESS: string | undefined;
        MODULE: string | undefined;
        FILE: string | undefined;
        CODE: string | undefined;
    };
}
export declare function getCommonResponseFieldAccIndex(): number;
/**
 * 通用的响应的返回值
 */
export declare class CommonResponse extends Message<CommonResponse> implements BFChainCore.JSONToModelType<BFChainCore.CommonResponseJSON> {
    static INC: number;
    /**响应状态 */
    status: RESPONSE_STATUS;
    /**错误信息 */
    error?: ErrorMessage;
    toJSON(): BFChainCore.CommonResponseJSON;
}
//# sourceMappingURL=common.chainChannel.model.d.ts.map