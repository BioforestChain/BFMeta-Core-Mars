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
var BlockBaseStatisticsHelper_1, StatisticsInfo_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_model_block_base_1 = require("@bfchain/core-model-block-base");
const core_model_common_1 = require("@bfchain/core-model-common");
const core_helper_transaction_1 = require("@bfchain/core-helper-transaction");
const core_helper_chain_asset_info_1 = require("@bfchain/core-helper-chain-asset-info");
const core_helper_config_1 = require("@bfchain/core-helper-config");
const util_1 = require("@bfchain/util");
/**区块统计器 */
let BlockBaseStatisticsHelper = BlockBaseStatisticsHelper_1 = class BlockBaseStatisticsHelper {
    constructor(transactionHelper, chainAssetInfo, config, moduleMap) {
        this.transactionHelper = transactionHelper;
        this.chainAssetInfo = chainAssetInfo;
        this.config = config;
        this.moduleMap = moduleMap;
        this._block_statistics_m = new Map();
    }
    /**根据区块获取对应的统计信息 */
    forceGetStatisticsInfoByBlock(statisticinfoKey, reason, source_data) {
        let statistics_info = this._block_statistics_m.get(statisticinfoKey);
        if (!statistics_info) {
            statistics_info = util_1.Resolve(StatisticsInfo, new util_1.ModuleStroge([[StatisticsInfo.SOURCE_DATA_SYMBOL, source_data]], this.moduleMap));
            statistics_info.on("destroy", () => {
                this._block_statistics_m.delete(statisticinfoKey);
            });
            this._block_statistics_m.set(statisticinfoKey, statistics_info);
        }
        statistics_info.ref(reason);
        return statistics_info;
    }
    getStatisticsInfoByBlock(statisticinfoKey) {
        return this._block_statistics_m.get(statisticinfoKey);
    }
    /**fee事件 */
    _applyFee(event, statistics_info) {
        const { applyInfo, transaction } = event;
        const { address, assetInfo } = applyInfo;
        const sourceAmount = BigInt(applyInfo.sourceAmount);
        const { baseType } = this.transactionHelper.parseType(transaction.type);
        // 统计资产信息
        const assetStatistic = statistics_info.initAssetStatistic(assetInfo);
        assetStatistic.total.changeAmount = assetStatistic.total.changeAmount + sourceAmount;
        assetStatistic.total.changeCount += 1;
        assetStatistic.total.addTransactionCount(transaction.id);
        /**需要统计的交易类型 */
        const typeStatistic = assetStatistic.initTypeStatistic(baseType);
        /**
         * 统计总手续费
         */
        statistics_info.totalFee = statistics_info.totalFee + sourceAmount;
        /**
         * 统计流通的资产总量
         */
        statistics_info.totalAsset = statistics_info.totalAsset + sourceAmount;
        /**
         * 统计流通的链资产总量
         */
        statistics_info.totalChainAsset = statistics_info.totalChainAsset + sourceAmount;
        /**
         * 统计涉及的账户总数量
         */
        statistics_info.addTotalAccount(address);
        /**
         * 对交易类型进行变动量统计
         */
        typeStatistic.changeAmount = typeStatistic.changeAmount + sourceAmount;
        typeStatistic.changeCount += 1;
        typeStatistic.moveAmount = typeStatistic.moveAmount + sourceAmount;
        typeStatistic.addTransactionCount(transaction.id);
    }
    /**asset事件 */
    _applyAsset(event, statistics_info) {
        const { applyInfo, transaction } = event;
        const { type } = transaction;
        const sourceAmount = BigInt(applyInfo.sourceAmount);
        const { baseType } = this.transactionHelper.parseType(type);
        /// 获取统计需要写入的对象
        /**需要统计的资产 */
        const assetStatistic = statistics_info.initAssetStatistic(applyInfo.assetInfo);
        /**需要统计的交易类型 */
        const typeStatistic = assetStatistic.initTypeStatistic(baseType);
        /**
         * 对资产进行变动量统计
         */
        assetStatistic.total.changeAmount = assetStatistic.total.changeAmount + sourceAmount;
        assetStatistic.total.changeCount += 1;
        assetStatistic.total.addTransactionCount(transaction.id);
        /**
         * 对交易类型进行变动量统计
         */
        typeStatistic.changeAmount = typeStatistic.changeAmount + sourceAmount;
        typeStatistic.changeCount += 1;
        typeStatistic.addTransactionCount(transaction.id);
        /**
         * 发起者和接收者不能重复累加
         * 统计资产移动、统计指定交易类型的变动
         */
        if (applyInfo.amount.startsWith("-")) {
            /**
             * 资产移动统计
             */
            assetStatistic.total.moveAmount = assetStatistic.total.moveAmount + sourceAmount;
            /**
             * 统计流通的资产总量
             */
            statistics_info.totalAsset = statistics_info.totalAsset + sourceAmount;
            /**
             * 统计流通的链资产总量
             */
            const { assetInfo } = applyInfo;
            const { config } = this;
            if (assetInfo.assetType === config.assetType && assetInfo.magic === config.magic) {
                statistics_info.totalChainAsset = statistics_info.totalChainAsset + sourceAmount;
            }
            /**
             * 针对交易的类型进行统计
             */
            typeStatistic.moveAmount = typeStatistic.moveAmount + sourceAmount;
        }
        /**
         * 统计涉及的账户总数量
         */
        statistics_info.addTotalAccount(applyInfo.address);
    }
    /**给事件触发器绑定统计功能 */
    bindApplyTransactionEventEmiter(eventEmitter, statistics_info) {
        const bindedSet = eventEmitter[BlockBaseStatisticsHelper_1.EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL] ||
            (eventEmitter[BlockBaseStatisticsHelper_1.EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL] = new WeakSet());
        if (bindedSet.has(statistics_info)) {
            console.warn("已经绑定过统计用的ApplyTransaction");
            return;
        }
        bindedSet.add(statistics_info);
        /**
         * 因为`bindApplyTransactionEventEmiter`本身就是在`eventEmitter`传入函数后才开始绑定事件的，
         * 所以这些绑定本身就是在最末尾，不需要`next`
         */
        eventEmitter.on("fee", (event, next) => {
            this._applyFee(event, statistics_info);
            return next();
        });
        eventEmitter.on("feeFromUnfrozen", (event, next) => {
            this._applyFee(event, statistics_info);
            return next();
        });
        eventEmitter.on("asset", (event, next) => {
            this._applyAsset(event, statistics_info);
            return next();
        });
        eventEmitter.on("frozenAsset", (event, next) => {
            this._applyAsset(event, statistics_info);
            return next();
        });
        return true;
    }
};
BlockBaseStatisticsHelper.EVENTEMITTER_STATISTICS_BINDED_SET_SYMBOL = Symbol.for("EVENTEMITTER_STATISTICS_BINDED_SET");
BlockBaseStatisticsHelper = BlockBaseStatisticsHelper_1 = __decorate([
    util_1.Injectable("bfchain-core:BlockBaseStatistics"),
    __metadata("design:paramtypes", [core_helper_transaction_1.TransactionHelper,
        core_helper_chain_asset_info_1.ChainAssetInfoHelper,
        core_helper_config_1.ConfigHelper,
        util_1.ModuleStroge])
], BlockBaseStatisticsHelper);
exports.BlockBaseStatisticsHelper = BlockBaseStatisticsHelper;
/**统计信息 */
let StatisticsInfo = StatisticsInfo_1 = class StatisticsInfo extends util_1.EventEmitter {
    constructor(source_data = core_model_block_base_1.StatisticInfoModel.fromObject({}), chainAssetInfoHelper) {
        super();
        this.source_data = source_data;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        /**累计账户数量 */
        this._accountIdSet = new Set();
        this._souce_data_totalAccount = this.source_data.totalAccount;
        /**资产统计 */
        this._assetStatisticMap = new Map();
        // /**交易类型统计 */
        // type = new Map<TRANSACTION_TYPES_BASE, number>();
        this._reasonSet = new Set();
        for (const [index, assetStatic] of source_data.assetStatisticMap) {
            const assetInfo = this.chainAssetInfoHelper.getAssetInfo(assetStatic.magic, assetStatic.assetType);
            this._assetStatisticMap.set(assetInfo, new AssetStatistic(assetStatic));
        }
    }
    get totalFee() {
        return this._totalFee || (this._totalFee = BigInt(this.source_data.totalFee));
    }
    set totalFee(value) {
        this._totalFee = value;
    }
    get totalAsset() {
        return this._totalAsset || (this._totalAsset = BigInt(this.source_data.totalAsset));
    }
    set totalAsset(value) {
        this._totalAsset = value;
    }
    get totalChainAsset() {
        return (this._totalChainAsset || (this._totalChainAsset = BigInt(this.source_data.totalChainAsset)));
    }
    set totalChainAsset(value) {
        this._totalChainAsset = value;
    }
    get totalAccount() {
        return this.source_data.totalAccount;
    }
    addTotalAccount(id) {
        this._accountIdSet.add(id);
        return (this.source_data.totalAccount =
            this._souce_data_totalAccount + this._accountIdSet.size);
    }
    _formatChainAssetInfo(chainAsset) {
        return this.chainAssetInfoHelper.isChainAssetInfo(chainAsset)
            ? chainAsset
            : this.chainAssetInfoHelper.getAssetInfo(chainAsset.magic, chainAsset.assetType);
    }
    getAssetStatistic(chainAsset) {
        return this._assetStatisticMap.get(this._formatChainAssetInfo(chainAsset));
    }
    setAssetStatistic(chainAsset, assetStatic) {
        this._assetStatisticMap.set(this._formatChainAssetInfo(chainAsset), assetStatic);
        this.source_data.assetStatisticMap.set(assetStatic.index, assetStatic.toModel());
        return this;
    }
    initAssetStatistic(chainAsset, index = this.assetStatisticCount) {
        chainAsset = this._formatChainAssetInfo(chainAsset);
        let assetStatistic = this._assetStatisticMap.get(chainAsset);
        if (!assetStatistic) {
            assetStatistic = new AssetStatistic();
            assetStatistic.index = index;
            assetStatistic.magic = chainAsset.magic;
            assetStatistic.assetType = chainAsset.assetType;
            this.setAssetStatistic(chainAsset, assetStatistic);
        }
        return assetStatistic;
    }
    get assetStatisticCount() {
        return this._assetStatisticMap.size;
    }
    ref(reason) {
        this._reasonSet.add(reason);
    }
    unref(reason) {
        this._reasonSet.delete(reason);
        if (this._reasonSet.size === 0) {
            this.emit("destroy");
        }
    }
    toModel() {
        this._totalFee && (this.source_data.totalFee = this._totalFee.toString());
        this._totalAsset && (this.source_data.totalAsset = this._totalAsset.toString());
        this._totalChainAsset && (this.source_data.totalChainAsset = this._totalChainAsset.toString());
        if (this._assetStatisticMap) {
            const { _assetStatisticMap } = this;
            const assetStatisticHashMap = {};
            _assetStatisticMap.forEach(assetStatistic => {
                assetStatisticHashMap[assetStatistic.index] = assetStatistic.toModel();
            });
            this.source_data.assetStatisticHashMap = assetStatisticHashMap;
        }
        return this.source_data;
    }
};
StatisticsInfo.SOURCE_DATA_SYMBOL = Symbol("source-data");
StatisticsInfo = StatisticsInfo_1 = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject(StatisticsInfo_1.SOURCE_DATA_SYMBOL, { optional: true })),
    __metadata("design:paramtypes", [Object, core_helper_chain_asset_info_1.ChainAssetInfoHelper])
], StatisticsInfo);
exports.StatisticsInfo = StatisticsInfo;
class CountAndAmountStatistic {
    constructor(source_data = core_model_block_base_1.CountAndAmountStatisticModel.fromObject({})) {
        this.source_data = source_data;
        this._transactionIdSet = new Set();
        this._souce_data_transactionCount = this.source_data.transactionCount;
    }
    get changeAmount() {
        return this._changeAmount || (this._changeAmount = BigInt(this.source_data.changeAmount));
    }
    set changeAmount(value) {
        this._changeAmount = value;
    }
    get changeCount() {
        return this.source_data.changeCount;
    }
    set changeCount(value) {
        this.source_data.changeCount = value;
    }
    get moveAmount() {
        return this._moveAmount || (this._moveAmount = BigInt(this.source_data.moveAmount));
    }
    set moveAmount(value) {
        this._moveAmount = value;
    }
    get transactionCount() {
        return this.source_data.transactionCount;
    }
    addTransactionCount(id) {
        this._transactionIdSet.add(id);
        return (this.source_data.transactionCount =
            this._transactionIdSet.size + this._souce_data_transactionCount);
    }
    toModel() {
        this._changeAmount && (this.source_data.changeAmount = this._changeAmount.toString());
        this._moveAmount && (this.source_data.moveAmount = this._moveAmount.toString());
        return this.source_data;
    }
}
class AssetStatistic {
    constructor(source_data = core_model_block_base_1.AssetStatisticModel.fromObject({ total: {} })) {
        this.source_data = source_data;
        this.total = new CountAndAmountStatistic(this.source_data.total);
        /**
         * @TODO 使用get、set，而不是Proxy来实现接口
         */
        // getTypeStatistic(baseType:string){
        // }
        // setTypeStatistic(baseType:string,countAndAmountStatistic:CountAndAmountStatistic){
        // }
        this._typeStatisticMap = new Map();
        this.typeStatisticMap = new core_model_common_1.StringKeyMap((() => {
            const typeStatisticHashMap = this.source_data.typeStatisticHashMap;
            const typeStatisticHashMap2 = {};
            return new Proxy(typeStatisticHashMap2, {
                get(source, key, r) {
                    if (key in source) {
                        return source[key];
                    }
                    if (key in typeStatisticHashMap) {
                        return (source[key] = new CountAndAmountStatistic(typeStatisticHashMap[key]));
                    }
                },
                set(source, key, value, r) {
                    if (value instanceof CountAndAmountStatistic) {
                        source[key] = value;
                        typeStatisticHashMap[key] = value.toModel();
                        return true;
                    }
                    return false;
                },
            });
        })());
        for (const [baseType, typeStatistic] of source_data.typeStatisticMap) {
            this._typeStatisticMap.set(baseType, new CountAndAmountStatistic(typeStatistic));
        }
    }
    get magic() {
        return this.source_data.magic;
    }
    set magic(value) {
        this.source_data.magic = value;
    }
    get assetType() {
        return this.source_data.assetType;
    }
    set assetType(value) {
        this.source_data.assetType = value;
    }
    getTypeStatistic(baseType) {
        return this._typeStatisticMap.get(baseType);
    }
    setTypeStatistic(baseType, assetStatic) {
        this._typeStatisticMap.set(baseType, assetStatic);
        this.source_data.typeStatisticMap.set(baseType, assetStatic.toModel());
        return this;
    }
    initTypeStatistic(baseType) {
        let assetStatistic = this._typeStatisticMap.get(baseType);
        if (!assetStatistic) {
            assetStatistic = new CountAndAmountStatistic();
            this.setTypeStatistic(baseType, assetStatistic);
        }
        return assetStatistic;
    }
    get assetStatisticCount() {
        return this._typeStatisticMap.size;
    }
    get index() {
        return this.source_data.index;
    }
    set index(value) {
        this.source_data.index = value;
    }
    toModel() {
        this.total.changeAmount &&
            (this.source_data.total.changeAmount = this.total.changeAmount.toString());
        this.total.moveAmount && (this.source_data.total.moveAmount = this.total.moveAmount.toString());
        if (this._typeStatisticMap) {
            const typeStatisticHashMap = {};
            const { _typeStatisticMap } = this;
            _typeStatisticMap.forEach((countAndAmountStatistic, baseType) => {
                typeStatisticHashMap[baseType] = countAndAmountStatistic.toModel();
            });
            this.source_data.typeStatisticHashMap = typeStatisticHashMap;
        }
        return this.source_data;
    }
}
//# sourceMappingURL=blockBaseStatisticsHelper.js.map