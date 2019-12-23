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
var DAppModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const core_model_constants_1 = require("@bfchain/core-model-constants");
let DAppPurchaseAssetModel = class DAppPurchaseAssetModel extends protobuf_1.Message {
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
], DAppPurchaseAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], DAppPurchaseAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(3, "string"),
    __metadata("design:type", String)
], DAppPurchaseAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(4, "string"),
    __metadata("design:type", String)
], DAppPurchaseAssetModel.prototype, "amount", void 0);
DAppPurchaseAssetModel = __decorate([
    protobuf_1.Type.d("DAppPurchaseAssetModel")
], DAppPurchaseAssetModel);
exports.DAppPurchaseAssetModel = DAppPurchaseAssetModel;
/**
 * dapp 交易 asset 模型
 *
 */
let DAppModel = DAppModel_1 = class DAppModel extends protobuf_1.Message {
    toJSON() {
        const res = {
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            dappid: this.dappid,
            type: this.type,
        };
        this.purchaseAsset && (res.purchaseAsset = this.purchaseAsset.toJSON());
        return res;
    }
};
DAppModel.INC = 1;
__decorate([
    protobuf_1.Field.d(DAppModel_1.INC++, "string"),
    __metadata("design:type", String)
], DAppModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(DAppModel_1.INC++, "string"),
    __metadata("design:type", String)
], DAppModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(DAppModel_1.INC++, "string"),
    __metadata("design:type", String)
], DAppModel.prototype, "dappid", void 0);
__decorate([
    protobuf_1.Field.d(DAppModel_1.INC++, core_model_constants_1.DAPP_TYPE),
    __metadata("design:type", Number)
], DAppModel.prototype, "type", void 0);
__decorate([
    protobuf_1.Field.d(DAppModel_1.INC++, DAppPurchaseAssetModel, "optional"),
    __metadata("design:type", DAppPurchaseAssetModel)
], DAppModel.prototype, "purchaseAsset", void 0);
DAppModel = DAppModel_1 = __decorate([
    protobuf_1.Type.d("DAppModel")
], DAppModel);
exports.DAppModel = DAppModel;
/**
 * dapp 交易 asset 外层模型
 *
 */
let DAppAssetModel = class DAppAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            dapp: this.dapp.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, DAppModel),
    __metadata("design:type", DAppModel)
], DAppAssetModel.prototype, "dapp", void 0);
DAppAssetModel = __decorate([
    protobuf_1.Type.d("DAppAssetModel")
], DAppAssetModel);
exports.DAppAssetModel = DAppAssetModel;
//# sourceMappingURL=dapp.js.map