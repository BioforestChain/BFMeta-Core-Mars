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
 * Delegate 交易 asset 模型
 *
 */
let DelegateModel = class DelegateModel extends protobuf_1.Message {
    get publicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.publicKeyBuffer);
    }
    set publicKey(value) {
        this.publicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    toJSON() {
        return {
            username: this.username,
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
], DelegateModel.prototype, "username", void 0);
__decorate([
    protobuf_1.Field.d(2, "bytes"),
    __metadata("design:type", Uint8Array)
], DelegateModel.prototype, "publicKeyBuffer", void 0);
DelegateModel = __decorate([
    protobuf_1.Type.d("DelegateModel")
], DelegateModel);
exports.DelegateModel = DelegateModel;
/**
 * Delegate 交易 asset 外层模型
 */
let DelegateAssetModel = class DelegateAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            delegate: this.delegate.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, DelegateModel),
    __metadata("design:type", DelegateModel)
], DelegateAssetModel.prototype, "delegate", void 0);
DelegateAssetModel = __decorate([
    protobuf_1.Type.d("DelegateAssetModel")
], DelegateAssetModel);
exports.DelegateAssetModel = DelegateAssetModel;
//# sourceMappingURL=delegate.js.map