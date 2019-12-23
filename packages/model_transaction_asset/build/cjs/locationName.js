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
const core_model_constants_1 = require("@bfchain/core-model-constants");
/**
 * locationName 交易 asset 模型
 *
 */
let LocationNameInfo = class LocationNameInfo extends protobuf_1.Message {
    toJSON() {
        return {
            name: this.name,
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            operationType: this.operationType,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], LocationNameInfo.prototype, "name", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], LocationNameInfo.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(3, "string"),
    __metadata("design:type", String)
], LocationNameInfo.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(4, core_model_constants_1.LOCATION_NAME_OPERATION_TYPE),
    __metadata("design:type", Number)
], LocationNameInfo.prototype, "operationType", void 0);
LocationNameInfo = __decorate([
    protobuf_1.Type.d("LocationNameInfo")
], LocationNameInfo);
exports.LocationNameInfo = LocationNameInfo;
/**
 * locationName 交易 asset 模型
 *
 */
let LocationNameAssetModel = class LocationNameAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            locationName: this.locationName.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, LocationNameInfo),
    __metadata("design:type", LocationNameInfo)
], LocationNameAssetModel.prototype, "locationName", void 0);
LocationNameAssetModel = __decorate([
    protobuf_1.Type.d("LocationNameAssetModel")
], LocationNameAssetModel);
exports.LocationNameAssetModel = LocationNameAssetModel;
//# sourceMappingURL=locationName.js.map