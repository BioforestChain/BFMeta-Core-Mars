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
const _txbase_1 = require("./_txbase");
const core_model_1 = require("@bfchain/core-model");
const core_helper_1 = require("@bfchain/core-helper");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const util_1 = require("@bfchain/util");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "DestoryAssetTransactionFactory");
/**
 * destoryAsset 交易工厂
 *
 */
let DestoryAssetTransactionFactory = class DestoryAssetTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
    }
    /**
     * 校验输入信息
     * 要验证 destoryAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 destoryAsset 信息
     * 需要携带合法的资产所属链名称,并且是本链
     * 需要携带合法的资产所属链的网络标识符,并且是本链
     * 需要携带合法的资产名称，并且不是链资产
     * 需要携带销毁的资产数量，并且大于 0
     *
     *
     * @param body
     * @param destoryAssetAsset
     */
    verifyTransactionBody(body, destoryAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, destoryAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        if (body.recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_EXIST, {
                prop: "recipientId",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.fromMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "fromMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.toMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (!body.storage) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "storage",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        const storage = body.storage;
        if (storage.key !== "assetType") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "assetType",
                ...Function_Exception_Detail,
            });
        }
        const destoryAsset = destoryAssetAsset.destoryAsset;
        if (!destoryAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "destoryAsset",
                function: "verifyTransactionBody",
            });
        }
        const DestoryAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "destoryAssetAsset",
        };
        const { sourceChainMagic, sourceChainName, assetType } = destoryAsset;
        this.checkChainName(sourceChainName, "sourceChainName", DestoryAssetAsset_Exception_Detail);
        if (sourceChainName !== config.chainName) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainName",
                to_target: "body",
                be_compare_prop: "local chain name",
                target: "body",
                ...DestoryAssetAsset_Exception_Detail,
            });
        }
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", DestoryAssetAsset_Exception_Detail);
        if (sourceChainMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...DestoryAssetAsset_Exception_Detail,
            });
        }
        this.checkAssetType(assetType, "assetType", DestoryAssetAsset_Exception_Detail);
        if (assetType === config.assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_BE, {
                to_compare_prop: "assetType",
                to_target: "destoryAsset",
                be_compare_prop: config.assetType,
                ...DestoryAssetAsset_Exception_Detail,
            });
        }
        if (storage.value !== assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "assetType",
                to_target: "storage",
                be_target: "destoryAsset",
                ...Function_Exception_Detail,
            });
        }
        this.checkAssetAmount(destoryAsset.amount, "amount", DestoryAssetAsset_Exception_Detail);
    }
    /**
     * 初始化 destoryAsset 交易
     *
     * @param body
     * @param destoryAsset
     */
    init(body, destoryAsset) {
        const transaction = core_model_1.DestoryAssetTransaction.fromObject({
            ...body,
            asset: destoryAsset,
        });
        return transaction;
    }
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction, eventEmitter, config = this.configHelper) {
        const tasks = new util_1.TaskList();
        tasks.next = super.applyTransaction(transaction, eventEmitter, config);
        const { amount, assetType, sourceChainMagic } = transaction.asset.destoryAsset;
        const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        // 扣除资产
        tasks.next = eventEmitter.emit("asset", {
            type: "asset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo,
                amount: `-${amount}`,
                sourceAmount: amount,
            },
        });
        // 赎回链资产
        tasks.next = eventEmitter.emit("destoryAsset", {
            type: "destoryAsset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo,
                amount: amount,
                sourceAmount: amount,
            },
        });
        return tasks.tryToPromise();
    }
};
DestoryAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], DestoryAssetTransactionFactory);
exports.DestoryAssetTransactionFactory = DestoryAssetTransactionFactory;
//# sourceMappingURL=destoryAsset.js.map