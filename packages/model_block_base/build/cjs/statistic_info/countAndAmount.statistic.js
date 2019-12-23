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
var CountAndAmountStatisticModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
let CountAndAmountStatisticModel = CountAndAmountStatisticModel_1 = class CountAndAmountStatisticModel extends protobuf_1.Message {
    toJSON() {
        return {
            changeAmount: this.changeAmount,
            changeCount: this.changeCount,
            moveAmount: this.moveAmount,
            transactionCount: this.transactionCount,
        };
    }
};
CountAndAmountStatisticModel.INC = 1;
__decorate([
    protobuf_1.Field.d(CountAndAmountStatisticModel_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], CountAndAmountStatisticModel.prototype, "changeAmount", void 0);
__decorate([
    protobuf_1.Field.d(CountAndAmountStatisticModel_1.INC++, "uint32", "required", 0),
    __metadata("design:type", Number)
], CountAndAmountStatisticModel.prototype, "changeCount", void 0);
__decorate([
    protobuf_1.Field.d(CountAndAmountStatisticModel_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], CountAndAmountStatisticModel.prototype, "moveAmount", void 0);
__decorate([
    protobuf_1.Field.d(CountAndAmountStatisticModel_1.INC++, "uint32", "required", 0),
    __metadata("design:type", Number)
], CountAndAmountStatisticModel.prototype, "transactionCount", void 0);
CountAndAmountStatisticModel = CountAndAmountStatisticModel_1 = __decorate([
    protobuf_1.Type.d("CountAndAmountStatisticModel")
], CountAndAmountStatisticModel);
exports.CountAndAmountStatisticModel = CountAndAmountStatisticModel;
//# sourceMappingURL=countAndAmount.statistic.js.map