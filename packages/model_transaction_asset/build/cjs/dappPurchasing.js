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
var DAppPurchasingModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const dapp_1 = require("./dapp");
/**
 * dappPurchasing 交易 asset 模型
 *
 */
let DAppPurchasingModel = DAppPurchasingModel_1 = class DAppPurchasingModel extends protobuf_1.Message {
    toJSON() {
        return {
            dappPossessor: this.dappPossessor,
            dappAsset: this.dappAsset.toJSON(),
        };
    }
};
DAppPurchasingModel.INC = 1;
__decorate([
    protobuf_1.Field.d(DAppPurchasingModel_1.INC++, "string"),
    __metadata("design:type", String)
], DAppPurchasingModel.prototype, "dappPossessor", void 0);
__decorate([
    protobuf_1.Field.d(DAppPurchasingModel_1.INC++, dapp_1.DAppModel),
    __metadata("design:type", dapp_1.DAppModel)
], DAppPurchasingModel.prototype, "dappAsset", void 0);
DAppPurchasingModel = DAppPurchasingModel_1 = __decorate([
    protobuf_1.Type.d("DAppPurchasingModel")
], DAppPurchasingModel);
exports.DAppPurchasingModel = DAppPurchasingModel;
/**
 * dappPurchasing 交易 asset 外层模型
 *
 */
let DAppPurchasingAssetModel = class DAppPurchasingAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            dappPurchasing: this.dappPurchasing.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, DAppPurchasingModel),
    __metadata("design:type", DAppPurchasingModel)
], DAppPurchasingAssetModel.prototype, "dappPurchasing", void 0);
DAppPurchasingAssetModel = __decorate([
    protobuf_1.Type.d("DAppPurchasingAssetModel")
], DAppPurchasingAssetModel);
exports.DAppPurchasingAssetModel = DAppPurchasingAssetModel;
//# sourceMappingURL=dappPurchasing.js.map