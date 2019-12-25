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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "IssueAssetTransactionFactory");
/**
 * issueAsset 交易工厂
 *
 */
let IssueAssetTransactionFactory = class IssueAssetTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 issueAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能是交易的发起账户地址，并且是数字资产的创世账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 issueAsset 信息
     * 需要携带合法的资产所属链名称,并且是本链
     * 需要携带合法的资产所属链的网络标识符,并且是本链
     * 需要携带合法的资产缩写：3-5 位 大小写字母组成的字符串
     * 需要携带合法的预计发行资产信息
     * 需要携带合法的资产创世账户地址
     * 资产的创世账户地址不能是交易的发起账户
     * 资产的创世账户地址必须和交易的接收账户地址一致
     *
     * @param body
     * @param issueAssetAsset
     */
    verifyTransactionBody(body, issueAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, issueAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper, accountHelper } = this;
        const recipientId = body.recipientId;
        if (!body.recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "recipientId",
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
                be_compare_prop: "chain magic",
                ...Function_Exception_Detail,
            });
        }
        if (body.toMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "chain magic",
                ...Function_Exception_Detail,
            });
        }
        if (!body.storage) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "storage",
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
        const issueAsset = issueAssetAsset.issueAsset;
        if (!issueAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "issueAsset",
                function: "verifyTransactionBody",
            });
        }
        const IssueAssetAsset_Exception_Detail = {
            target: "issueAssetAsset",
            ...Function_Exception_Detail,
        };
        const { sourceChainName, sourceChainMagic, assetType, genesisAddress, expectedIssuedAssets, } = issueAsset;
        this.checkChainName(sourceChainName, "sourceChainName", IssueAssetAsset_Exception_Detail);
        if (sourceChainName !== config.chainName) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainName",
                to_target: "body",
                be_compare_prop: "local chain name",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", IssueAssetAsset_Exception_Detail);
        if (sourceChainMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (!assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "assetType",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isUpperCaseString(assetType)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "assetType",
                type: "uppercase",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        const len = assetType.length;
        if (len < 3 || len > 5) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_IN_EXPECTED_RANGE, {
                prop: "assetType",
                type: "string length",
                min: 3,
                max: 5,
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (storage.value !== assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "assetType",
                to_target: "storage",
                be_target: "issueAsset",
                ...Function_Exception_Detail,
            });
        }
        if (!expectedIssuedAssets) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "expectedIssuedAssets",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidAssetNumber(expectedIssuedAssets)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "expectedIssuedAssets",
                type: "asset number",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (!genesisAddress) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "genesisAddress",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (!accountHelper.isAddress(genesisAddress)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "genesisAddress",
                type: "account address",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (body.senderId === genesisAddress) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE_DIFFERENT, {
                to_compare_prop: "senderId",
                be_compare_prop: "genesisAddress",
                to_target: "body",
                be_target: "issueAsset",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
        if (recipientId !== genesisAddress) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "genesisAddress",
                to_target: "issueAsset",
                be_compare_prop: "recipientId",
                ...IssueAssetAsset_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 issueAsset 交易
     *
     * @param body
     * @param issueAsset
     */
    init(body, issueAsset) {
        const transaction = core_model_1.IssueAssetTransaction.fromObject({
            ...body,
            asset: issueAsset,
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
        const { senderId, senderPublicKeyBuffer } = transaction;
        const { sourceChainName, sourceChainMagic, assetType, genesisAddress, expectedIssuedAssets, } = transaction.asset.issueAsset;
        // 冻结发起账户
        tasks.next = eventEmitter.emit("frozenAccount", {
            type: "frozenAccount",
            transaction,
            applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                accountStatus: core_model_1.ACCOUNT_STATUS.FROZEN_OUT,
            },
        });
        // 发行数字资产
        tasks.next = eventEmitter.emit("issueAsset", {
            type: "issueAsset",
            transaction,
            applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                applyAddress: senderId,
                sourceChainName,
                sourceChainMagic,
                assetType,
                genesisAddress,
                expectedIssuedAssets,
                remainAssets: expectedIssuedAssets,
            },
        });
        return tasks.tryToPromise();
    }
};
IssueAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], IssueAssetTransactionFactory);
exports.IssueAssetTransactionFactory = IssueAssetTransactionFactory;
//# sourceMappingURL=issueAsset.js.map