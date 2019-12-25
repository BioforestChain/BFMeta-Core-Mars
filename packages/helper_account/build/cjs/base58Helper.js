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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@bfchain/util");
const core_util_base58_1 = require("@bfchain/core-util-base58");
const FORZEN_ENCODED_RES_WM = new WeakMap();
let Base58Helper = class Base58Helper {
    constructor(cryptoHelper, Buffer) {
        this.cryptoHelper = cryptoHelper;
        this.Buffer = Buffer;
        this.bs58 = core_util_base58_1.base58;
    }
    sha256x2(buffer) {
        const tmp = this.cryptoHelper
            .sha256()
            .update(buffer)
            .digest();
        return this.cryptoHelper
            .sha256()
            .update(tmp)
            .digest();
    }
    encode(payload) {
        const cachedRes = FORZEN_ENCODED_RES_WM.get(payload);
        if (cachedRes)
            return cachedRes;
        const result = this.bs58.encode(this.Buffer.concat([payload, this.sha256x2(payload)], payload.length + 4));
        if (Object.isFrozen(payload)) {
            FORZEN_ENCODED_RES_WM.set(payload, result);
        }
        return result;
    }
    decodeRaw(buffer) {
        var payload = buffer.slice(0, -4);
        var checksum = buffer.slice(-4);
        var newChecksum = this.sha256x2(payload);
        if ((checksum[0] ^ newChecksum[0]) |
            (checksum[1] ^ newChecksum[1]) |
            (checksum[2] ^ newChecksum[2]) |
            (checksum[3] ^ newChecksum[3]))
            return;
        return this.Buffer.from(payload);
    }
    decodeUnsafe(string) {
        var buffer = this.bs58.decodeUnsafe(string);
        if (!buffer)
            return;
        return this.decodeRaw(buffer);
    }
    decode(string) {
        var buffer = this.bs58.decode(string);
        var payload = this.decodeRaw(buffer);
        if (!payload)
            throw new Error("Invalid checksum");
        return payload;
    }
};
Base58Helper = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject("cryptoHelper")),
    __param(1, util_1.Inject("Buffer")),
    __metadata("design:paramtypes", [Object, Object])
], Base58Helper);
exports.Base58Helper = Base58Helper;
//# sourceMappingURL=base58Helper.js.map