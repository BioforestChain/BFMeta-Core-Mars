"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ErrorMessage_1, CommonResponse_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const constants_1 = require("./constants");
let ErrorMessage = ErrorMessage_1 = class ErrorMessage extends protobuf_1.Message {
    constructor() {
        super(...arguments);
        this._parsed_detail = false;
    }
    get detail() {
        if (!this._parsed_detail) {
            this._parsed_detail = true;
            this._detail = JSON.parse(this.detailJSON);
        }
        return this._detail;
    }
    set detail(v) {
        this.detailJSON = JSON.stringify(v);
        this._detail = v;
        this._parsed_detail = true;
    }
    static fromException(exc) {
        const excMsg = ErrorMessage_1.fromObject(exc);
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
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "message", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "detailJSON", void 0);
__decorate([
    protobuf_1.Field.d(3, "string", "optional"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "PLATFORM", void 0);
__decorate([
    protobuf_1.Field.d(4, "string", "optional"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "CHANNEL", void 0);
__decorate([
    protobuf_1.Field.d(5, "string", "optional"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "BUSINESS", void 0);
__decorate([
    protobuf_1.Field.d(6, "string", "optional"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "MODULE", void 0);
__decorate([
    protobuf_1.Field.d(7, "string", "optional"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "FILE", void 0);
__decorate([
    protobuf_1.Field.d(8, "string", "optional"),
    __metadata("design:type", String)
], ErrorMessage.prototype, "CODE", void 0);
ErrorMessage = ErrorMessage_1 = __decorate([
    protobuf_1.Type.d("ExceptionMessage")
], ErrorMessage);
exports.ErrorMessage = ErrorMessage;
let common_response_field_acc_index = 1;
function getCommonResponseFieldAccIndex() {
    return common_response_field_acc_index;
}
exports.getCommonResponseFieldAccIndex = getCommonResponseFieldAccIndex;
/**
 * 通用的响应的返回值
 */
let CommonResponse = CommonResponse_1 = class CommonResponse extends protobuf_1.Message {
    toJSON() {
        const res = { status: this.status };
        if (this.error) {
            res.error = this.error.toJSON();
        }
        return res;
    }
};
CommonResponse.INC = 1;
__decorate([
    protobuf_1.Field.d(CommonResponse_1.INC++, constants_1.RESPONSE_STATUS),
    __metadata("design:type", Number)
], CommonResponse.prototype, "status", void 0);
__decorate([
    protobuf_1.Field.d(CommonResponse_1.INC++, ErrorMessage, "optional"),
    __metadata("design:type", ErrorMessage)
], CommonResponse.prototype, "error", void 0);
CommonResponse = CommonResponse_1 = __decorate([
    protobuf_1.Type.d("CommonResponse")
], CommonResponse);
exports.CommonResponse = CommonResponse;
//# sourceMappingURL=common.chainChannel.model.js.map