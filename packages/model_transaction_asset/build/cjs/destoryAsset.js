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
/**
 * destoryAsset 交易 asset 模型
 *
 */
let DestoryAssetModel = class DestoryAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            assetType: this.assetType,
            amount: this.amount,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], DestoryAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], DestoryAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(3, "string"),
    __metadata("design:type", String)
], DestoryAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(4, "string"),
    __metadata("design:type", String)
], DestoryAssetModel.prototype, "amount", void 0);
DestoryAssetModel = __decorate([
    protobuf_1.Type.d("DestoryAssetModel")
], DestoryAssetModel);
exports.DestoryAssetModel = DestoryAssetModel;
/**
 * destoryAsset 交易 asset 外层模型
 *
 */
let DestoryAssetAssetModel = class DestoryAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            destoryAsset: this.destoryAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, DestoryAssetModel),
    __metadata("design:type", DestoryAssetModel)
], DestoryAssetAssetModel.prototype, "destoryAsset", void 0);
DestoryAssetAssetModel = __decorate([
    protobuf_1.Type.d("DestoryAssetAssetModel")
], DestoryAssetAssetModel);
exports.DestoryAssetAssetModel = DestoryAssetAssetModel;
//# sourceMappingURL=destoryAsset.js.map