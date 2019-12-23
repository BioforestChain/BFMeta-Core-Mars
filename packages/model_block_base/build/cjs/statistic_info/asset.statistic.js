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
var AssetStatisticModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const core_model_common_1 = require("@bfchain/core-model-common");
const countAndAmount_statistic_1 = require("./countAndAmount.statistic");
let AssetStatisticModel = AssetStatisticModel_1 = class AssetStatisticModel extends protobuf_1.Message {
    get typeStatisticMap() {
        return (this._typeStatisticMap ||
            (this._typeStatisticMap = new core_model_common_1.StringKeyMap(this.typeStatisticHashMap)));
    }
    toJSON() {
        return {
            magic: this.magic,
            assetType: this.assetType,
            index: this.index,
            typeStatisticHashMap: this.typeStatisticHashMap,
            total: this.total.toJSON(),
        };
    }
    static fromObject(object) {
        if (!object.total) {
            object = Object.create(object, {
                total: {},
            });
        }
        const res = super.fromObject(object);
        return res;
    }
};
AssetStatisticModel.INC = 1;
__decorate([
    protobuf_1.Field.d(AssetStatisticModel_1.INC++, "string"),
    __metadata("design:type", String)
], AssetStatisticModel.prototype, "magic", void 0);
__decorate([
    protobuf_1.Field.d(AssetStatisticModel_1.INC++, "string"),
    __metadata("design:type", String)
], AssetStatisticModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(AssetStatisticModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], AssetStatisticModel.prototype, "index", void 0);
__decorate([
    protobuf_1.MapField.d(AssetStatisticModel_1.INC++, "string", countAndAmount_statistic_1.CountAndAmountStatisticModel),
    __metadata("design:type", Object)
], AssetStatisticModel.prototype, "typeStatisticHashMap", void 0);
__decorate([
    protobuf_1.Field.d(AssetStatisticModel_1.INC++, countAndAmount_statistic_1.CountAndAmountStatisticModel),
    __metadata("design:type", countAndAmount_statistic_1.CountAndAmountStatisticModel)
], AssetStatisticModel.prototype, "total", void 0);
AssetStatisticModel = AssetStatisticModel_1 = __decorate([
    protobuf_1.Type.d("AssetStatisticModel")
], AssetStatisticModel);
exports.AssetStatisticModel = AssetStatisticModel;
//# sourceMappingURL=asset.statistic.js.map