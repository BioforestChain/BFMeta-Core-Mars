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
const dapp_1 = require("./dapp");
const util_1 = require("@bfchain/util");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "MarkTransactionFactory");
/**
 * mark 交易工厂
 *
 */
let MarkTransactionFactory = class MarkTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper, dappTransactionFactory) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.dappTransactionFactory = dappTransactionFactory;
    }
    /**
     * 校验输入信息
     * 要验证 mark 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且是 数据存证 的拥有者地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "dappid" value 值必须是设定的值
     * asset 是完整的 mark 信息
     * 必须携带 dapp 的相关信息
     * 必须携带合法的数据所属账户地址，与接收账户地址一致
     * 必须携带存证内容：字符串，最大 1024
     * 必须携带存证类型：字符串 1-10
     *
     * @param body
     * @param markAsset
     */
    verifyTransactionBody(body, markAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, markAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper } = this;
        const recipientId = body.recipientId;
        if (!recipientId) {
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
        if (storage.key !== "dappid") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "dappid",
                ...Function_Exception_Detail,
            });
        }
        const mark = markAsset.mark;
        if (!mark) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "mark",
                function: "verifyTransactionBody",
            });
        }
        const MarkAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "markAsset",
        };
        const dapp = mark.dapp;
        this.dappTransactionFactory.verifyDAppAsset(dapp);
        if (storage.value !== dapp.dappid) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "dappid",
                to_target: "storage",
                be_target: "mark",
                ...Function_Exception_Detail,
            });
        }
        if (mark.markPossessor !== recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "recipientId",
                be_compare_prop: "markPossessor",
                to_target: "body",
                be_target: "mark",
                ...MarkAsset_Exception_Detail,
            });
        }
        const content = mark.content;
        if (!content) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "content",
                ...MarkAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isString(content)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "content",
                type: "string",
                ...MarkAsset_Exception_Detail,
            });
        }
        if (content.length > 1024) {
            throw new ArgumentIllegalException(core_util_exception_1.OVER_LENGTH, {
                prop: "content",
                limit: 1024,
                ...MarkAsset_Exception_Detail,
            });
        }
        const action = mark.action;
        if (!action) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "action",
                ...MarkAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isString(action)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "action",
                type: "string",
                ...MarkAsset_Exception_Detail,
            });
        }
        const len = action.length;
        if (len < 1 || len > 10) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_IN_EXPECTED_RANGE, {
                prop: "action",
                min: 1,
                max: 10,
                ...MarkAsset_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 mark 交易
     *
     * @param body
     * @param markAsset
     */
    init(body, markAsset) {
        const transaction = core_model_1.MarkTransaction.fromObject({
            ...body,
            asset: markAsset,
        });
        return transaction;
    }
};
MarkTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper,
        dapp_1.DAppTransactionFactory])
], MarkTransactionFactory);
exports.MarkTransactionFactory = MarkTransactionFactory;
//# sourceMappingURL=mark.js.map