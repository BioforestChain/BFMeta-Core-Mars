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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "TransferAssetTransactionFactory");
/**
 * transferAsset 交易工厂
 *
 */
let TransferAssetTransactionFactory = class TransferAssetTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 transferAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能和发起账户地址相等
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 transferAsset 信息
     * 需要携带合法的资产所属链名称
     * 需要携带合法的资产所属链的网络标识符
     * 需要携带合法的资产名称，并且不是链资产
     * 需要携带转出的资产数量，并且大于 0
     *
     * @param body
     * @param transferAssetAsset
     */
    verifyTransactionBody(body, transferAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, transferAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const recipientId = body.recipientId;
        if (!recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "recipientId",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.senderId === recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_BE, {
                to_compare_prop: "senderId",
                to_target: "body",
                be_compare_prop: "recipientId",
                ...Function_Exception_Detail,
            });
        }
        if (body.fromMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "fromMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                ...Function_Exception_Detail,
            });
        }
        if (body.toMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
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
        const transferAsset = transferAssetAsset.transferAsset;
        if (!transferAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "transferAsset",
                function: "verifyTransactionBody",
            });
        }
        const TransferAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "transferAssetAsset",
        };
        const { sourceChainMagic, sourceChainName, assetType } = transferAsset;
        this.checkChainName(sourceChainName, "sourceChainName", TransferAssetAsset_Exception_Detail);
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", TransferAssetAsset_Exception_Detail);
        this.checkAssetType(assetType, "assetType", TransferAssetAsset_Exception_Detail);
        if (storage.value !== assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "assetType",
                to_target: "storage",
                be_target: "transferAsset",
                ...Function_Exception_Detail,
            });
        }
        this.checkAssetAmount(transferAsset.amount, "amount", TransferAssetAsset_Exception_Detail);
    }
    /**
     * 初始化 transferAsset 交易
     *
     * @param body
     * @param transferAssetAsset
     */
    init(body, transferAssetAsset) {
        const transaction = core_model_1.TransferAssetTransaction.fromObject({
            ...body,
            asset: transferAssetAsset,
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
        const { amount, assetType, sourceChainMagic } = transaction.asset.transferAsset;
        const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        // 扣除资产
        tasks.next = this._applyTransactionEmitAsset(eventEmitter, transaction, amount, {
            senderId: transaction.senderId,
            senderPublicKeyBuffer: transaction.senderPublicKeyBuffer,
            recipientId: transaction.recipientId,
            assetInfo,
        });
        return tasks.tryToPromise();
    }
};
TransferAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], TransferAssetTransactionFactory);
exports.TransferAssetTransactionFactory = TransferAssetTransactionFactory;
//# sourceMappingURL=transferAsset.js.map