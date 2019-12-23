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
var ImmigrateAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
// import { EmigrateAssetTransaction } from "../../model/src/transactionModel/emigrateAsset.transaction";
const accountSignature_1 = require("./accountSignature");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
const SIGNATURE_BUFFER_WM = new WeakMap();
/**
 * immigrateAsset 交易 asset 模型
 *
 */
let ImmigrateAssetModel = ImmigrateAssetModel_1 = class ImmigrateAssetModel extends protobuf_1.Message {
    get genesisDelegateSignature() {
        const { genesisDelegateSignatureBuffer } = this;
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
            emigrateAssetTransaction: this.emigrateAssetTransaction.toJSON(),
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
ImmigrateAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(ImmigrateAssetModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], ImmigrateAssetModel.prototype, "genesisDelegateSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(ImmigrateAssetModel_1.INC++, "EmigrateAssetTransaction"),
    __metadata("design:type", Object)
], ImmigrateAssetModel.prototype, "emigrateAssetTransaction", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ImmigrateAssetModel.prototype, "getBytes", null);
ImmigrateAssetModel = ImmigrateAssetModel_1 = __decorate([
    protobuf_1.Type.d("ImmigrateAssetModel")
], ImmigrateAssetModel);
exports.ImmigrateAssetModel = ImmigrateAssetModel;
/**
 * immigrateAsset 交易 asset 外层模型
 *
 */
let ImmigrateAssetAssetModel = class ImmigrateAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            immigrateAsset: this.immigrateAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, ImmigrateAssetModel),
    __metadata("design:type", ImmigrateAssetModel)
], ImmigrateAssetAssetModel.prototype, "immigrateAsset", void 0);
ImmigrateAssetAssetModel = __decorate([
    protobuf_1.Type.d("ImmigrateAssetAssetModel")
], ImmigrateAssetAssetModel);
exports.ImmigrateAssetAssetModel = ImmigrateAssetAssetModel;
//# sourceMappingURL=immigrateAsset.js.map