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
var GiftAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const core_model_constants_1 = require("@bfchain/core-model-constants");
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap();
/**
 * giftAsset 交易 asset 模型
 *
 */
let GiftAssetModel = GiftAssetModel_1 = class GiftAssetModel extends protobuf_1.Message {
    get cipherPublicKeys() {
        const { cipherPublicKeysBuffer } = this;
        let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherPublicKeysBuffer);
        if (!cipherTexts) {
            cipherTexts = this.cipherPublicKeysBuffer.map(chiperPublicKeyBuffer => util_encoding_hex_1.getHexFromArrayBuffer(chiperPublicKeyBuffer));
        }
        return cipherTexts;
    }
    set cipherPublicKeys(cipherPublicKeyList) {
        const bufList = cipherPublicKeyList.map(cipherText => util_encoding_hex_1.parseHexToArrayBuffer(cipherText));
        BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherPublicKeyList);
        this.cipherPublicKeysBuffer = bufList;
    }
    toJSON() {
        const res = {
            cipherPublicKeys: this.cipherPublicKeys,
            sourceChainMagic: this.sourceChainMagic,
            sourceChainName: this.sourceChainName,
            assetType: this.assetType,
            amount: this.amount,
            totalGrabableTimes: this.totalGrabableTimes,
            // unitReserveFee: this.unitReserveFee,
            giftDistributionRule: this.giftDistributionRule,
        };
        this.numberOfBeginUnfrozenBlocks &&
            (res.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
        return res;
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
        }
        return res;
    }
};
GiftAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "bytes", "repeated"),
    __metadata("design:type", Array)
], GiftAssetModel.prototype, "cipherPublicKeysBuffer", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], GiftAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], GiftAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], GiftAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], GiftAssetModel.prototype, "amount", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GiftAssetModel.prototype, "totalGrabableTimes", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], GiftAssetModel.prototype, "numberOfBeginUnfrozenBlocks", void 0);
__decorate([
    protobuf_1.Field.d(GiftAssetModel_1.INC++, core_model_constants_1.GIFT_DISTRIBUTION_RULE),
    __metadata("design:type", Number)
], GiftAssetModel.prototype, "giftDistributionRule", void 0);
GiftAssetModel = GiftAssetModel_1 = __decorate([
    protobuf_1.Type.d("GiftAssetModel")
], GiftAssetModel);
exports.GiftAssetModel = GiftAssetModel;
/**
 * giftAsset 交易 asset 外层模型
 *
 */
let GiftAssetAssetModel = class GiftAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            giftAsset: this.giftAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, GiftAssetModel),
    __metadata("design:type", GiftAssetModel)
], GiftAssetAssetModel.prototype, "giftAsset", void 0);
GiftAssetAssetModel = __decorate([
    protobuf_1.Type.d("GiftAssetAssetModel")
], GiftAssetAssetModel);
exports.GiftAssetAssetModel = GiftAssetAssetModel;
//# sourceMappingURL=giftAsset.js.map