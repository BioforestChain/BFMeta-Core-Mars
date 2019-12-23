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
var TransactionAssetChangeModel_1, TransactionInBlock_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
const someTransaction_1 = require("./someTransaction");
var TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
(function (TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE) {
    TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE[TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE["SENDER"] = 0] = "SENDER";
    /**
     * 现在`recipient`是一个数组，这里应该说是`1+`的正整数
     */
    TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE[TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE["RECIPIENT"] = 1] = "RECIPIENT";
})(TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE = exports.TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE || (exports.TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE = {}));
let TransactionAssetChangeModel = TransactionAssetChangeModel_1 = class TransactionAssetChangeModel extends protobuf_1.Message {
    toJSON() {
        return {
            accountType: this.accountType,
            assetTypes: this.assetTypes,
            assetBalance: this.assetBalance,
        };
    }
    getBytes() {
        const props = {};
        const trsWrapper = Object.create(this, props);
        const bytes = this.$type.encode(trsWrapper).finish();
        return bytes;
    }
};
TransactionAssetChangeModel.INC = 1;
__decorate([
    protobuf_1.Field.d(TransactionAssetChangeModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], TransactionAssetChangeModel.prototype, "accountType", void 0);
__decorate([
    protobuf_1.Field.d(TransactionAssetChangeModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], TransactionAssetChangeModel.prototype, "assetTypes", void 0);
__decorate([
    protobuf_1.Field.d(TransactionAssetChangeModel_1.INC++, "string"),
    __metadata("design:type", String)
], TransactionAssetChangeModel.prototype, "assetBalance", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionAssetChangeModel.prototype, "getBytes", null);
TransactionAssetChangeModel = TransactionAssetChangeModel_1 = __decorate([
    protobuf_1.Type.d("TransactionAssetChangeModel")
], TransactionAssetChangeModel);
exports.TransactionAssetChangeModel = TransactionAssetChangeModel;
/**交易与其在区块中的下标 */
let TransactionInBlock = TransactionInBlock_1 = class TransactionInBlock extends someTransaction_1.SomeTransactionModel {
    get signature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.signatureBuffer);
    }
    set signature(value) {
        this.signatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    getBytes(skipSignature) {
        const props = {};
        if (skipSignature) {
            props.signatureBuffer = { value: null };
        }
        const trsWrapper = Object.create(this, props);
        const bytes = this.$type.encode(trsWrapper).finish();
        return bytes;
    }
    toJSON() {
        return Object.assign({
            index: this.index,
            height: this.height,
            transactionAssetChanges: this.transactionAssetChanges.map(transactionAssetChange => transactionAssetChange.toJSON()),
            signature: this.signature,
        }, super.toJSON());
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (object !== res) {
            object.signature && (res.signature = object.signature);
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(TransactionInBlock_1.INC++, "uint32"),
    __metadata("design:type", Number)
], TransactionInBlock.prototype, "index", void 0);
__decorate([
    protobuf_1.Field.d(TransactionInBlock_1.INC++, "uint32"),
    __metadata("design:type", Number)
], TransactionInBlock.prototype, "height", void 0);
__decorate([
    protobuf_1.Field.d(TransactionInBlock_1.INC++, TransactionAssetChangeModel, "repeated"),
    __metadata("design:type", Array)
], TransactionInBlock.prototype, "transactionAssetChanges", void 0);
__decorate([
    protobuf_1.Field.d(TransactionInBlock_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], TransactionInBlock.prototype, "signatureBuffer", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", void 0)
], TransactionInBlock.prototype, "getBytes", null);
TransactionInBlock = TransactionInBlock_1 = __decorate([
    protobuf_1.Type.d("TransactionInBlock")
], TransactionInBlock);
exports.TransactionInBlock = TransactionInBlock;
//# sourceMappingURL=transactionInBlock.js.map