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
 * issueAsset 交易 asset 模型
 *
 */
let IssueAssetModel = class IssueAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            assetType: this.assetType,
            expectedIssuedAssets: this.expectedIssuedAssets,
            genesisAddress: this.genesisAddress,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], IssueAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], IssueAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(3, "string"),
    __metadata("design:type", String)
], IssueAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(4, "string"),
    __metadata("design:type", String)
], IssueAssetModel.prototype, "expectedIssuedAssets", void 0);
__decorate([
    protobuf_1.Field.d(5, "string"),
    __metadata("design:type", String)
], IssueAssetModel.prototype, "genesisAddress", void 0);
IssueAssetModel = __decorate([
    protobuf_1.Type.d("IssueAssetModel")
], IssueAssetModel);
exports.IssueAssetModel = IssueAssetModel;
/**
 * issueAsset 交易 asset 外层模型
 *
 */
let IssueAssetAssetModel = class IssueAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            issueAsset: this.issueAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, IssueAssetModel),
    __metadata("design:type", IssueAssetModel)
], IssueAssetAssetModel.prototype, "issueAsset", void 0);
IssueAssetAssetModel = __decorate([
    protobuf_1.Type.d("IssueAssetAssetModel")
], IssueAssetAssetModel);
exports.IssueAssetAssetModel = IssueAssetAssetModel;
//# sourceMappingURL=issueAsset.js.map