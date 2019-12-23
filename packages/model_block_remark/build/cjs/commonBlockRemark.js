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
var CommonBlockRemarkModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
let CommonBlockRemarkModel = CommonBlockRemarkModel_1 = class CommonBlockRemarkModel extends protobuf_1.Message {
    toJSON() {
        return {
            debug: this.debug,
            info: this.info,
            blockParticipation: this.blockParticipation,
        };
    }
};
CommonBlockRemarkModel.INC = 1;
__decorate([
    protobuf_1.Field.d(CommonBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], CommonBlockRemarkModel.prototype, "debug", void 0);
__decorate([
    protobuf_1.Field.d(CommonBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], CommonBlockRemarkModel.prototype, "info", void 0);
__decorate([
    protobuf_1.Field.d(CommonBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], CommonBlockRemarkModel.prototype, "blockParticipation", void 0);
CommonBlockRemarkModel = CommonBlockRemarkModel_1 = __decorate([
    protobuf_1.Type.d("CommonBlockRemarkModel")
], CommonBlockRemarkModel);
exports.CommonBlockRemarkModel = CommonBlockRemarkModel;
//# sourceMappingURL=commonBlockRemark.js.map