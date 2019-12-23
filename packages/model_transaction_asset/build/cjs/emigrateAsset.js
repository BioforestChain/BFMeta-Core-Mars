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
var EmigrateAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const accountSignature_1 = require("./accountSignature");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
const SIGNATURE_BUFFER_WM = new WeakMap();
/**
 * emigrateAsset 交易 asset 模型
 *
 */
let EmigrateAssetModel = EmigrateAssetModel_1 = class EmigrateAssetModel extends protobuf_1.Message {
    get genesisDelegateSignature() {
        const { genesisDelegateSignatureBuffer: genesisDelegateSignatureBuffer } = this;
        const signature = accountSignature_1.AccountSignatureModel.decode(genesisDelegateSignatureBuffer);
        SIGNATURE_BUFFER_WM.set(signature, genesisDelegateSignatureBuffer);
        return signature;
    }
    set genesisDelegateSignature(signature) {
        let buf = SIGNATURE_BUFFER_WM.get(signature);
        if (!buf) {
            buf = accountSignature_1.AccountSignatureModel.encode(signature).finish();
            SIGNATURE_BUFFER_WM.set(signature, buf);
        }
        this.genesisDelegateSignatureBuffer = buf;
    }
    getBytes() {
        const props = {
            genesisDelegateSignatureBuffer: { value: null },
        };
        const assetWrapper = Object.create(this, props);
        return this.$type.encode(assetWrapper).finish();
    }
    toJSON() {
        return {
            genesisDelegateSignature: this.genesisDelegateSignature.toJSON(),
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            assetType: this.assetType,
            amount: this.amount,
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.genesisDelegateSignature &&
                (res.genesisDelegateSignature = accountSignature_1.AccountSignatureModel.fromObject(object.genesisDelegateSignature));
        }
        return res;
    }
};
EmigrateAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(EmigrateAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], EmigrateAssetModel.prototype, "genesisDelegateSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(EmigrateAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], EmigrateAssetModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(EmigrateAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], EmigrateAssetModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(EmigrateAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], EmigrateAssetModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(EmigrateAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], EmigrateAssetModel.prototype, "amount", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmigrateAssetModel.prototype, "getBytes", null);
EmigrateAssetModel = EmigrateAssetModel_1 = __decorate([
    protobuf_1.Type.d("EmigrateAssetModel")
], EmigrateAssetModel);
exports.EmigrateAssetModel = EmigrateAssetModel;
/**
 * emigrateAsset 交易 asset 外层模型
 *
 */
let EmigrateAssetAssetModel = class EmigrateAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            emigrateAsset: this.emigrateAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, EmigrateAssetModel),
    __metadata("design:type", EmigrateAssetModel)
], EmigrateAssetAssetModel.prototype, "emigrateAsset", void 0);
EmigrateAssetAssetModel = __decorate([
    protobuf_1.Type.d("EmigrateAssetAssetModel")
], EmigrateAssetAssetModel);
exports.EmigrateAssetAssetModel = EmigrateAssetAssetModel;
//# sourceMappingURL=emigrateAsset.js.map