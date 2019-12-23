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
var TrustAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
/**
 * trustAsset 交易 asset 模型
 *
 */
let TrustAssetModel = TrustAssetModel_1 = class TrustAssetModel extends protobuf_1.Message {
    toJSON() {
        const res = {
            trustees: this.trustees,
            numberOfSignFor: this.numberOfSignFor,
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            assetType: this.assetType,
            amount: this.amount,
        };
        // this.numberOfBeginUnfrozenBlocks &&
        //   (res.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
        return res;
    }
};
TrustAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(TrustAssetModel_1.INC++, "string", "repeated"),
    __metadata("design:type", Array)
], TrustAssetModel.prototype, "trustees", void 0);
__decorate([
    protobuf_1.Field.d(TrustAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], TrustAssetModel.prototype, "numberOfSignFor", void 0);
__decorate([
    protobuf_1.Field.d(TrustAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], TrustAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(TrustAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], TrustAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(TrustAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], TrustAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(TrustAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], TrustAssetModel.prototype, "amount", void 0);
TrustAssetModel = TrustAssetModel_1 = __decorate([
    protobuf_1.Type.d("TrustAssetModel")
], TrustAssetModel);
exports.TrustAssetModel = TrustAssetModel;
/**
 * trustAsset 交易 asset 外层模型
 *
 */
let TrustAssetAssetModel = class TrustAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            trustAsset: this.trustAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, TrustAssetModel),
    __metadata("design:type", TrustAssetModel)
], TrustAssetAssetModel.prototype, "trustAsset", void 0);
TrustAssetAssetModel = __decorate([
    protobuf_1.Type.d("TrustAssetAssetModel")
], TrustAssetAssetModel);
exports.TrustAssetAssetModel = TrustAssetAssetModel;
//# sourceMappingURL=trustAsset.js.map