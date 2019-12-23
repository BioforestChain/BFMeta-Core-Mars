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
var AccountSignatureModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
let AccountSignatureModel = AccountSignatureModel_1 = class AccountSignatureModel extends protobuf_1.Message {
    get publicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.publicKeyBuffer);
    }
    set publicKey(value) {
        this.publicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get signature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.signatureBuffer);
    }
    set signature(value) {
        this.signatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get secondPublicKey() {
        return ((this.secondPublicKeyBuffer && util_encoding_hex_1.getHexFromArrayBuffer(this.secondPublicKeyBuffer)) || undefined);
    }
    set secondPublicKey(value) {
        /// 空字符串也当成undefined处理
        this.secondPublicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get signSignature() {
        return ((this.signSignatureBuffer && util_encoding_hex_1.getHexFromArrayBuffer(this.signSignatureBuffer)) || undefined);
    }
    set signSignature(value) {
        /// 空字符串也当成undefined处理
        this.signSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    toJSON() {
        const res = {
            publicKey: this.publicKey,
            signature: this.signature,
        };
        this.secondPublicKey && (res.secondPublicKey = this.secondPublicKey);
        this.signSignature && (res.signSignature = this.signSignature);
        return res;
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.publicKey && (res.publicKey = object.publicKey);
            object.signature && (res.signature = object.signature);
            object.secondPublicKey && (res.secondPublicKey = object.secondPublicKey);
            object.signSignature && (res.signSignature = object.signSignature);
        }
        return res;
    }
};
AccountSignatureModel.INC = 1;
__decorate([
    protobuf_1.Field.d(AccountSignatureModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], AccountSignatureModel.prototype, "publicKeyBuffer", void 0);
__decorate([
    protobuf_1.Field.d(AccountSignatureModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], AccountSignatureModel.prototype, "signatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(AccountSignatureModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], AccountSignatureModel.prototype, "secondPublicKeyBuffer", void 0);
__decorate([
    protobuf_1.Field.d(AccountSignatureModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], AccountSignatureModel.prototype, "signSignatureBuffer", void 0);
AccountSignatureModel = AccountSignatureModel_1 = __decorate([
    protobuf_1.Type.d("AccountSignatureModel")
], AccountSignatureModel);
exports.AccountSignatureModel = AccountSignatureModel;
//# sourceMappingURL=accountSignature.js.map