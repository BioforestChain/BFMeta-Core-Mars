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
var RoundLastBlockRemarkModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const roundDelegateRemark_1 = require("./roundDelegateRemark");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
let RoundLastBlockRemarkModel = RoundLastBlockRemarkModel_1 = class RoundLastBlockRemarkModel extends roundDelegateRemark_1.RoundDelegateRemarkModel {
    get hash() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.hashBuffer);
    }
    set hash(value) {
        this.hashBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    toJSON() {
        return Object.assign(super.toJSON(), {
            debug: this.debug,
            info: this.info,
            blockParticipation: this.blockParticipation,
            hash: this.hash,
        });
    }
    getBytes() {
        return this.$type.encode(this).finish();
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.hash && (res.hash = object.hash);
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(RoundLastBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], RoundLastBlockRemarkModel.prototype, "debug", void 0);
__decorate([
    protobuf_1.Field.d(RoundLastBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], RoundLastBlockRemarkModel.prototype, "info", void 0);
__decorate([
    protobuf_1.Field.d(RoundLastBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], RoundLastBlockRemarkModel.prototype, "blockParticipation", void 0);
__decorate([
    protobuf_1.Field.d(RoundLastBlockRemarkModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], RoundLastBlockRemarkModel.prototype, "hashBuffer", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoundLastBlockRemarkModel.prototype, "getBytes", null);
RoundLastBlockRemarkModel = RoundLastBlockRemarkModel_1 = __decorate([
    protobuf_1.Type.d("RoundLastBlockRemarkModel")
], RoundLastBlockRemarkModel);
exports.RoundLastBlockRemarkModel = RoundLastBlockRemarkModel;
//# sourceMappingURL=roundLastBlockRemark.js.map