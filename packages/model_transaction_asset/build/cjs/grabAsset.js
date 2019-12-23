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
var GrabAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const giftAsset_1 = require("./giftAsset");
const core_model_constants_1 = require("@bfchain/core-model-constants");
const accountSignature_1 = require("./accountSignature");
const SIGNATURE_BUFFER_WM = new WeakMap();
/**
 * grabAsset 交易 asset 模型
 *
 */
let GrabAssetModel = GrabAssetModel_1 = class GrabAssetModel extends protobuf_1.Message {
    get blockSignature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.blockSignatureBuffer);
    }
    set blockSignature(value) {
        this.blockSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get transactionSignature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.giftTransactionSignatureBuffer);
    }
    set transactionSignature(value) {
        this.giftTransactionSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get ciphertextSignature() {
        const { ciphertextSignatureBuffer } = this;
        const signature = accountSignature_1.AccountSignatureModel.decode(ciphertextSignatureBuffer);
        SIGNATURE_BUFFER_WM.set(signature, ciphertextSignatureBuffer);
        return signature;
    }
    set ciphertextSignature(signature) {
        let buf = SIGNATURE_BUFFER_WM.get(signature);
        if (!buf) {
            buf = accountSignature_1.AccountSignatureModel.encode(signature).finish();
            SIGNATURE_BUFFER_WM.set(signature, buf);
        }
        this.ciphertextSignatureBuffer = buf;
    }
    toJSON() {
        const res = {
            blockSignature: this.blockSignature,
            transactionSignature: this.transactionSignature,
            transactionRangeType: this.transactionRangeType,
            transactionRange: this.transactionRange,
            applyBlockHeight: this.applyBlockHeight,
            amount: this.amount,
            giftAsset: this.giftAsset.toJSON(),
        };
        this.numberOfBeginUnfrozenBlocks &&
            (res.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
        this.numberOfEffectiveBlocks && (res.numberOfEffectiveBlocks = this.numberOfEffectiveBlocks);
        this.ciphertextSignatureBuffer && (res.ciphertextSignature = this.ciphertextSignature.toJSON());
        return res;
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.blockSignature && (res.blockSignature = object.blockSignature);
            object.transactionSignature && (res.transactionSignature = object.transactionSignature);
            object.ciphertextSignature &&
                (res.ciphertextSignature = accountSignature_1.AccountSignatureModel.fromObject(object.ciphertextSignature));
        }
        return res;
    }
};
GrabAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], GrabAssetModel.prototype, "blockSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], GrabAssetModel.prototype, "giftTransactionSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], GrabAssetModel.prototype, "amount", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "bytes", "optional"),
    __metadata("design:type", Uint8Array)
], GrabAssetModel.prototype, "ciphertextSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, core_model_constants_1.RANGE_TYPE),
    __metadata("design:type", Number)
], GrabAssetModel.prototype, "transactionRangeType", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "string", "repeated"),
    __metadata("design:type", Array)
], GrabAssetModel.prototype, "transactionRange", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GrabAssetModel.prototype, "applyBlockHeight", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], GrabAssetModel.prototype, "numberOfBeginUnfrozenBlocks", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], GrabAssetModel.prototype, "numberOfEffectiveBlocks", void 0);
__decorate([
    protobuf_1.Field.d(GrabAssetModel_1.INC++, giftAsset_1.GiftAssetModel),
    __metadata("design:type", giftAsset_1.GiftAssetModel)
], GrabAssetModel.prototype, "giftAsset", void 0);
GrabAssetModel = GrabAssetModel_1 = __decorate([
    protobuf_1.Type.d("GrabAssetModel")
], GrabAssetModel);
exports.GrabAssetModel = GrabAssetModel;
/**
 * grabAsset 交易 asset 外层模型
 *
 */
let GrabAssetAssetModel = class GrabAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            grabAsset: this.grabAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, GrabAssetModel),
    __metadata("design:type", GrabAssetModel)
], GrabAssetAssetModel.prototype, "grabAsset", void 0);
GrabAssetAssetModel = __decorate([
    protobuf_1.Type.d("GrabAssetAssetModel")
], GrabAssetAssetModel);
exports.GrabAssetAssetModel = GrabAssetAssetModel;
//# sourceMappingURL=grabAsset.js.map