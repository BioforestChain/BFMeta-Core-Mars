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
var ToExchangeSpecialAssetModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_decorator_1 = require("@bfchain/util-decorator");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const core_model_constants_1 = require("@bfchain/core-model-constants");
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap();
/**
 * toExchangeSpecialAsset 交易 asset 模型
 *
 */
let ToExchangeSpecialAssetModel = ToExchangeSpecialAssetModel_1 = class ToExchangeSpecialAssetModel extends protobuf_1.Message {
    get cipherPublicKeys() {
        const { cipherPublicKeysBuffer: cipherTextsBuffer } = this;
        let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherTextsBuffer);
        if (!cipherTexts) {
            cipherTexts = this.cipherPublicKeysBuffer.map(chiperPublicKeyBuffer => util_encoding_hex_1.getHexFromArrayBuffer(chiperPublicKeyBuffer));
        }
        return cipherTexts;
    }
    set cipherPublicKeys(cipherTextList) {
        const bufList = cipherTextList.map(cipherText => util_encoding_hex_1.parseHexToArrayBuffer(cipherText));
        BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherTextList);
        this.cipherPublicKeysBuffer = bufList;
    }
    // /**可以开始进行交换的区块高度 */
    // @Field.d(ToExchangeSpecialAssetModel.INC++, "uint32", "optional")
    // numberOfBeginUnfrozenBlocks?: number;
    get to() {
        return {
            magic: this.toExchangeSource,
            chainName: this.toExchangeChainName,
            toExchangeAsset: this.toExchangeAsset,
            amount: this.exchangeDirection === core_model_constants_1.EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT
                ? this.exchangeNumber
                : undefined,
        };
    }
    get be() {
        return {
            magic: this.beExchangeSource,
            chainName: this.beExchangeChainName,
            assetType: this.beExchangeAsset,
            amount: this.exchangeDirection === core_model_constants_1.EXCHANGE_DIRECTION.ASSET_FROM_SENDER
                ? this.exchangeNumber
                : undefined,
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
            exchangeNumber: this.exchangeNumber,
            exchangeAssetType: this.exchangeAssetType,
            exchangeDirection: this.exchangeDirection,
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
ToExchangeSpecialAssetModel.INC = 1;
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "bytes", "repeated"),
    __metadata("design:type", Array)
], ToExchangeSpecialAssetModel.prototype, "cipherPublicKeysBuffer", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "toExchangeSource", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "beExchangeSource", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "toExchangeChainName", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "beExchangeChainName", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "toExchangeAsset", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "beExchangeAsset", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, "string"),
    __metadata("design:type", String)
], ToExchangeSpecialAssetModel.prototype, "exchangeNumber", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, core_model_constants_1.SPECIAL_ASSET_TYPE),
    __metadata("design:type", Number)
], ToExchangeSpecialAssetModel.prototype, "exchangeAssetType", void 0);
__decorate([
    protobuf_1.Field.d(ToExchangeSpecialAssetModel_1.INC++, core_model_constants_1.EXCHANGE_DIRECTION),
    __metadata("design:type", Number)
], ToExchangeSpecialAssetModel.prototype, "exchangeDirection", void 0);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ToExchangeSpecialAssetModel.prototype, "to", null);
ToExchangeSpecialAssetModel = ToExchangeSpecialAssetModel_1 = __decorate([
    protobuf_1.Type.d("ToExchangeSpecialAssetModel")
], ToExchangeSpecialAssetModel);
exports.ToExchangeSpecialAssetModel = ToExchangeSpecialAssetModel;
/**
 * toExchangeSpecialAsset 交易 asset 外层模型
 *
 */
let ToExchangeSpecialAssetAssetModel = class ToExchangeSpecialAssetAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            toExchangeSpecialAsset: this.toExchangeSpecialAsset.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, ToExchangeSpecialAssetModel),
    __metadata("design:type", ToExchangeSpecialAssetModel)
], ToExchangeSpecialAssetAssetModel.prototype, "toExchangeSpecialAsset", void 0);
ToExchangeSpecialAssetAssetModel = __decorate([
    protobuf_1.Type.d("ToExchangeSpecialAssetAssetModel")
], ToExchangeSpecialAssetAssetModel);
exports.ToExchangeSpecialAssetAssetModel = ToExchangeSpecialAssetAssetModel;
//# sourceMappingURL=toExchangeSpecialAsset.js.map