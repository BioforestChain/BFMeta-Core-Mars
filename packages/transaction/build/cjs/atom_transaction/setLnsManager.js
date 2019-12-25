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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "SetLnsManagerTransactionFactory");
/**
 * setLnsManager 交易工厂
 *
 */
let SetLnsManagerTransactionFactory = class SetLnsManagerTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 lnsManager 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能和发起账户地址相等(是新的管理员账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     *  key 值必须是 "name" value 值必须是设定的值
     * asset 是完整的 lnsManager 信息
     * 必须携带合法的欲设置管理员的链域名
     * 必须携带合法的欲设置管理员的链域名所属链的名称
     * 必须携带合法的欲设置管理员的链域名所属链的网络标识符
     * 必须携带合法的新的管理员账户地址
     * 新的管理员账户地址和交易的接收者必须相等
     *
     * @param body
     * @param setLnsManagerAsset
     */
    verifyTransactionBody(body, lnsManagerAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, lnsManagerAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper } = this;
        const recipientId = body.recipientId;
        if (!recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "recipientId",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        // if (body.senderId === recipientId) {
        //   throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        //     to_compare_prop: "senderId",
        //     to_target: "body",
        //     be_compare_prop: "recipientId",
        //     ...Function_Exception_Detail,
        //   });
        // }
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
        if (storage.key !== "name") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "name",
                ...Function_Exception_Detail,
            });
        }
        const lnsManager = lnsManagerAsset.lnsManager;
        if (!lnsManager) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "lnsManager",
                function: "verifyTransactionBody",
            });
        }
        const LnsManagerAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "lnsManagerAsset",
        };
        const name = lnsManager.name;
        if (!name) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "name",
                ...LnsManagerAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidLnsName(name)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "name",
                type: "location name",
                ...LnsManagerAsset_Exception_Detail,
            });
        }
        if (storage.value !== name) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "name",
                to_target: "storage",
                be_target: "lnsManager",
                ...Function_Exception_Detail,
            });
        }
        const { sourceChainName, sourceChainMagic } = lnsManager;
        this.checkChainName(sourceChainName, "sourceChainName", LnsManagerAsset_Exception_Detail);
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", LnsManagerAsset_Exception_Detail);
        if (lnsManager.manager !== recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "manager",
                be_compare_prop: "recipientId",
                to_target: "lnsManager",
                be_target: "body",
                ...LnsManagerAsset_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 setLnsManager 交易
     *
     * @param body
     * @param setLnsManagerAsset
     */
    init(body, lnsManagerAsset) {
        const transaction = core_model_1.SetLnsManagerTransaction.fromObject({
            ...body,
            asset: lnsManagerAsset,
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
        const { name, sourceChainMagic, manager } = transaction.asset.lnsManager;
        tasks.next = eventEmitter.emit("setLnsManager", {
            type: "setLnsManager",
            transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                name,
                sourceChainMagic,
                manager,
            },
        });
        return tasks.tryToPromise();
    }
};
SetLnsManagerTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], SetLnsManagerTransactionFactory);
exports.SetLnsManagerTransactionFactory = SetLnsManagerTransactionFactory;
//# sourceMappingURL=setLnsManager.js.map