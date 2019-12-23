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
var SignForAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const trustAsset_1 = require("./trustAsset");
const accountSignature_1 = require("./accountSignature");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
/**缓存thirdSignatureList解析结果 */
const BUFFER_LIST_SIGNATURE_LIST_WM = new WeakMap();
const SIGNATURE_BUFFER_WM = new WeakMap();
/**
 * signForAsset 交易 asset 模型
 *
 */
let SignForAssetModel = SignForAssetModel_1 = class SignForAssetModel extends protobuf_1.Message {
    get transactionSignature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.transactionSignatureBuffer);
    }
    set transactionSignature(value) {
        this.transactionSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get thirdPartySignatures() {
        const { signatureBufferList } = this;
        let signatureList = BUFFER_LIST_SIGNATURE_LIST_WM.get(signatureBufferList);
        if (!signatureList) {
            signatureList = this.signatureBufferList.map(buf => {
                const signature = accountSignature_1.AccountSignatureModel.decode(buf);
                SIGNATURE_BUFFER_WM.set(signature, buf);
                return signature;
            });
        }
        return signatureList;
    }
    set thirdPartySignatures(signatureList) {
        const bufList = signatureList.map(signature => {
            let buf = SIGNATURE_BUFFER_WM.get(signature);
            if (!buf) {
                buf = accountSignature_1.AccountSignatureModel.encode(signature).finish();
                SIGNATURE_BUFFER_WM.set(signature, buf);
            }
            return buf;
        });
        BUFFER_LIST_SIGNATURE_LIST_WM.set(bufList, signatureList);
        this.signatureBufferList = bufList;
    }
    getBytes() {
        const props = {
            signatureBufferList: { value: null },
        };
        const assetWrapper = Object.create(this, props);
        return this.$type.encode(assetWrapper).finish();
    }
    toJSON() {
        const res = {
            transactionSignature: this.transactionSignature,
            thirdPartySignatures: this.thirdPartySignatures.map(thirdPartySignature => thirdPartySignature.toJSON()),
            trustSenderId: this.trustSenderId,
            trustRecipientId: this.trustRecipientId,
            trustNumberOfSignFor: this.trustNumberOfSignFor,
            applyBlockHeight: this.applyBlockHeight,
            trustAsset: this.trustAsset.toJSON(),
        };
        // this.numberOfBeginUnfrozenBlocks &&
        //   (res.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
        this.numberOfEffectiveBlocks && (res.numberOfEffectiveBlocks = this.numberOfEffectiveBlocks);
        return res;
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.transactionSignature && (res.transactionSignature = object.transactionSignature);
            const results = [];
            if (object.thirdPartySignatures) {
                const thirdPartySignatures = object.thirdPartySignatures;
                for (const thirdPartySignature of thirdPartySignatures) {
                    results[results.length] = accountSignature_1.AccountSignatureModel.fromObject(thirdPartySignature);
                }
            }
            res.thirdPartySignatures = results;
        }
        return res;
    }
};
SignForAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], SignForAssetModel.prototype, "transactionSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "bytes", "repeated"),
    __metadata("design:type", Array)
], SignForAssetModel.prototype, "signatureBufferList", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], SignForAssetModel.prototype, "trustSenderId", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], SignForAssetModel.prototype, "trustRecipientId", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], SignForAssetModel.prototype, "trustNumberOfSignFor", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], SignForAssetModel.prototype, "applyBlockHeight", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], SignForAssetModel.prototype, "numberOfEffectiveBlocks", void 0);
__decorate([
    protobuf_1.Field.d(SignForAssetModel_1.INC++, trustAsset_1.TrustAssetModel),
    __metadata("design:type", trustAsset_1.TrustAssetModel)
], SignForAssetModel.prototype, "trustAsset", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SignForAssetModel.prototype, "getBytes", null);
SignForAssetModel = SignForAssetModel_1 = __decorate([
    protobuf_1.Type.d("SignForAssetModel")
], SignForAssetModel);
exports.SignForAssetModel = SignForAssetModel;
/**
 * signForAsset 交易 asset 外层模型
 *
 */
let SignForAssetAssetModel = class SignForAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            signForAsset: this.signForAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, SignForAssetModel),
    __metadata("design:type", SignForAssetModel)
], SignForAssetAssetModel.prototype, "signForAsset", void 0);
SignForAssetAssetModel = __decorate([
    protobuf_1.Type.d("SignForAssetAssetModel")
], SignForAssetAssetModel);
exports.SignForAssetAssetModel = SignForAssetAssetModel;
//# sourceMappingURL=signForAsset.js.map