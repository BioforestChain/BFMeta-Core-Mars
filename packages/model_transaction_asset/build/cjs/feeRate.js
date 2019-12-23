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
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const core_model_common_1 = require("@bfchain/core-model-common");
/**
 * FeeRateModel 模型
 *
 */
let FeeRateModel = class FeeRateModel extends protobuf_1.Message {
    toJSON() {
        return {
            senderPaidFeeRate: this.senderPaidFeeRate.toJSON(),
            recipientPaidFeeRate: this.recipientPaidFeeRate.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], FeeRateModel.prototype, "senderPaidFeeRate", void 0);
__decorate([
    protobuf_1.Field.d(2, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], FeeRateModel.prototype, "recipientPaidFeeRate", void 0);
FeeRateModel = __decorate([
    protobuf_1.Type.d("FeeRateModel")
], FeeRateModel);
exports.FeeRateModel = FeeRateModel;
//# sourceMappingURL=feeRate.js.map