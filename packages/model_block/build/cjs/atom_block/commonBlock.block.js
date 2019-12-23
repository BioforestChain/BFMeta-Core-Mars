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
var CommonBlock_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_model_block_base_1 = require("@bfchain/core-model-block-base");
const core_model_block_remark_1 = require("@bfchain/core-model-block-remark");
const protobuf_1 = require("@bfchain/protobuf");
/**
 * commonBlock 区块模型
 *
 */
let CommonBlock = CommonBlock_1 = class CommonBlock extends core_model_block_base_1.Block {
};
__decorate([
    protobuf_1.Field.d(CommonBlock_1.INC++, core_model_block_remark_1.CommonBlockRemarkModel),
    __metadata("design:type", core_model_block_remark_1.CommonBlockRemarkModel)
], CommonBlock.prototype, "remark", void 0);
CommonBlock = CommonBlock_1 = __decorate([
    protobuf_1.Type.d("CommonBlock")
], CommonBlock);
exports.CommonBlock = CommonBlock;
//# sourceMappingURL=commonBlock.block.js.map