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
var BeExchangeAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const util_decorator_1 = require("@bfchain/util-decorator");
const toExchangeAsset_1 = require("./toExchangeAsset");
const core_model_constants_1 = require("@bfchain/core-model-constants");
const accountSignature_1 = require("./accountSignature");
const SIGNATURE_BUFFER_WM = new WeakMap();
/**
 * exchangeAsset 交易 asset 模型
 *
 */
let BeExchangeAssetModel = BeExchangeAssetModel_1 = class BeExchangeAssetModel extends protobuf_1.Message {
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
    get to() {
        return {
            magic: this.exchangeAsset.toExchangeSource,
            chainName: this.exchangeAsset.toExchangeChainName,
            assetType: this.exchangeAsset.toExchangeAsset,
            amount: this.toExchangeNumber,
        };
    }
    get be() {
        return {
            magic: this.exchangeAsset.beExchangeSource,
            chainName: this.exchangeAsset.beExchangeChainName,
            assetType: this.exchangeAsset.beExchangeAsset,
            amount: this.beExchangeNumber,
        };
    }
    get exchangeRate() {
        return this.exchangeAsset.exchangeRate;
    }
    get toInfo() {
        const info = {
            applyBlockHeight: this.applyBlockHeight,
        };
        // this.numberOfBeginUnfrozenBlocks &&
        //   (info.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
        this.numberOfEffectiveBlocks && (info.numberOfEffectiveBlocks = this.numberOfEffectiveBlocks);
        return info;
    }
    toJSON() {
        const res = {
            transactionSignature: this.transactionSignature,
            applyBlockHeight: this.applyBlockHeight,
            transactionRangeType: this.transactionRangeType,
            transactionRange: this.transactionRange,
            toExchangeNumber: this.toExchangeNumber,
            beExchangeNumber: this.beExchangeNumber,
            exchangeAsset: this.exchangeAsset.toJSON(),
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
BeExchangeAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], BeExchangeAssetModel.prototype, "transactionSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "bytes", "optional"),
    __metadata("design:type", Uint8Array)
], BeExchangeAssetModel.prototype, "ciphertextSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], BeExchangeAssetModel.prototype, "toExchangeNumber", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], BeExchangeAssetModel.prototype, "beExchangeNumber", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], BeExchangeAssetModel.prototype, "applyBlockHeight", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], BeExchangeAssetModel.prototype, "numberOfEffectiveBlocks", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, core_model_constants_1.RANGE_TYPE),
    __metadata("design:type", Number)
], BeExchangeAssetModel.prototype, "transactionRangeType", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, "string", "repeated"),
    __metadata("design:type", Array)
], BeExchangeAssetModel.prototype, "transactionRange", void 0);
__decorate([
    protobuf_1.Field.d(BeExchangeAssetModel_1.INC++, toExchangeAsset_1.ToExchangeAssetModel),
    __metadata("design:type", toExchangeAsset_1.ToExchangeAssetModel)
], BeExchangeAssetModel.prototype, "exchangeAsset", void 0);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], BeExchangeAssetModel.prototype, "to", null);
BeExchangeAssetModel = BeExchangeAssetModel_1 = __decorate([
    protobuf_1.Type.d("BeExchangeAssetModel")
], BeExchangeAssetModel);
exports.BeExchangeAssetModel = BeExchangeAssetModel;
/**
 * exchangeAsset 交易 asset 外层模型
 *
 */
let BeExchangeAssetAssetModel = class BeExchangeAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            beExchangeAsset: this.beExchangeAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, BeExchangeAssetModel),
    __metadata("design:type", BeExchangeAssetModel)
], BeExchangeAssetAssetModel.prototype, "beExchangeAsset", void 0);
BeExchangeAssetAssetModel = __decorate([
    protobuf_1.Type.d("BeExchangeAssetAssetModel")
], BeExchangeAssetAssetModel);
exports.BeExchangeAssetAssetModel = BeExchangeAssetAssetModel;
//# sourceMappingURL=beExchangeAsset.js.map