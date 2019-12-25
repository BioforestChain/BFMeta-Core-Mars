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
const util_1 = require("@bfchain/util");
var NetType;
(function (NetType) {
    NetType[NetType["TESTNET"] = 0] = "TESTNET";
    NetType[NetType["MAINNET"] = 1] = "MAINNET";
})(NetType = exports.NetType || (exports.NetType = {}));
let ConfigHelper = class ConfigHelper {
    constructor(genesisBlock, business) {
        this.genesisBlock = genesisBlock;
        this.business = business;
    }
    /**获取交易最大有效期 */
    get maxApplyAndConfirmedBlockHeightDiff() {
        return this.genesisBlock.remark.maxApplyAndConfirmedBlockHeightDiff;
    }
    /**获取区块版本号 */
    get version() {
        return this.genesisBlock.version;
    }
    /**获取最大的 remark 长度 */
    get maxBlockRemarkSize() {
        return this.genesisBlock.remark.maxBlockRemarkSize;
    }
    /**每轮锻造的区块数量 */
    get blockPerRound() {
        return this.genesisBlock.remark.blockPerRound;
    }
    /**链资产名 */
    get assetType() {
        return this.genesisBlock.remark.assetType;
    }
    /**链名 */
    get chainName() {
        return this.genesisBlock.remark.chainName;
    }
    /**链网络标识符 */
    get magic() {
        return this.genesisBlock.remark.magic;
    }
    /**链奖励里程 */
    get milestones() {
        return this.genesisBlock.remark.rewardPerBlock;
    }
    /**链创世账户初始账户余额 */
    get generateTotalAmount() {
        return this.genesisBlock.remark.generateTotalAmount;
    }
    /**获取资产的最小单位 */
    get miniUnit() {
        return "1";
    }
    /**网络类型 */
    get netType() {
        return this.initials === "b" ? NetType.MAINNET : NetType.TESTNET;
    }
    /**地址前缀 */
    get initials() {
        return this.genesisBlock.remark.bnid;
    }
    /**打块的时间间隔 */
    get forgeInterval() {
        return this.genesisBlock.remark.forgeInterval;
    }
    /**区块参与度计算权重 */
    get blockParticipationWeight() {
        const { participationTotalChainAsset, participationNumberOfTransaction, participationNumberOfAccount, participationTotalFee, } = this.genesisBlock.remark;
        return {
            participationTotalChainAsset,
            participationNumberOfTransaction,
            participationNumberOfAccount,
            participationTotalFee,
        };
    }
    /**创世时间 */
    get beginEpochTime() {
        return this.genesisBlock.remark.beginEpochTime;
    }
    /**最大区块大小 */
    get maxPayloadLength() {
        return this.genesisBlock.remark.maxPayloadLength;
    }
    get powOfWorkExemptionBlocks() {
        return this.genesisBlock.remark.powOfWorkExemptionBlocks;
    }
    /**创世账户公钥 */
    get genesisAccountPublicKey() {
        return this.genesisBlock.generatorPublicKey;
    }
    /**获取交易的最大字节数 */
    get maxTransactionSize() {
        return this.genesisBlock.remark.maxTransactionSize;
    }
    /**发行数字资产最小持有的链资产数量 */
    get issueAssetMinChainAsset() {
        return this.genesisBlock.remark.issueAssetMinChainAsset;
    }
    /**发行子链最小持有的链资产数量 */
    get issueSubchainMinChainAsset() {
        return this.genesisBlock.remark.issueSubchainMinChainAsset;
    }
    /**链资产和数字资产的兑换比例 */
    get chainAssetAndDigitalAssetExchangeRate() {
        return this.genesisBlock.remark.chainAssetAndDigitalAssetExchangeRate;
    }
    /**交易每个字节最小手续费 */
    get minTransactionFeePerByte() {
        return this.genesisBlock.remark.minTransactionFeePerByte;
    }
    /**每个区块可处理的最大交易数量 */
    get maxTPSPerBlock() {
        return this.genesisBlock.remark.maxTPSPerBlock;
    }
    /**每轮可处理的受托人交易数量 */
    get maxDelegateTxsPerRound() {
        return this.genesisBlock.remark.maxDelegateTxsPerRound;
    }
    /**创世受托人数量 */
    get delegates() {
        return this.genesisBlock.remark.delegates;
    }
    /**获取奖励分配比例 */
    get rewardPercent() {
        return this.genesisBlock.remark.rewardPercent;
    }
    /**获取父链传世块 */
    get parentGenesisBlock() {
        return this.genesisBlock.remark.parentGenesisBlock;
    }
};
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "version", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "maxBlockRemarkSize", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "blockPerRound", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "assetType", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "chainName", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "magic", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "milestones", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "generateTotalAmount", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "miniUnit", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "netType", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "initials", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "forgeInterval", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "blockParticipationWeight", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "beginEpochTime", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "maxPayloadLength", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "powOfWorkExemptionBlocks", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "genesisAccountPublicKey", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "maxTransactionSize", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "issueAssetMinChainAsset", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "issueSubchainMinChainAsset", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "chainAssetAndDigitalAssetExchangeRate", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "minTransactionFeePerByte", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "maxTPSPerBlock", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "maxDelegateTxsPerRound", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "delegates", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "rewardPercent", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelper.prototype, "parentGenesisBlock", null);
ConfigHelper = __decorate([
    util_1.Injectable("config"),
    __metadata("design:paramtypes", [Object, String])
], ConfigHelper);
exports.ConfigHelper = ConfigHelper;
let ConfigHelperMap = class ConfigHelperMap {
    constructor() {
        this._map = new Map();
    }
    get clear() {
        return this._map.clear.bind(this._map);
    }
    get delete() {
        return this._map.delete.bind(this._map);
    }
    get forEach() {
        return this._map.forEach.bind(this._map);
    }
    get get() {
        return this._map.get.bind(this._map);
    }
    get has() {
        return this._map.has.bind(this._map);
    }
    get set() {
        return this._map.set.bind(this._map);
    }
    get size() {
        return this._map.size;
    }
    /** Returns an iterable of entries in the map. */
    get [Symbol.iterator]() {
        return this._map[Symbol.iterator].bind(this._map);
    }
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    get entries() {
        return this._map.entries.bind(this._map);
    }
    /**
     * Returns an iterable of keys in the map
     */
    get keys() {
        return this._map.keys.bind(this._map);
    }
    /**
     * Returns an iterable of values in the map
     */
    get values() {
        return this._map.values.bind(this._map);
    }
    get [Symbol.toStringTag]() {
        return "EasyMap";
    }
};
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "delete", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "forEach", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "get", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "has", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "set", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, Symbol.iterator, null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "entries", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "keys", null);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ConfigHelperMap.prototype, "values", null);
ConfigHelperMap = __decorate([
    util_1.Injectable("configMap")
], ConfigHelperMap);
exports.ConfigHelperMap = ConfigHelperMap;
//# sourceMappingURL=configHelper.js.map