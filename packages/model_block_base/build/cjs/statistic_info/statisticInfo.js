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
var StatisticInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const core_model_common_1 = require("@bfchain/core-model-common");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
const asset_statistic_1 = require("./asset.statistic");
/**
 * 区块资产统计信息
 *
 */
let StatisticInfoModel = StatisticInfoModel_1 = class StatisticInfoModel extends protobuf_1.Message {
    get assetStatisticMap() {
        return (this._assetStatisticMap ||
            (this._assetStatisticMap = new core_model_common_1.NumberKeyMap(this.assetStatisticHashMap)));
    }
    toJSON() {
        return {
            totalFee: this.totalFee,
            totalAsset: this.totalAsset,
            totalChainAsset: this.totalChainAsset,
            totalAccount: this.totalAccount,
            assetStatisticHashMap: this.assetStatisticMap.toJSON(),
        };
    }
    getBytes() {
        return super.getBytes();
    }
};
StatisticInfoModel.INC = 1;
__decorate([
    protobuf_1.Field.d(StatisticInfoModel_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], StatisticInfoModel.prototype, "totalFee", void 0);
__decorate([
    protobuf_1.Field.d(StatisticInfoModel_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], StatisticInfoModel.prototype, "totalAsset", void 0);
__decorate([
    protobuf_1.Field.d(StatisticInfoModel_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], StatisticInfoModel.prototype, "totalChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(StatisticInfoModel_1.INC++, "uint32", "required", 0),
    __metadata("design:type", Number)
], StatisticInfoModel.prototype, "totalAccount", void 0);
__decorate([
    protobuf_1.MapField.d(StatisticInfoModel_1.INC++, "uint32", asset_statistic_1.AssetStatisticModel),
    __metadata("design:type", Object)
], StatisticInfoModel.prototype, "assetStatisticHashMap", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticInfoModel.prototype, "getBytes", null);
StatisticInfoModel = StatisticInfoModel_1 = __decorate([
    protobuf_1.Type.d("StatisticInfoModel")
], StatisticInfoModel);
exports.StatisticInfoModel = StatisticInfoModel;
//# sourceMappingURL=statisticInfo.js.map