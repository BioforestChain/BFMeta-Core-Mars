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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var ResponseModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
require("./@types");
const protobuf_1 = require("@bfchain/protobuf");
const constants_1 = require("./constants");
typeof Promise.resolve().then(() => __importStar(require("@bfchain/core-model-block")));
__export(require("./constants"));
__export(require("./common.chainChannel.model"));
__export(require("./transaction.chainChannel.model"));
__export(require("./block.chainChannel.model"));
__export(require("./peer.chainChannel.model"));
// let _inc = 0;
let ResponseModel = ResponseModel_1 = class ResponseModel extends protobuf_1.Message {
};
ResponseModel.INC = 1;
__decorate([
    protobuf_1.Field.d(ResponseModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ResponseModel.prototype, "version", void 0);
__decorate([
    protobuf_1.Field.d(ResponseModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ResponseModel.prototype, "req_id", void 0);
__decorate([
    protobuf_1.Field.d(ResponseModel_1.INC++, constants_1.DUPLEX_API_CMD),
    __metadata("design:type", Number)
], ResponseModel.prototype, "cmd", void 0);
__decorate([
    protobuf_1.Field.d(ResponseModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], ResponseModel.prototype, "binary", void 0);
ResponseModel = ResponseModel_1 = __decorate([
    protobuf_1.Type.d("ResponseModel")
], ResponseModel);
exports.ResponseModel = ResponseModel;
//# sourceMappingURL=index.js.map