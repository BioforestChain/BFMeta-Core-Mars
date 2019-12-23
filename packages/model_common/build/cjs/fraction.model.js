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
let Fraction = class Fraction extends protobuf_1.Message {
    toJSON() {
        return {
            numerator: this.numerator,
            denominator: this.denominator,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "int32"),
    __metadata("design:type", Number)
], Fraction.prototype, "numerator", void 0);
__decorate([
    protobuf_1.Field.d(2, "int32"),
    __metadata("design:type", Number)
], Fraction.prototype, "denominator", void 0);
Fraction = __decorate([
    protobuf_1.Type.d("Fraction")
], Fraction);
exports.Fraction = Fraction;
let FractionBigIntModel = class FractionBigIntModel extends protobuf_1.Message {
    toJSON() {
        return {
            numerator: this.numerator,
            denominator: this.denominator,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], FractionBigIntModel.prototype, "numerator", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], FractionBigIntModel.prototype, "denominator", void 0);
FractionBigIntModel = __decorate([
    protobuf_1.Type.d("FractionBigIntModel")
], FractionBigIntModel);
exports.FractionBigIntModel = FractionBigIntModel;
//# sourceMappingURL=fraction.model.js.map