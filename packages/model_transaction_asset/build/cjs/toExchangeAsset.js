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
var ToExchangeAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const core_model_common_1 = require("@bfchain/core-model-common");
const util_decorator_1 = require("@bfchain/util-decorator");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap();
/**
 * exchangeAsset 交易 asset 模型
 *
 */
let ToExchangeAssetModel = ToExchangeAssetModel_1 = class ToExchangeAssetModel extends protobuf_1.Message {
    get cipherPublicKeys() {
        const { cipherPublicKeysBuffer } = this;
        let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherPublicKeysBuffer);
        if (!cipherTexts) {
            cipherTexts = Object.freeze(cipherPublicKeysBuffer.map(chiperTextBuffer => util_encoding_hex_1.getHexFromArrayBuffer(chiperTextBuffer)));
            BUFFER_LIST_PUBLICKEY_LIST_WM.set(cipherPublicKeysBuffer, cipherTexts);
        }
        return cipherTexts;
    }
    set cipherPublicKeys(cipherTextList) {
        const bufList = [];
        for (const cipherText of cipherTextList) {
            bufList.push(util_encoding_hex_1.parseHexToArrayBuffer(cipherText));
        }
        if (Object.isFrozen(cipherTextList)) {
            BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherTextList);
        }
        this.cipherPublicKeysBuffer = bufList;
    }
    // /**可以开始进行交换的区块高度 */
    // @Field.d(ToExchangeAssetModel.INC++, "uint32", "optional")
    // numberOfBeginUnfrozenBlocks?: number;
    get to() {
        return {
            magic: this.toExchangeSource,
            chainName: this.toExchangeChainName,
            assetType: this.toExchangeAsset,
            amount: this.toExchangeNumber,
        };
    }
    get be() {
        return {
            magic: this.beExchangeSource,
            chainName: this.beExchangeChainName,
            assetType: this.beExchangeAsset,
        };
    }
    toJSON() {
        return {
            cipherPublicKeys: this.cipherPublicKeys,
            toExchangeSource: this.toExchangeSource,
            beExchangeSource: this.beExchangeSource,
            toExchangeChainName: this.toExchangeChainName,
            beExchangeChainName: this.beExchangeChainName,
            toExchangeAsset: this.toExchangeAsset,
            beExchangeAsset: this.beExchangeAsset,
            toExchangeNumber: this.toExchangeNumber,
            exchangeRate: this.exchangeRate.toJSON(),
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
        }
        return res;
    }
};
ToExchangeAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "bytes", "repeated"),
    __metadata("design:type", Array)
], ToExchangeAssetModel.prototype, "cipherPublicKeysBuffer", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "toExchangeSource", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "beExchangeSource", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "toExchangeChainName", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "beExchangeChainName", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "toExchangeAsset", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "beExchangeAsset", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeAssetModel.prototype, "toExchangeNumber", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeAssetModel_1.INC++, core_model_common_1.RateModel),
    __metadata("design:type", core_model_common_1.RateModel)
], ToExchangeAssetModel.prototype, "exchangeRate", void 0);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ToExchangeAssetModel.prototype, "to", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ToExchangeAssetModel.prototype, "be", null);
ToExchangeAssetModel = ToExchangeAssetModel_1 = __decorate([
    protobuf_1.Type.d("ToExchangeAssetModel")
], ToExchangeAssetModel);
exports.ToExchangeAssetModel = ToExchangeAssetModel;
/**
 * exchangeAsset 交易 asset 外层模型
 *
 */
let ToExchangeAssetAssetModel = class ToExchangeAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            toExchangeAsset: this.toExchangeAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, ToExchangeAssetModel),
    __metadata("design:type", ToExchangeAssetModel)
], ToExchangeAssetAssetModel.prototype, "toExchangeAsset", void 0);
ToExchangeAssetAssetModel = __decorate([
    protobuf_1.Type.d("ToExchangeAssetAssetModel")
], ToExchangeAssetAssetModel);
exports.ToExchangeAssetAssetModel = ToExchangeAssetAssetModel;
//# sourceMappingURL=toExchangeAsset.js.map