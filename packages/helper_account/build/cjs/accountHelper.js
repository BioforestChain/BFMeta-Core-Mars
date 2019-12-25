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
const core_helper_config_1 = require("@bfchain/core-helper-config");
const base58Helper_1 = require("./base58Helper");
const util_1 = require("@bfchain/util");
const FROZEN_PK_ADD_WM = new WeakMap();
/**账户辅助模块
 * 公私钥对的生成
 * 地址的生成
 */
let AccountBaseHelper = class AccountBaseHelper {
    constructor(cryptoHelper, KeypairHelperInterface, Buffer, base58Helper, config) {
        this.cryptoHelper = cryptoHelper;
        this.KeypairHelperInterface = KeypairHelperInterface;
        this.Buffer = Buffer;
        this.base58Helper = base58Helper;
        this.config = config;
    }
    get _prefix() {
        return this.config.initials;
    }
    /**通用的密钥检查规则 */
    checkSecret(secret) {
        if (/^\s|\s$/.test(secret)) {
            throw new SyntaxError("Main Secret cannot contain spaces at the beginning or end");
        }
        if (/[\cA-\cZ]/.test(secret)) {
            throw new SyntaxError("Main Secret cannot contain Special Characters");
        }
        return true;
    }
    /**
     * 根据主密码生成密钥对
     *
     * @param secret 主密码
     */
    createSecretKeypair(secret) {
        return this.KeypairHelperInterface.create(secret);
    }
    /**根据私钥获取公钥Buffer */
    getPublicKeyFromSecret(secret) {
        return this.createSecretKeypair(secret).publicKey;
    }
    /**根据私钥获取公钥String */
    getPublicKeyStringFromSecret(secret, encode = "hex") {
        return this.Buffer.from(this.getPublicKeyFromSecret(secret)).toString(encode);
    }
    /**根据公钥生成地址的二进制数据 */
    getBinaryAddressFromPublicKey(publicKey) {
        const cachedResult = FROZEN_PK_ADD_WM.get(publicKey);
        if (cachedResult)
            return cachedResult;
        const h1 = this.cryptoHelper
            .sha256()
            .update(publicKey)
            .digest();
        const h2 = this.cryptoHelper
            .ripemd160()
            .update(h1)
            .digest();
        FROZEN_PK_ADD_WM.set(publicKey, h2);
        return h2;
    }
    /**根据公钥生成地址(base58) */
    getAddressFromPublicKey(publicKey) {
        const address = this._prefix + this.base58Helper.encode(this.getBinaryAddressFromPublicKey(publicKey));
        return address;
    }
    /**根据公钥字符串生成地址(base58) */
    getAddressFromPublicKeyString(publicKey) {
        return this.getAddressFromPublicKey(this.Buffer.from(publicKey, "hex"));
    }
    /**
     * 根据主密码生成地址
     * @param secret 主密码
     */
    getAddressFromSecret(secret) {
        return this.getAddressFromPublicKey(this.getPublicKeyFromSecret(secret));
    }
    /**
     * 判断地址是否符合规范
     * @param address 地址
     */
    isAddress(address) {
        if (typeof address !== "string") {
            return false;
        }
        if (!/^[0-9]{1,20}$/g.test(address)) {
            if (address[0] !== this._prefix) {
                return false;
            }
            if (!this.base58Helper.decodeUnsafe(address.slice(1))) {
                return false;
            }
        }
        else {
            return false;
        }
        return true;
    }
    /**
     * 根据主密码和二次密码生成密钥对
     *
     * @param secret 主密码
     * @param secondSecret 二次密码
     */
    createSecondSecretKeypair(secret, secondSecret) {
        const md5Second = `${secret}-${this.cryptoHelper
            .md5()
            .update(secondSecret)
            .digest("hex")}`;
        const secondHash = this.cryptoHelper
            .sha256()
            .update(md5Second, "utf8")
            .digest();
        return this.createSecretKeypair(secondHash.toString());
    }
    /**根据私钥获取公钥Buffer */
    getPublicKeyFromSecondSecret(secret, secondSecret) {
        return this.createSecondSecretKeypair(secret, secondSecret).publicKey;
    }
    /**根据私钥获取公钥String */
    getPublicKeyStringFromSecondSecret(secret, secondSecret, encode = "hex") {
        return this.getPublicKeyFromSecondSecret(secret, secondSecret).toString(encode);
    }
    /**
     * 校验二次密码公钥是否正确
     * @param secret 主密码
     * @param secondSecret 二次密码
     * @param secondPublicKey 二次密码公钥
     */
    checkSecondSecret(secret, secondSecret, secondPublicKey) {
        return this.getPublicKeyStringFromSecondSecret(secret, secondSecret) === secondPublicKey;
    }
};
AccountBaseHelper = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject("cryptoHelper")),
    __param(1, util_1.Inject("keypairHelper")),
    __param(2, util_1.Inject("Buffer")),
    __metadata("design:paramtypes", [Object, Object, Object, base58Helper_1.Base58Helper,
        core_helper_config_1.ConfigHelper])
], AccountBaseHelper);
exports.AccountBaseHelper = AccountBaseHelper;
//# sourceMappingURL=accountHelper.js.map