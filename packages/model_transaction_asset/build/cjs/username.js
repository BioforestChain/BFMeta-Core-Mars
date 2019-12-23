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
 * username 交易 asset 模型
 *
 */
let UsernameModel = class UsernameModel extends protobuf_1.Message {
    get publicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.publicKeyBuffer);
    }
    set publicKey(value) {
        this.publicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    toJSON() {
        return {
            alias: this.alias,
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
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], UsernameModel.prototype, "alias", void 0);
__decorate([
    protobuf_1.Field.d(2, "bytes"),
    __metadata("design:type", Uint8Array)
], UsernameModel.prototype, "publicKeyBuffer", void 0);
UsernameModel = __decorate([
    protobuf_1.Type.d("UsernameModel")
], UsernameModel);
exports.UsernameModel = UsernameModel;
/**
 * username 交易 asset 外层模型
 *
 */
let UsernameAssetModel = class UsernameAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            username: this.username.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, UsernameModel),
    __metadata("design:type", UsernameModel)
], UsernameAssetModel.prototype, "username", void 0);
UsernameAssetModel = __decorate([
    protobuf_1.Type.d("UsernameAssetModel")
], UsernameAssetModel);
exports.UsernameAssetModel = UsernameAssetModel;
//# sourceMappingURL=username.js.map