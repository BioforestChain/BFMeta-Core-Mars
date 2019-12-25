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
/// <reference lib="dom"/>
const util_1 = require("@bfchain/util");
const core_helper_account_1 = require("@bfchain/core-helper-account");
const core_helper_config_1 = require("@bfchain/core-helper-config");
const core_model_constants_1 = require("@bfchain/core-model-constants");
let BaseHelper = class BaseHelper {
    constructor(accountHelper, configHelper, ipHelper) {
        this.accountHelper = accountHelper;
        this.configHelper = configHelper;
        this.ipHelper = ipHelper;
        /**uint32的最大数值 */
        this.MAX_UINT_32_INTEGER = 2 ** 32;
        /**
         * 判断公钥是否合法
         *
         */
        this.isValidSecondPublicKey = this.isValidPublicKey;
        this.BI_2_32 = BigInt(32);
        this.BI_2_16 = BigInt(16);
        this.BI_2_8 = BigInt(8);
    }
    isIp(ip) {
        return this.ipHelper.isIp(ip);
    }
    isIpV4(ipV4) {
        return this.ipHelper.isIpV4(ipV4);
    }
    isIpV6(ipV6) {
        return this.ipHelper.isIpV6(ipV6);
    }
    /**
     * 是否是合法的域名解析值
     *
     * @param record
     */
    isValidLocationNameRecord(record) {
        if (!this.isObject(record)) {
            return false;
        }
        if (!(record.recordType && record.recordValue)) {
            return false;
        }
        return true;
    }
    /**
     * 接收范围是否合法
     *
     * @param range
     */
    isValidRange(rangeType, range) {
        if (!core_model_constants_1.RANGE_TYPE[rangeType]) {
            return false;
        }
        if (!this.isArray(range)) {
            return false;
        }
        if (rangeType === core_model_constants_1.RANGE_TYPE.EMPTY) {
            if (range.length !== 0) {
                return false;
            }
        }
        else {
            if (range.length === 0) {
                return false;
            }
            switch (rangeType) {
                case core_model_constants_1.RANGE_TYPE.MULTI_ADDRESS:
                    for (const item of range) {
                        if (!this.accountHelper.isAddress(item)) {
                            return false;
                        }
                    }
                    break;
                case core_model_constants_1.RANGE_TYPE.MULTI_DAPPID:
                    for (const item of range) {
                        if (!this.isValidDAppId(item)) {
                            return false;
                        }
                    }
                    break;
                case core_model_constants_1.RANGE_TYPE.MULTI_LOCATION_NAME:
                    for (const item of range) {
                        if (!this.isValidLnsName(item)) {
                            return false;
                        }
                    }
                    break;
                default:
                    return false;
            }
        }
        return true;
    }
    /**
     * 密码公钥是否合法
     *
     * @param cipherPublicKeys
     */
    isValidCipherPublicKeys(cipherPublicKeys) {
        if (!this.isArray(cipherPublicKeys)) {
            return false;
        }
        for (const cipherPublicKey of cipherPublicKeys) {
            if (!this.isValidPublicKey(cipherPublicKey)) {
                return false;
            }
        }
        return true;
    }
    /**
     * 是否是一个合法的账号签名
     *
     * @param accountSignature
     */
    isValidAccountSignature(accountSignature) {
        if (!accountSignature) {
            return false;
        }
        if (!this.isObject(accountSignature)) {
            return false;
        }
        const { publicKey, signature, secondPublicKey, signSignature } = accountSignature;
        if (!(this.isValidPublicKey(publicKey) && this.isValidSignature(signature))) {
            return false;
        }
        if ((secondPublicKey && !signSignature) || (!secondPublicKey && signSignature)) {
            return false;
        }
        if (secondPublicKey && signSignature) {
            if (!(this.isValidPublicKey(secondPublicKey) && this.isValidSignature(signSignature))) {
                return false;
            }
        }
        return true;
    }
    /**
     * 第三方签名是否合法
     *
     * @param thirdPartySignatures
     */
    isValidThirdPartySignatures(thirdPartySignatures) {
        if (!this.isArray(thirdPartySignatures)) {
            return false;
        }
        for (const thirdPartySignature of thirdPartySignatures) {
            if (!this.isValidAccountSignature(thirdPartySignature)) {
                return false;
            }
        }
        return true;
    }
    /**
     * 获取输入值的类型
     *
     * @param variable
     */
    getVariableType(variable) {
        return Object.prototype.toString.call(variable);
    }
    /**
     * 判断是否是一个 boolean 值
     *
     * @param value
     */
    isBoolean(value) {
        return typeof value === "boolean";
    }
    /**
     * 判断输入值是否是非负整数
     *
     * @param value
     */
    isNaturalNumber(value) {
        return Number.isInteger(value) && value >= 0;
    }
    /**判断输入值是否是合法的uint32数值 */
    isUint32(value) {
        return this.isNaturalNumber(value) && value < this.MAX_UINT_32_INTEGER;
    }
    /**判读是否是非空的`Uint8Array` */
    isNoEmptyUint8Array(value) {
        return value instanceof Uint8Array && value.length > 0;
    }
    /**
     * 判断输入值是否是正整数
     *
     * @param value
     */
    isPositiveInteger(value) {
        return Number.isInteger(value) && value > 0;
    }
    /**
     * 判断输入值是否是满足条件
     *
     * @param value
     */
    isPositiveFloatMatchCondition(value, condition) {
        let num_val = value;
        // 对Fraction的支持
        if (value &&
            typeof value["denominator"] === "number" &&
            typeof value["numerator"] === "number") {
            // 分母不能为 0
            if (value["denominator"] === 0) {
                return false;
            }
            num_val = value["numerator"] / value["denominator"];
        }
        if (Number.isNaN(num_val)) {
            return false;
        }
        return condition(num_val);
    }
    /**
     * 判断输入值是否是非负浮点数，包含 0
     *
     * @param value
     */
    isPositiveFloatContainZero(value) {
        return this.isPositiveFloatMatchCondition(value, v => v >= 0);
    }
    /**
     * 判断输入值是否是正浮点数，不包含 0
     *
     * @param value
     */
    isPositiveFloatNotContainZero(value) {
        return this.isPositiveFloatMatchCondition(value, v => v > 0);
    }
    /**
     * 判断输入数据是否是一个分数
     *
     * @param value
     */
    isFraction(value) {
        if (typeof value !== "object" || value === null) {
            return false;
        }
        if (!(value.numerator && value.denominator)) {
            return false;
        }
        const denominator = BigInt(value.denominator);
        const minNumber = BigInt(0);
        if (denominator === minNumber) {
            return false;
        }
        return true;
    }
    /**
     * 判断输入数据是否是一个可作为BigInt的值
     * @param value
     */
    isFiniteBigInt(value) {
        try {
            BigInt(value);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 判断是否为空对象
     * @param {*} e
     */
    isEmptyObject(e) {
        if (!this.isObject(e))
            return false;
        var t;
        for (t in e)
            return false;
        return true;
    }
    /**
     * 快速判断两个数组是否相等
     * @param a
     * @param b
     */
    isArrayEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    /**hex字符串或者buffer长度是否合法 */
    isValidBufferSize(buffer_or_string, buffer_length) {
        if (buffer_or_string instanceof Uint8Array) {
            return buffer_or_string.length === buffer_length;
        }
        if (this.isString(buffer_or_string)) {
            if (buffer_or_string.length === buffer_length * 2) {
                for (var i = 0; i < buffer_or_string.length; i += 1) {
                    var c = buffer_or_string[i];
                    return c >= "0" && c <= "f";
                }
            }
        }
        return false;
    }
    /**
     * 判断公钥是否合法
     *
     */
    isValidPublicKey(publicKey) {
        return this.isValidBufferSize(publicKey, 32);
    }
    /**
     * 判断公钥是否合法
     *
     */
    isValidSecretKey(secretKey) {
        return this.isValidBufferSize(secretKey, 64);
    }
    /**
     * 是否是一个字符串
     *
     * @param str
     */
    isString(str) {
        return typeof str === "string";
    }
    /**
     * 是否是一个数组
     *
     * @param arr
     */
    isArray(arr) {
        return this.getVariableType(arr) === "[object Array]";
    }
    /**
     * 是否是一个对象
     *
     * @param obj
     */
    isObject(obj) {
        return this.getVariableType(obj) === "[object Object]";
    }
    /**
     * 是否是一个合法的图片格式
     * @FIXME
     * @param img
     */
    isImage(img) {
        return this.isString(img);
    }
    /**
     * 是否是一个合法的URL
     * @param url
     */
    isURL(url) {
        try {
            if (this.isString(url)) {
                const url_info = new URL(url);
                return url_info.hostname !== "";
            }
        }
        catch { }
        return false;
    }
    /**
     * 交易类型是否合法
     *
     * @param type
     */
    isValidTransactionType(type) {
        if (!this.isString(type)) {
            return false;
        }
        const strArray = type.split("-");
        if (strArray.length !== 4) {
            return false;
        }
        if (!this.isValidAssetType(strArray[0])) {
            return false;
        }
        if (!this.isValidUpperChainName(strArray[1])) {
            return false;
        }
        const baseType = strArray[2];
        if (!(this.isUpperCaseString(baseType) && baseType.length === 3)) {
            return false;
        }
        const serialNumber = strArray[3];
        if (!(this.isValidStringNumber(serialNumber) && serialNumber.length === 2)) {
            return false;
        }
        return true;
    }
    /**
     * 交易 ID 是否合法
     *
     * @param id
     */
    isValidTransactionId(id) {
        return this.isValidSignature(id);
    }
    /**
     * 区块 ID 是否合法
     *
     * @param id
     */
    isValidBlockId(id) {
        return this.isValidSignature(id);
    }
    /**
     * 签名是否合法
     *
     * @param signature
     */
    isValidSignature(signature) {
        return this.isValidBufferSize(signature, 64);
    }
    /**
     * remark.hash 是否合法
     *
     * @param hash
     */
    isValidRemarkHash(hash) {
        return this.isValidBufferSize(hash, 32);
    }
    /**
     * 大写链名
     *
     * @param chainName
     */
    isValidUpperChainName(chainName) {
        if (!this.isString(chainName)) {
            return false;
        }
        const pattern = new RegExp("^[A-Z]{3,8}$");
        return pattern.test(chainName);
    }
    /**
     * 链名是否合法：小写字母 3-8
     *
     * @param chainName
     */
    isValidChainName(chainName) {
        if (!this.isString(chainName)) {
            return false;
        }
        const pattern = new RegExp("^[a-z]{3,8}$");
        return pattern.test(chainName);
    }
    /**
     * 链资产名是否合法：大写字母 3-5
     *
     * @param assetType
     */
    isValidAssetType(assetType) {
        if (!this.isString(assetType)) {
            return false;
        }
        const pattern = new RegExp("^[A-Z]{3,5}$");
        return pattern.test(assetType);
    }
    /**
     * 链网络标识符是否合法：大写字母、数字 9-16
     *
     * @param magic
     */
    isValidChainMagic(magic) {
        if (!this.isString(magic)) {
            return false;
        }
        const pattern = new RegExp("^[A-Z0-9]{9,16}$");
        return pattern.test(magic);
    }
    /**
     * dappid 是否合法：大写字母、数字 17-32
     *
     * @param dappid
     */
    isValidDAppId(dappid) {
        if (!this.isString(dappid)) {
            return false;
        }
        const pattern = new RegExp("^[A-Z0-9]{17,32}$");
        return pattern.test(dappid);
    }
    /**
     * 用户名是否合法：
     * 不能包含 ifmchain/bfchain
     * 只能由大小写字母、数字、下划线 1-20
     *
     * @param username
     */
    isValidUsername(username) {
        if (!this.isString(username)) {
            return false;
        }
        // 大小写字母、数字、下划线 1-20
        const allowSymbols = /^[A-Za-z0-9_]{1,20}$/;
        if (!allowSymbols.test(username)) {
            return false;
        }
        // 不能包含 ifmchain/bfchain
        const ipattern = /^((?!ifmchain|bfchain).)*$/;
        return ipattern.test(username.toLowerCase());
    }
    /**
     * 是否是合法的创世受托人名
     *
     * @param username
     */
    isValidGenesisUsername(username) {
        if (!this.isString(username)) {
            return false;
        }
        // 大小写字母、数字、下划线 1-20
        const allowSymbols = /^[A-Za-z0-9_]{1,20}$/;
        return allowSymbols.test(username);
    }
    /**
     * 是否时是数字组成的字符串
     *
     * @param stringNumber
     */
    isValidStringNumber(stringNumber) {
        if (!this.isString(stringNumber)) {
            return false;
        }
        const allowSymbols = /^[0-9]+$/;
        return allowSymbols.test(stringNumber);
    }
    /**
     * 资产数量是否合法： 只能是数字组成的字符串
     *
     * @param assetNumber
     */
    isValidAssetNumber(assetNumber) {
        return this.isValidStringNumber(assetNumber);
    }
    /**
     * 权益数量是否合法： 只能是数字组成的字符串
     *
     * @param equity
     */
    isValidAccountEquity(equity) {
        return this.isValidStringNumber(equity);
    }
    /**
     * 区块的参与度是否合法： 只能是数字组成的字符串
     *
     * @param blockParticipation
     */
    isValidBlockParticipation(blockParticipation) {
        return this.isValidStringNumber(blockParticipation);
    }
    /**
     * 权益比例是否合法： 只能是数字组成的字符串
     *
     * @param equity
     */
    isValidEquityRate(rate) {
        return this.isValidStringNumber(rate);
    }
    /**
     * 链域名是否合法
     * 总域名最大长度 1024
     * 不能以 . 开头或结尾
     * 只能包含大小写字母、数字、.
     * 顶级域名只能是小写字母，多级域名每级只能是大小写字母、数字
     * 每级域名的最大长度 128
     *
     * @param name
     */
    isValidLnsName(name, chainName) {
        if (!this.isString(name)) {
            return false;
        }
        // 链域名总长度不大于 1024
        if (name.length > 1024) {
            return false;
        }
        // 不能以 . 开头或结尾
        if (this.isStartWithOrEndWithPoint(name)) {
            return false;
        }
        const names = name.split(".");
        const len = names.length;
        if (len < 2) {
            return false;
        }
        const tpattern = /^[a-z]+$/;
        const pattern = /^[a-z0-9][a-z0-9_]*[a-z0-9]+$/;
        for (let i = 0; i < len; i++) {
            const item = names[i];
            if (item.length > 128) {
                return false;
            }
            if (i === len - 2) {
                if (!tpattern.test(item)) {
                    return false;
                }
            }
            else if (i === len - 1) {
                // 根域名必须是本链链名
                if (item !== (chainName || this.configHelper.chainName)) {
                    return false;
                }
            }
            else {
                if (!pattern.test(item)) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * 端口号是否合法
     *
     * @param port
     */
    isValidPort(port) {
        return !Number.isNaN(port) && port > 0 && port < 65536;
    }
    /**
     * 链端口号是否合法
     * 不能是空对象
     * 必须包含默认端口和节点扫描端口
     * 端口号 大于 0 小于 65536
     *
     * @param ports
     */
    isValidChainPorts(ports) {
        if (this.isEmptyObject(ports)) {
            return false;
        }
        return this.isValidPort(ports.port) && this.isValidPort(ports.scan_peer_port);
    }
    /**
     * 奖励比例是否合法
     * 不能是空对象
     * 必须要有投票奖励比例和打块奖励比例
     * 比例之和必须等于 1
     *
     * @param rewardPercent
     */
    isValidChainRewardPercent(rewardPercent) {
        if (this.isEmptyObject(rewardPercent)) {
            return false;
        }
        if (!(rewardPercent.votePercent && rewardPercent.forgePercent)) {
            return false;
        }
        const votePercent = rewardPercent.votePercent;
        const forgePercent = rewardPercent.forgePercent;
        if (!(this.isPositiveFloatNotContainZero(votePercent.denominator) &&
            this.isPositiveFloatNotContainZero(forgePercent.denominator))) {
            return false;
        }
        if (votePercent.denominator !== forgePercent.denominator) {
            return false;
        }
        const denominator = votePercent.denominator;
        if (votePercent.numerator + forgePercent.numerator !== denominator) {
            return false;
        }
        return true;
    }
    /**
     * 链奖励里程是否合法
     * 不能是空对象
     * 必须包含里程高度数组和里程奖励数组
     * 里程高度数组中每个值只能是数字，并且下一个里程高度大于上一个里程高度
     * 里程奖励数组中每个值只能是字符串，并且是一个合法的资产数量
     * 里程奖励数组长度和里程高度数组长度相差 1
     *
     * @param milestones
     */
    isValidChainRewardMilestones(milestones) {
        if (!(milestones && milestones.heights && milestones.rewards)) {
            return false;
        }
        const heights = milestones.heights;
        const rewards = milestones.rewards;
        if (!(this.isArray(heights) && this.isArray(rewards))) {
            return false;
        }
        const hlen = heights.length;
        const rlen = rewards.length;
        if (rlen === 0 && hlen === 0) {
            return true;
        }
        if (rlen === 0) {
            return false;
        }
        if (hlen === 0) {
            return false;
        }
        if (hlen === 1) {
            if (Number.isNaN(heights[0])) {
                return false;
            }
        }
        else {
            for (let i = 0; i < hlen - 1; i++) {
                if (Number.isNaN(heights[i]) || heights[i] >= heights[i + 1]) {
                    return false;
                }
            }
        }
        for (let i = 0; i < rlen - 1; i++) {
            if (!this.isValidAssetNumber(rewards[i])) {
                return false;
            }
        }
        if (milestones.rewards.length - milestones.heights.length !== 1) {
            return false;
        }
        return true;
    }
    /**
     * 是否是纯大写
     *
     * @param value
     */
    isUpperCaseString(value) {
        return this.isString(value) && value === value.trim().toUpperCase();
    }
    /**
     * 是否是纯小写
     *
     * @param value
     */
    isLowerCaseString(value) {
        return this.isString(value) && value === value.trim().toLowerCase();
    }
    /**
     * 是否是科学计数法
     *
     * @param value
     */
    isScientificCounting(value) {
        return value.includes(".") || value.includes("e");
    }
    /**
     * 是否时纯小写字母
     *
     * @param value
     */
    isLowerCaseLetters(value) {
        const pattern = /^[a-z]+$/;
        return this.isString(value) && pattern.test(value);
    }
    /**
     * 是否是大写字母或数字
     *
     * @param value
     */
    isUpperCaseOrNumber(value) {
        const pattern = /^[A-Z0-9]+$/;
        return this.isString(value) && pattern.test(value);
    }
    /**
     * 是否是纯大小写字母
     *
     * @param value
     */
    isUpperCaseOrLowerCase(value) {
        const pattern = /^[A-Za-z]+$/;
        return this.isString(value) && pattern.test(value);
    }
    /**
     * 是否是大小写字母或数字
     *
     * @param value
     */
    isUpperCaseOrLowerCaseOrNumber(value) {
        const pattern = /^[A-Za-z0-9]+$/;
        return this.isString(value) && pattern.test(value);
    }
    /**
     * 是否以点开头或结尾
     *
     * @param value
     */
    isStartWithOrEndWithPoint(value) {
        const pattern = /^[^\.].*[^\.]$/;
        return !pattern.test(value);
    }
    /**
     * 字母开头，内容可包含数字
     *
     * @param value
     */
    isLowerCaseOrNumberOrUnderline(value) {
        const pattern = /^[a-z0-9][a-z0-9_]*[a-z0-9]+$/;
        return pattern.test(value);
    }
    /**
     * 手续费比例是否合法
     *
     * @param feeRate
     */
    isValidFeeRate(feeRate) {
        if (!feeRate) {
            return false;
        }
        const senderPaidFeeRate = feeRate.senderPaidFeeRate;
        const recipientPaidFeeRate = feeRate.recipientPaidFeeRate;
        if (!this.isPositiveFloatContainZero(senderPaidFeeRate)) {
            return false;
        }
        if (!this.isPositiveFloatContainZero(recipientPaidFeeRate)) {
            return false;
        }
        if (!(senderPaidFeeRate.denominator === 1 && recipientPaidFeeRate.denominator === 1)) {
            return false;
        }
        const isValid = (senderPaidFeeRate.numerator === 1 && recipientPaidFeeRate.numerator === 0) ||
            (senderPaidFeeRate.numerator === 0 && recipientPaidFeeRate.numerator === 1);
        if (!isValid) {
            return false;
        }
        return true;
    }
    /**读取一个二进制的n位数据作为BigInt数字 */
    getUintX(dv, X) {
        let BI_res = BigInt(0);
        let offset = 0;
        while (X > 0) {
            if (X >= 32) {
                const BI_val = BigInt(dv.readUInt32BE(offset));
                BI_res = (BI_res << this.BI_2_32) + BI_val;
                offset += 32;
                X -= 32;
            }
            else if (X >= 16) {
                const BI_val = BigInt(dv.readUInt16BE(offset));
                BI_res = (BI_res << this.BI_2_16) + BI_val;
                offset += 16;
                X -= 16;
            }
            else if (X >= 8) {
                const BI_val = BigInt(dv.readUInt8(offset));
                BI_res = (BI_res << this.BI_2_8) + BI_val;
                offset += 8;
                X -= 8;
            }
            else {
                const binary_num = dv.readUInt8(offset) >> X;
                const BI_val = BigInt(binary_num);
                BI_res = (BI_res << BigInt(X)) + BI_val;
                offset += X;
                X -= X;
            }
        }
        return BI_res;
    }
    /**
     * 兑换比例是否合法
     *
     * @param rate
     */
    isValidRate(rate) {
        if (!rate) {
            return false;
        }
        const prevWeight = rate.prevWeight;
        const nextWeight = rate.nextWeight;
        try {
            BigInt(prevWeight);
            BigInt(nextWeight);
            return typeof nextWeight === typeof prevWeight;
        }
        catch (err) {
            return false;
        }
    }
};
BaseHelper = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_account_1.AccountBaseHelper,
        core_helper_config_1.ConfigHelper,
        util_1.IpHelper])
], BaseHelper);
exports.BaseHelper = BaseHelper;
//# sourceMappingURL=baseHelper.js.map