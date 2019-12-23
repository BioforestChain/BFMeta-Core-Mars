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
require("./@types");
const protobuf_1 = require("@bfchain/protobuf");
/**范围模型 */
let RangeModel = class RangeModel extends protobuf_1.Message {
    toJSON() {
        return {
            start: this.start,
            end: this.end,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "uint32"),
    __metadata("design:type", Number)
], RangeModel.prototype, "start", void 0);
__decorate([
    protobuf_1.Field.d(2, "uint32"),
    __metadata("design:type", Number)
], RangeModel.prototype, "end", void 0);
RangeModel = __decorate([
    protobuf_1.Type.d("Range")
], RangeModel);
exports.RangeModel = RangeModel;
//# sourceMappingURL=range.model.js.map