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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var TransactionBaseStorageModel_1, Transaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const core_model_common_1 = require("@bfchain/core-model-common");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
const core_model_constants_1 = require("@bfchain/core-model-constants");
typeof Promise.resolve().then(() => __importStar(require("@bfchain/util")));
typeof Promise.resolve().then(() => __importStar(require("@bfchain/core-typings")));
// 不放在前面模型找不到
let TransactionBaseStorageModel = TransactionBaseStorageModel_1 = class TransactionBaseStorageModel extends protobuf_1.Message {
    toJSON() {
        return {
            key: this.key,
            value: this.value,
        };
    }
};
TransactionBaseStorageModel.INC = 1;
__decorate([
    protobuf_1.Field.d(TransactionBaseStorageModel_1.INC++, "string"),
    __metadata("design:type", String)
], TransactionBaseStorageModel.prototype, "key", void 0);
__decorate([
    protobuf_1.Field.d(TransactionBaseStorageModel_1.INC++, "string"),
    __metadata("design:type", String)
], TransactionBaseStorageModel.prototype, "value", void 0);
TransactionBaseStorageModel = TransactionBaseStorageModel_1 = __decorate([
    protobuf_1.Type.d("TransactionBaseStorageModel")
], TransactionBaseStorageModel);
exports.TransactionBaseStorageModel = TransactionBaseStorageModel;
let Transaction = Transaction_1 = class Transaction extends protobuf_1.Message {
    /**交易的 id */
    get id() {
        return this.signature;
    }
    get senderPublicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.senderPublicKeyBuffer);
    }
    set senderPublicKey(value) {
        this.senderPublicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get senderSecondPublicKey() {
        return ((this.senderSecondPublicKeyBuffer &&
            util_encoding_hex_1.getHexFromArrayBuffer(this.senderSecondPublicKeyBuffer)) ||
            undefined);
    }
    set senderSecondPublicKey(value) {
        /// 空字符串也当成undefined处理
        this.senderSecondPublicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get signature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.signatureBuffer);
    }
    set signature(value) {
        this.signatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get storageKey() {
        return this.storage && this.storage.key;
    }
    get storageValue() {
        return this.storage && this.storage.value;
    }
    get signSignature() {
        return ((this.signSignatureBuffer && util_encoding_hex_1.getHexFromArrayBuffer(this.signSignatureBuffer)) || undefined);
    }
    set signSignature(value) {
        /// 空字符串也当成undefined处理
        this.signSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get remarkMap() {
        if (!this._remarkMap) {
            this._remarkMap = new core_model_common_1.StringKeyMap(this.remark);
        }
        return this._remarkMap;
    }
    getBytes(skipSignature, skipSignSignature) {
        const props = {};
        if (skipSignature) {
            props.signatureBuffer = { value: null };
        }
        if (skipSignSignature) {
            props.signSignatureBuffer = { value: null };
        }
        const trsWrapper = Object.create(this, props);
        return this.$type.encode(trsWrapper).finish();
    }
    toJSON() {
        const res = {
            version: this.version,
            type: this.type,
            senderId: this.senderId,
            senderPublicKey: this.senderPublicKey,
            rangeType: this.rangeType,
            range: this.range,
            fee: this.fee,
            timestamp: this.timestamp,
            fromMagic: this.fromMagic,
            toMagic: this.toMagic,
            applyBlockHeight: this.applyBlockHeight,
            signature: this.signature,
            remark: this.remark,
            id: this.id,
            asset: this.asset.toJSON(),
            nonce: this.nonce,
        };
        this.recipientId && (res.recipientId = this.recipientId);
        this.dappid && (res.dappid = this.dappid);
        this.lns && (res.lns = this.lns);
        this.sourceIP && (res.sourceIP = this.sourceIP);
        this.senderSecondPublicKey && (res.senderSecondPublicKey = this.senderSecondPublicKey);
        this.signSignature && (res.signSignature = this.signSignature);
        this.numberOfEffectiveBlocks && (res.numberOfEffectiveBlocks = this.numberOfEffectiveBlocks);
        this.storageKey && (res.storageKey = this.storageKey);
        this.storageValue && (res.storageValue = this.storageValue);
        return res;
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.senderPublicKey && (res.senderPublicKey = object.senderPublicKey);
            object.senderSecondPublicKey && (res.senderSecondPublicKey = object.senderSecondPublicKey);
            object.signature && (res.signature = object.signature);
            object.signSignature && (res.signSignature = object.signSignature);
            if (!res.storage &&
                typeof object.storageKey === "string" &&
                typeof object.storageValue === "string") {
                res.storage = new TransactionBaseStorageModel({
                    key: object.storageKey,
                    value: object.storageValue,
                });
            }
        }
        return res;
    }
};
Transaction.INC = 1;
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "uint32"),
    __metadata("design:type", Number)
], Transaction.prototype, "version", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string"),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string"),
    __metadata("design:type", String)
], Transaction.prototype, "senderId", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], Transaction.prototype, "senderPublicKeyBuffer", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "bytes", "optional"),
    __metadata("design:type", Uint8Array)
], Transaction.prototype, "senderSecondPublicKeyBuffer", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], Transaction.prototype, "recipientId", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "uint32"),
    __metadata("design:type", Number)
], Transaction.prototype, "rangeType", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string", "repeated"),
    __metadata("design:type", Array)
], Transaction.prototype, "range", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string"),
    __metadata("design:type", String)
], Transaction.prototype, "fee", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "uint32"),
    __metadata("design:type", Number)
], Transaction.prototype, "timestamp", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], Transaction.prototype, "dappid", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], Transaction.prototype, "lns", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], Transaction.prototype, "sourceIP", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string"),
    __metadata("design:type", String)
], Transaction.prototype, "fromMagic", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "string"),
    __metadata("design:type", String)
], Transaction.prototype, "toMagic", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "uint32"),
    __metadata("design:type", Number)
], Transaction.prototype, "applyBlockHeight", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], Transaction.prototype, "numberOfEffectiveBlocks", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "fixed32", "required"),
    __metadata("design:type", Number)
], Transaction.prototype, "nonce", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], Transaction.prototype, "signatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, TransactionBaseStorageModel, "optional"),
    __metadata("design:type", TransactionBaseStorageModel)
], Transaction.prototype, "storage", void 0);
__decorate([
    protobuf_1.Field.d(Transaction_1.INC++, "bytes", "optional"),
    __metadata("design:type", Uint8Array)
], Transaction.prototype, "signSignatureBuffer", void 0);
__decorate([
    protobuf_1.MapField.d(Transaction_1.INC++, "string", "string"),
    __metadata("design:type", Object)
], Transaction.prototype, "remark", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Boolean]),
    __metadata("design:returntype", void 0)
], Transaction.prototype, "getBytes", null);
Transaction = Transaction_1 = __decorate([
    protobuf_1.Type.d("Transaction")
], Transaction);
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map