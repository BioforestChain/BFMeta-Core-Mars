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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "UsernameTransactionFactory");
/**
 * username 交易工厂
 *
 */
let UsernameTransactionFactory = class UsernameTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 username 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "alias" value 值必须是设定的值
     * asset 是完整的 username 信息
     * 用户名必须是 1-20 位 大小写字母、数字、下划线 1-20 组成的字符串
     * 用户名不能包含 ifmchain/bfchain
     * 必须携带设置用户名账户的公钥并且与发起账户公钥一致
     *
     * @param body
     * @param usernameAsset
     */
    verifyTransactionBody(body, usernameAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, usernameAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper, accountHelper } = this;
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
        if (storage.key !== "alias") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "alias",
                ...Function_Exception_Detail,
            });
        }
        const username = usernameAsset.username;
        if (!username) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "username",
                function: "verifyTransactionBody",
            });
        }
        const UsernameAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "usernameAsset",
        };
        const alias = username.alias;
        if (!alias) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "alias",
                ...UsernameAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isString(alias)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "username",
                type: "string",
                ...UsernameAsset_Exception_Detail,
            });
        }
        // 创世受托人的用户名 是 bfchain/ifmchain 加索引
        // 不能包含 bchain
        if (body.applyBlockHeight === 1) {
            if (!baseHelper.isValidGenesisUsername(alias)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "alias",
                    type: "genesis username",
                    ...UsernameAsset_Exception_Detail,
                });
            }
        }
        else {
            if (!baseHelper.isValidUsername(alias)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "alias",
                    type: "username",
                    ...UsernameAsset_Exception_Detail,
                });
            }
        }
        if (storage.value !== alias) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "alias",
                to_target: "storage",
                be_target: "username",
                ...Function_Exception_Detail,
            });
        }
        if (accountHelper.isAddress(alias)) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_BE, {
                to_compare_prop: username,
                to_target: "usernameAsset",
                be_compare_prop: "address",
                ...UsernameAsset_Exception_Detail,
            });
        }
        if (alias.length === 0 || alias.length > 20) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_IN_EXPECTED_RANGE, {
                prop: "alias",
                min: 1,
                max: 20,
                ...UsernameAsset_Exception_Detail,
            });
        }
        const publicKey = username.publicKey;
        if (!publicKey) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "publicKey",
                ...UsernameAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidPublicKey(publicKey)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "publicKey",
                type: "account publicKey",
                ...UsernameAsset_Exception_Detail,
            });
        }
        if (publicKey !== body.senderPublicKey) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "publicKey",
                be_compare_prop: "senderPublicKey",
                to_target: "username",
                be_target: "body",
                ...UsernameAsset_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 username 交易
     *
     * @param body
     * @param usernameAsset
     */
    init(body, usernameAsset) {
        const transaction = core_model_1.UsernameTransaction.fromObject({
            ...body,
            asset: usernameAsset,
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
        // 设置用户名
        tasks.next = eventEmitter.emit("setUsername", {
            type: "setUsername",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                alias: transaction.asset.username.alias,
            },
        });
        return tasks.tryToPromise();
    }
};
UsernameTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], UsernameTransactionFactory);
exports.UsernameTransactionFactory = UsernameTransactionFactory;
//# sourceMappingURL=username.js.map