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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "GiftAssetTransactionFactory");
/**
 * giftAsset 交易工厂
 *
 */
let GiftAssetTransactionFactory = class GiftAssetTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 giftAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 不能携带交易的接收账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 giftAsset 信息
     * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
     * 需要携带合法的资产所属链名称
     * 需要携带合法的资产所属链的网络标识符
     * 需要携带合法的资产名称
     * 需要携带用于赠送的资产数量，并且大于 0
     * 必须指定可抢的次数，并且是一个正整数
     * 如果携带开始抢的区块间隔，这个间隔必须是正整数
     * 必须携带抢红包规则：average/random/recipient_random
     * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
     *
     * @param body
     * @param giftAssetAsset
     */
    verifyTransactionBody(body, giftAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, giftAssetAsset, config);
        const Function_Exception_Detail = { target: "body", function: "verifyTransactionBody" };
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
        const giftAsset = giftAssetAsset.giftAsset;
        this.verifyGiftAsset(giftAsset, config);
        if (body.numberOfEffectiveBlocks && giftAsset.numberOfBeginUnfrozenBlocks) {
            if (giftAsset.numberOfBeginUnfrozenBlocks >= body.numberOfEffectiveBlocks) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_SHOULD_LT_FIELD, {
                    prop: "numberOfBeginUnfrozenBlocks",
                    field: body.numberOfEffectiveBlocks,
                    ...Function_Exception_Detail,
                    target: "giftAsset",
                });
            }
        }
        if (storage.value !== giftAsset.assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "assetType",
                to_target: "storage",
                be_target: "giftAsset",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 校验`GiftAsset`内容
     * @param giftAsset
     */
    verifyGiftAsset(giftAsset, config = this.configHelper) {
        const { baseHelper } = this;
        const Function_Exception_Detail = { function: "verifyTransactionBody" };
        if (!giftAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "giftAsset",
                ...Function_Exception_Detail,
            });
        }
        const GiftAssetAsset_Exception_Detail = {
            target: "giftAssetAsset",
            ...Function_Exception_Detail,
        };
        if (!baseHelper.isValidCipherPublicKeys(giftAsset.cipherPublicKeys)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "cipherPublicKeys",
                type: "cipher publicKeys",
                ...GiftAssetAsset_Exception_Detail,
            });
        }
        const { sourceChainMagic, sourceChainName, assetType } = giftAsset;
        this.checkChainName(sourceChainName, "sourceChainName", GiftAssetAsset_Exception_Detail);
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", GiftAssetAsset_Exception_Detail);
        this.checkAssetType(assetType, "assetType", GiftAssetAsset_Exception_Detail);
        if (!baseHelper.isPositiveInteger(giftAsset.totalGrabableTimes)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "totalGrabableTimes",
                type: "positive integer",
                ...GiftAssetAsset_Exception_Detail,
            });
        }
        // if (!baseHelper.isValidAssetNumber(giftAsset.unitReserveFee)) {
        //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
        //     prop: "unitReserveFee",
        //     type: "asset number",
        //     ...GiftAssetAsset_Exception_Detail,
        //   });
        // }
        if (giftAsset.numberOfBeginUnfrozenBlocks !== undefined &&
            !baseHelper.isNaturalNumber(giftAsset.numberOfBeginUnfrozenBlocks)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "numberOfBeginUnfrozenBlocks",
                type: "positive integer or 0",
                ...GiftAssetAsset_Exception_Detail,
            });
        }
        if (!(giftAsset.giftDistributionRule in core_model_1.GIFT_DISTRIBUTION_RULE)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "giftDistributionRule",
                type: "enum of GIFT_DISTRIBUTION_RULE",
                ...GiftAssetAsset_Exception_Detail,
            });
        }
        this.checkAssetAmount(giftAsset.amount, "amount", GiftAssetAsset_Exception_Detail);
        if (giftAsset.amount === "0") {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_SHOULD_GT_FIELD, {
                prop: "amount",
                fueld: "0",
                ...GiftAssetAsset_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 giftAsset 交易
     *
     * @param body
     * @param giftAsset
     */
    init(body, giftAsset) {
        const transaction = core_model_1.GiftAssetTransaction.fromObject({
            ...body,
            asset: giftAsset,
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
        const { chainAssetInfoHelper } = this;
        const { amount, assetType, sourceChainMagic, 
        // unitReserveFee,
        totalGrabableTimes, } = transaction.asset.giftAsset;
        const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        const minEffectiveHeight = this.transactionHelper.getTransactionMinEffectiveHeight(transaction);
        const maxEffectiveHeight = this.transactionHelper.getTransactionMaxEffectiveHeight(transaction);
        // 冻结资产
        tasks.next = eventEmitter.emit("frozenAsset", {
            type: "frozenAsset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo,
                amount: `-${amount}`,
                sourceAmount: amount,
                frozenIdBuffer: transaction.signatureBuffer,
                minEffectiveHeight,
                maxEffectiveHeight,
                totalUnfrozenTimes: totalGrabableTimes,
            },
        });
        // const chainAssetInfo = chainAssetInfoHelper.getAssetInfo(config.magic, config.assetType);
        // const reserveFee = this.jsbiHelper.multiply(unitReserveFee, totalGrabableTimes).toString();
        // // 一次性扣除预留手续费
        // tasks.next = eventEmitter.emit("fee", {
        //   type: "fee",
        //   transaction: transaction,
        //   applyInfo: {
        //     address: transaction.senderId,
        //     publicKeyBuffer: transaction.senderPublicKeyBuffer,
        //     assetInfo: chainAssetInfo,
        //     amount: `-${reserveFee}`,
        //     sourceAmount: reserveFee,
        //   },
        // });
        /**
         * 冻结预留手续费
         * 这里不使用扣除手续费,是因为如果使用扣除的模式,那么手续费会直接被当前这个区块锻造者全部拿走
         * 所以使用冻结的模式,让其它区块的锻造者通过处理`Grab`交易来从冻结的手续费中获得处理交易的手续费奖励
         */
        // tasks.next = eventEmitter.emit("frozenAsset", {
        //   type: "frozenAsset",
        //   transaction: transaction,
        //   applyInfo: {
        //     address: transaction.senderId,
        //     publicKeyBuffer: transaction.senderPublicKeyBuffer,
        //     assetInfo: chainAssetInfo,
        //     amount: `-${reserveFee}`,
        //     sourceAmount: reserveFee,
        //     frozenIdBuffer: transaction.signatureBuffer,
        //     minEffectiveHeight,
        //     maxEffectiveHeight,
        //   },
        // });
        return tasks.tryToPromise();
    }
};
GiftAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], GiftAssetTransactionFactory);
exports.GiftAssetTransactionFactory = GiftAssetTransactionFactory;
//# sourceMappingURL=giftAsset.js.map