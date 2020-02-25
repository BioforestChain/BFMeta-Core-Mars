import { Message } from "@bfchain/protobuf";
import type { Exception } from "@bfchain/util-exception";
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
export declare class CommonResponse extends Message<CommonResponse> implements BFChainCore.JSONToModelType<BFChainCore.CommonResponseJSON> {
    static INC: number;
    status: RESPONSE_STATUS;
    error?: ErrorMessage;
    toJSON(): BFChainCore.CommonResponseJSON;
}
