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
 * transferAsset 交易 asset 模型
 *
 */
let TransferAssetModel = class TransferAssetModel extends protobuf_1.Message {
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
], TransferAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], TransferAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(3, "string"),
    __metadata("design:type", String)
], TransferAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(4, "string"),
    __metadata("design:type", String)
], TransferAssetModel.prototype, "amount", void 0);
TransferAssetModel = __decorate([
    protobuf_1.Type.d("TransferAssetModel")
], TransferAssetModel);
exports.TransferAssetModel = TransferAssetModel;
/**
 * transferAsset 交易 asset 外层模型
 *
 */
let TransferAssetAssetModel = class TransferAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            transferAsset: this.transferAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, TransferAssetModel),
    __metadata("design:type", TransferAssetModel)
], TransferAssetAssetModel.prototype, "transferAsset", void 0);
TransferAssetAssetModel = __decorate([
    protobuf_1.Type.d("TransferAssetAssetModel")
], TransferAssetAssetModel);
exports.TransferAssetAssetModel = TransferAssetAssetModel;
//# sourceMappingURL=transferAsset.js.map