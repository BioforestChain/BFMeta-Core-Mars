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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "ToExchangeAssetTransactionFactory");
/**
 * toExchangeAsset 交易工厂
 *
 */
let ToExchangeAssetTransactionFactory = class ToExchangeAssetTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 toExchangeAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 交易体的 range 不能包含交易的发起账户地址
     * asset 是完整的 toExchangeAsset 信息
     * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
     * 必须要携带合法的用于交换的资产的来源链网络标识符
     * 必须要携带合法的被交换的资产的来源链网络标识符
     * 必须要携带合法的用于交换的资产的来源链名
     * 必须要携带合法的被交换的资产的来源链名
     * 必须要携带合法的用于交换的资产名
     * 必须要携带合法的被交换的资产名
     * 必须要携带合法的用于交换的资产数量
     * 必须携带交换比例
     * 如果携带了开始交换高度间隔，这个高度间隔必须是自然数
     * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
     *
     * @param body
     * @param toExchangeAsset
     */
    verifyTransactionBody(body, toExchangeAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, toExchangeAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
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
        if (body.range.includes(body.senderId)) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_INCLUDE, {
                prop: "range",
                target: "body",
                value: body.senderId,
                ...Function_Exception_Detail,
            });
        }
        const toExchangeAsset = toExchangeAssetAsset.toExchangeAsset;
        this.verifyToExchangeAsset(toExchangeAsset, config);
        // if (body.numberOfEffectiveBlocks && toExchangeAsset.numberOfBeginUnfrozenBlocks) {
        //   if (toExchangeAsset.numberOfBeginUnfrozenBlocks >= body.numberOfEffectiveBlocks) {
        //     throw new ArgumentIllegalException(PROP_SHOULD_LT_FIELD, {
        //       prop: "numberOfBeginUnfrozenBlocks",
        //       field: body.numberOfEffectiveBlocks,
        //       ...Function_Exception_Detail,
        //       target: "toExchangeAsset",
        //     });
        //   }
        // }
    }
    /**
     * 校验 toExchangeAsset 内容
     *
     * @param toExchangeAsset
     */
    verifyToExchangeAsset(toExchangeAsset, config = this.configHelper) {
        const { baseHelper } = this;
        const Function_Exception_Detail = { function: "verifyTransactionBody" };
        if (!toExchangeAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "toExchangeAsset",
                ...Function_Exception_Detail,
            });
        }
        const ToExchangeAssetAsset_Exception_Detail = {
            target: "toExchangeAssetAsset",
            ...Function_Exception_Detail,
        };
        if (!baseHelper.isValidCipherPublicKeys(toExchangeAsset.cipherPublicKeys)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "cipherPublicKeys",
                type: "cipher publicKeys",
                ...ToExchangeAssetAsset_Exception_Detail,
            });
        }
        this.checkChainName(toExchangeAsset.toExchangeChainName, "toExchangeChainName", ToExchangeAssetAsset_Exception_Detail);
        this.checkChainMagic(toExchangeAsset.toExchangeSource, "toExchangeSource", ToExchangeAssetAsset_Exception_Detail);
        this.checkAssetType(toExchangeAsset.toExchangeAsset, "toExchangeAsset", ToExchangeAssetAsset_Exception_Detail);
        this.checkChainName(toExchangeAsset.beExchangeChainName, "beExchangeChainName", ToExchangeAssetAsset_Exception_Detail);
        this.checkChainMagic(toExchangeAsset.beExchangeSource, "beExchangeSource", ToExchangeAssetAsset_Exception_Detail);
        this.checkAssetType(toExchangeAsset.beExchangeAsset, "beExchangeAsset", ToExchangeAssetAsset_Exception_Detail);
        this.checkAssetAmount(toExchangeAsset.toExchangeNumber, "toExchangeNumber", ToExchangeAssetAsset_Exception_Detail);
        if (!baseHelper.isValidRate(toExchangeAsset.exchangeRate)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "exchangeRate",
                type: "rate",
                ...ToExchangeAssetAsset_Exception_Detail,
            });
        }
        // if (
        //   toExchangeAsset.numberOfBeginUnfrozenBlocks !== undefined &&
        //   !baseHelper.isNaturalNumber(toExchangeAsset.numberOfBeginUnfrozenBlocks)
        // ) {
        //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
        //     prop: "numberOfBeginUnfrozenBlocks",
        //     type: "positive integer or 0",
        //     ...ToExchangeAssetAsset_Exception_Detail,
        //   });
        // }
    }
    /**
     * 初始化 toExchangeAsset 交易
     *
     * @param body
     * @param toExchangeAsset
     */
    init(body, toExchangeAsset) {
        const transaction = core_model_1.ToExchangeAssetTransaction.fromObject({
            ...body,
            asset: toExchangeAsset,
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
        const { toExchangeSource, toExchangeAsset, toExchangeNumber, } = transaction.asset.toExchangeAsset;
        const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(toExchangeSource, toExchangeAsset);
        // 冻结发起账户用于交换的资产
        tasks.next = eventEmitter.emit("frozenAsset", {
            type: "frozenAsset",
            transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo: toAssetInfo,
                amount: `-${toExchangeNumber}`,
                sourceAmount: toExchangeNumber,
                maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
                minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
                frozenIdBuffer: transaction.signatureBuffer,
            },
        });
        return tasks.tryToPromise();
    }
};
ToExchangeAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], ToExchangeAssetTransactionFactory);
exports.ToExchangeAssetTransactionFactory = ToExchangeAssetTransactionFactory;
//# sourceMappingURL=toExchangeAsset.js.map