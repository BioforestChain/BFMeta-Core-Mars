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
var BeExchangeSpecialAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const toExchangeSpecialAsset_1 = require("./toExchangeSpecialAsset");
const core_model_constants_1 = require("@bfchain/core-model-constants");
const accountSignature_1 = require("./accountSignature");
const SIGNATURE_BUFFER_WM = new WeakMap();
/**
 * exchangeSpecialAsset 交易 asset 模型
 *
 */
let BeExchangeSpecialAssetModel = BeExchangeSpecialAssetModel_1 = class BeExchangeSpecialAssetModel extends protobuf_1.Message {
    get transactionSignature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.transactionSignatureBuffer);
    }
    set transactionSignature(value) {
        this.transactionSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
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
            transactionSignature: this.transactionSignature,
            applyBlockHeight: this.applyBlockHeight,
            transactionRangeType: this.transactionRangeType,
            transactionRange: this.transactionRange,
            exchangeSpecialAsset: this.exchangeSpecialAsset.toJSON(),
        };
        // this.numberOfBeginUnfrozenBlocks &&
        //   (res.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
        this.numberOfEffectiveBlocks && (res.numberOfEffectiveBlocks = this.numberOfEffectiveBlocks);
        this.ciphertextSignatureBuffer && (res.ciphertextSignature = this.ciphertextSignature.toJSON());
        return res;
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.transactionSignature && (res.transactionSignature = object.transactionSignature);
            object.ciphertextSignature &&
                (res.ciphertextSignature = accountSignature_1.AccountSignatureModel.fromObject(object.ciphertextSignature));
        }
        return res;
    }
};
BeExchangeSpecialAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], BeExchangeSpecialAssetModel.prototype, "transactionSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, "bytes", "optional"),
    __metadata("design:type", Uint8Array)
], BeExchangeSpecialAssetModel.prototype, "ciphertextSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], BeExchangeSpecialAssetModel.prototype, "applyBlockHeight", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], BeExchangeSpecialAssetModel.prototype, "numberOfEffectiveBlocks", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, core_model_constants_1.RANGE_TYPE),
    __metadata("design:type", Number)
], BeExchangeSpecialAssetModel.prototype, "transactionRangeType", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, "string", "repeated"),
    __metadata("design:type", Array)
], BeExchangeSpecialAssetModel.prototype, "transactionRange", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetModel_1.INC++, toExchangeSpecialAsset_1.ToExchangeSpecialAssetModel),
    __metadata("design:type", toExchangeSpecialAsset_1.ToExchangeSpecialAssetModel)
], BeExchangeSpecialAssetModel.prototype, "exchangeSpecialAsset", void 0);
BeExchangeSpecialAssetModel = BeExchangeSpecialAssetModel_1 = __decorate([
    protobuf_1.Type.d("BeExchangeSpecialAssetModel")
], BeExchangeSpecialAssetModel);
exports.BeExchangeSpecialAssetModel = BeExchangeSpecialAssetModel;
/**
 * exchangeSpecialAsset 交易 asset 外层模型
 *
 */
let BeExchangeSpecialAssetAssetModel = class BeExchangeSpecialAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            beExchangeSpecialAsset: this.beExchangeSpecialAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, BeExchangeSpecialAssetModel),
    __metadata("design:type", BeExchangeSpecialAssetModel)
], BeExchangeSpecialAssetAssetModel.prototype, "beExchangeSpecialAsset", void 0);
BeExchangeSpecialAssetAssetModel = __decorate([
    protobuf_1.Type.d("BeExchangeSpecialAssetAssetModel")
], BeExchangeSpecialAssetAssetModel);
exports.BeExchangeSpecialAssetAssetModel = BeExchangeSpecialAssetAssetModel;
//# sourceMappingURL=beExchangeSpecialAsset.js.map