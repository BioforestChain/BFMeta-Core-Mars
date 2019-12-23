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
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
/**
 * signature 交易 asset 模型
 *
 */
let SignatureModel = class SignatureModel extends protobuf_1.Message {
    get publicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.publicKeyBuffer);
    }
    set publicKey(value) {
        this.publicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    toJSON() {
        return {
            publicKey: this.publicKey,
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.publicKey && (res.publicKey = object.publicKey);
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(1, "bytes"),
    __metadata("design:type", Uint8Array)
], SignatureModel.prototype, "publicKeyBuffer", void 0);
SignatureModel = __decorate([
    protobuf_1.Type.d("SignatureModel")
], SignatureModel);
exports.SignatureModel = SignatureModel;
/**
 * signature 交易 asset 外层模型
 *
 */
let SignatureAssetModel = class SignatureAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            signature: this.signature.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, SignatureModel),
    __metadata("design:type", SignatureModel)
], SignatureAssetModel.prototype, "signature", void 0);
SignatureAssetModel = __decorate([
    protobuf_1.Type.d("SignatureAssetModel")
], SignatureAssetModel);
exports.SignatureAssetModel = SignatureAssetModel;
//# sourceMappingURL=signature.js.map