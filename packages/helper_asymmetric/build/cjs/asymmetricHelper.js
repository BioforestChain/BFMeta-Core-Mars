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
/**非对称模块
 * 签名
 * 加密解密
 */
let AsymmetricHelper = class AsymmetricHelper {
    constructor(cryptoHelper, keypairHelper, ed2curveHelper) {
        this.cryptoHelper = cryptoHelper;
        this.keypairHelper = keypairHelper;
        this.ed2curveHelper = ed2curveHelper;
    }
    /**
     * 签名方法
     *
     * @param keypair
     * @param hash
     */
    detachedSign(message, secretKey) {
        const hash = this.cryptoHelper
            .sha256()
            .update(message)
            .digest();
        return this.keypairHelper.detached_sign(hash, secretKey);
    }
    detachedVeriy(message, signatureBuffer, publicKeyBuffer) {
        const hash = this.cryptoHelper
            .sha256()
            .update(message)
            .digest();
        return this.keypairHelper.detached_verify(hash, signatureBuffer, publicKeyBuffer);
    }
    signToString(message, secretKey, encode = "hex") {
        return this.detachedSign(message, secretKey).toString(encode);
    }
    /**
     * 非对称加密
     *
     * @param msg
     * @param decryptPK
     * @param encryptSK
     */
    asymmetricEncrypt(msg, decryptPK, encryptSK) {
        const curveDecryptPK = this.ed2curveHelper.convertPublicKey(decryptPK);
        if (!curveDecryptPK) {
            throw new Error("decryptPK convertPublicKey fail");
        }
        const curveEncryptSK = this.ed2curveHelper.convertSecretKey(encryptSK);
        return this.keypairHelper.box(msg, curveDecryptPK, curveEncryptSK);
    }
    /**
     * 非对称解密
     *
     * @param encryptedMessage
     * @param nonce
     * @param encryptPK
     * @param decryptSK
     */
    asymmetricDecrypt(encryptedMessage, encryptPK, decryptSK, nonce = new Uint8Array(24)) {
        const curveEncryptPK = this.ed2curveHelper.convertPublicKey(encryptPK);
        if (!curveEncryptPK) {
            throw new Error("decryptPK convertPublicKey fail");
        }
        const curveDecryptSK = this.ed2curveHelper.convertSecretKey(decryptSK);
        const decryptedMessage = this.keypairHelper.open(encryptedMessage, curveEncryptPK, curveDecryptSK, nonce);
        return decryptedMessage;
    }
};
AsymmetricHelper = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject("cryptoHelper")),
    __param(1, util_1.Inject("keypairHelper")),
    __param(2, util_1.Inject("ed2curveHelper")),
    __metadata("design:paramtypes", [Object, Object, Object])
], AsymmetricHelper);
exports.AsymmetricHelper = AsymmetricHelper;
//# sourceMappingURL=asymmetricHelper.js.map