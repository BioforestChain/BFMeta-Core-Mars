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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "DelegateTransactionFactory");
/**
 * delegate 交易工厂
 *
 */
let DelegateTransactionFactory = class DelegateTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 delegate 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "username" value 值必须是设定的值
     * asset 是完整的 delegate 信息
     * 需要携带合法的账户名
     * 需要携带合法的账户公钥，且与发起账户公钥相等
     *
     * @param body
     * @param delegateAsset
     */
    verifyTransactionBody(body, delegateAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, delegateAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper } = this;
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
                be_compare_prop: "chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.toMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "chain magic",
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
        if (storage.key !== "username") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "username",
                ...Function_Exception_Detail,
            });
        }
        const delegate = delegateAsset.delegate;
        if (!delegate) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "delegate",
                function: "verifyTransactionBody",
            });
        }
        const DelegateAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "delegateAsset",
        };
        const username = delegate.username;
        if (!username) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "username",
                ...DelegateAsset_Exception_Detail,
            });
        }
        if (body.applyBlockHeight === 1) {
            if (!baseHelper.isValidGenesisUsername(username)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "username",
                    type: "genesis username",
                    ...DelegateAsset_Exception_Detail,
                });
            }
        }
        else {
            if (!baseHelper.isValidUsername(username)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "username",
                    type: "username",
                    ...DelegateAsset_Exception_Detail,
                });
            }
        }
        if (storage.value !== username) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "username",
                to_target: "storage",
                be_target: "delegate",
                ...Function_Exception_Detail,
            });
        }
        const publicKey = delegate.publicKey;
        if (!publicKey) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "publicKey",
                ...DelegateAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidPublicKey(publicKey)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "publicKey",
                type: "account publicKey",
                ...DelegateAsset_Exception_Detail,
            });
        }
        if (publicKey !== body.senderPublicKey) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "publicKey",
                be_compare_prop: "senderPublicKey",
                to_target: "delegate",
                be_target: "body",
                ...DelegateAsset_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 delegate 交易
     *
     * @param body
     * @param delegateAsset
     */
    init(body, delegateAsset) {
        const transaction = core_model_1.DelegateTransaction.fromObject({
            ...body,
            asset: delegateAsset,
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
        // 注册受托人
        tasks.next = eventEmitter.emit("registerToDelegate", {
            type: "registerToDelegate",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
            },
        });
        return tasks.tryToPromise();
    }
};
DelegateTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], DelegateTransactionFactory);
exports.DelegateTransactionFactory = DelegateTransactionFactory;
//# sourceMappingURL=delegate.js.map