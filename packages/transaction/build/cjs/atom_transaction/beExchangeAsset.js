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
const toExchangeAsset_1 = require("./toExchangeAsset");
const util_1 = require("@bfchain/util");
const core_model_constants_1 = require("@bfchain/core-model-constants");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "BeExchangeAssetTransactionFactory");
/**
 * beExchangeAsset 交易工厂
 *
 */
let BeExchangeAssetTransactionFactory = class BeExchangeAssetTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper, jsbiHelper, toExchangeAssetTransactionFactory) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.jsbiHelper = jsbiHelper;
        this.toExchangeAssetTransactionFactory = toExchangeAssetTransactionFactory;
    }
    /**
     * 校验输入信息
     * 要验证 beExchangeAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址(是 toExchangeAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 值必须是 to 交易的签名
     * asset 是完整的 beExchangeAsset 的交易
     * 必须携带 toExchangeAsset 的签名
     * 必须携带用于交换的资产数量和交换得到的资产数量
     * 必须携带 toExchangeAsset 的发起交易高度
     * 如果 toExchangeAsset 有指定开始交易高度间隔，则必须携带则个值
     * 如果 toExchangeAsset 有指定交易的有效区块高度，则必须携带这个值
     * 必须携带 申请资产交换交易 的 接收范围类型 rangeType
     * 必须携带 申请资产交换交易 的 接收范围 range
     *  如果 range 长度大于 0
     *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
     *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
     *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
     * 用于交换的资产数量必须等于被交换资产数量价格转换后得到的资产数量
     * 如果是公钥模式，则密文必须存在，且密文签名合法
     *
     * @param body
     * @param beExchangeAssetAsset
     */
    verifyTransactionBody(body, beExchangeAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, beExchangeAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper, jsbiHelper } = this;
        const recipientId = body.recipientId;
        if (!recipientId) {
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
                ...Function_Exception_Detail,
            });
        }
        const storage = body.storage;
        if (storage.key !== "transactionSignature") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "transactionSignature",
                ...Function_Exception_Detail,
            });
        }
        const beExchangeAsset = beExchangeAssetAsset.beExchangeAsset;
        if (!beExchangeAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "beExchangeAsset",
                function: "verifyTransactionBody",
            });
        }
        const BeExchangeAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "beExchangeAsset",
        };
        const { transactionSignature } = beExchangeAsset;
        if (!transactionSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "transactionSignature",
                ...BeExchangeAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidSignature(transactionSignature)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "transactionSignature",
                type: "transaction signature",
                ...BeExchangeAssetAsset_Exception_Detail,
            });
        }
        if (storage.value !== transactionSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "transactionSignature",
                to_target: "storage",
                be_target: "beExchangeAsset",
                ...Function_Exception_Detail,
            });
        }
        const { toExchangeNumber, beExchangeNumber } = beExchangeAsset;
        this.checkAssetAmount(toExchangeNumber, "toExchangeNumber", BeExchangeAssetAsset_Exception_Detail);
        this.checkAssetAmount(beExchangeNumber, "beExchangeNumber", BeExchangeAssetAsset_Exception_Detail);
        if (!baseHelper.isPositiveInteger(beExchangeAsset.applyBlockHeight)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "applyBlockHeight",
                type: "positive integer",
                ...BeExchangeAssetAsset_Exception_Detail,
            });
        }
        // if (beExchangeAsset.numberOfBeginUnfrozenBlocks) {
        //   if (!baseHelper.isPositiveInteger(beExchangeAsset.numberOfBeginUnfrozenBlocks)) {
        //     throw new ArgumentIllegalException(PROP_IS_INVALID, {
        //       prop: "numberOfBeginUnfrozenBlocks",
        //       type: "positive integer",
        //       ...BeExchangeAssetAsset_Exception_Detail,
        //     });
        //   }
        // }
        if (beExchangeAsset.numberOfEffectiveBlocks) {
            if (!baseHelper.isPositiveInteger(beExchangeAsset.numberOfEffectiveBlocks)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "numberOfEffectiveBlocks",
                    type: "positive integer",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
        }
        const { transactionRangeType, transactionRange } = beExchangeAsset;
        if (!baseHelper.isValidRange(transactionRangeType, transactionRange)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "transactionRange",
                type: "transaction recipient",
                ...BeExchangeAssetAsset_Exception_Detail,
            });
        }
        if (transactionRangeType & core_model_constants_1.RANGE_TYPE.MULTI_ADDRESS) {
            if (!transactionRange.includes(body.senderId)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "senderId",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
        }
        else if (transactionRangeType & core_model_constants_1.RANGE_TYPE.MULTI_DAPPID) {
            if (!body.dappid || !transactionRange.includes(body.dappid)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "dappid",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
        }
        else if (transactionRangeType & core_model_constants_1.RANGE_TYPE.MULTI_LOCATION_NAME) {
            if (!body.lns || !transactionRange.includes(body.lns)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "lns",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
        }
        const { exchangeAsset } = beExchangeAsset;
        /**校验`exchangeAsset`的基本格式 */
        this.toExchangeAssetTransactionFactory.verifyToExchangeAsset(exchangeAsset);
        if (!baseHelper.isValidRate(exchangeAsset.exchangeRate)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "exchangeRate",
                type: "rate",
                ...BeExchangeAssetAsset_Exception_Detail,
            });
        }
        const minToExchangeNumber_BI = jsbiHelper.multiplyRoundFraction(beExchangeAsset.beExchangeNumber, {
            numerator: exchangeAsset.exchangeRate.prevWeight,
            denominator: exchangeAsset.exchangeRate.nextWeight,
        });
        if (minToExchangeNumber_BI > BigInt(beExchangeAsset.toExchangeNumber)) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "toExchangeNumber",
                be_compare_prop: "beExchangeNumber",
                to_target: "beExchangeAsset",
                be_target: "beExchangeAsset",
                ...BeExchangeAssetAsset_Exception_Detail,
            });
        }
        const { cipherPublicKeys } = exchangeAsset;
        /**如果是公钥模式，那么必须存在密文 */
        if (cipherPublicKeys.length > 0) {
            if (!baseHelper.isValidAccountSignature(beExchangeAsset.ciphertextSignature)) {
                throw new ArgumentIllegalException(core_util_exception_1.NOT_EXIST, {
                    prop: "ciphertextSignature",
                    type: "signature",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
            const beExchangeAssetModel = core_model_1.BeExchangeAssetModel.fromObject(beExchangeAsset);
            const { transactionSignatureBuffer, ciphertextSignature } = beExchangeAssetModel;
            const { publicKeyBuffer, signatureBuffer, publicKey } = ciphertextSignature;
            if (!cipherPublicKeys.includes(publicKey)) {
                throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "publicKey",
                    be_compare_prop: "cipherPublicKeys",
                    to_target: "ciphertextSignature",
                    be_target: "cipherPublicKeys",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
            /// 对密文进行解码校验
            if (!this.transactionHelper.verifyCiphertextSignature({
                secretPublicKey: publicKeyBuffer,
                ciphertextSignatureBuffer: signatureBuffer,
                transactionSignatureBuffer: transactionSignatureBuffer,
                senderId: body.senderId,
            })) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "ciphertextSignature",
                    type: "signature",
                    ...BeExchangeAssetAsset_Exception_Detail,
                });
            }
        }
    }
    /**
     * 初始化 beExchangeAsset 交易
     *
     * @param body
     * @param beExchangeAsset
     */
    init(body, beExchangeAsset) {
        const transaction = core_model_1.BeExchangeAssetTransaction.fromObject({
            ...body,
            asset: beExchangeAsset,
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
        const { exchangeAsset, toExchangeNumber, beExchangeNumber } = transaction.asset.beExchangeAsset;
        const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset } = exchangeAsset;
        const beAssetInfo = this.chainAssetInfoHelper.getAssetInfo(beExchangeSource, beExchangeAsset);
        // 扣除发起账户用于交换资产
        tasks.next = eventEmitter.emit("asset", {
            type: "asset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo: beAssetInfo,
                amount: `-${beExchangeNumber}`,
                sourceAmount: beExchangeNumber,
            },
        });
        // 累加接收账户交换得到的资产
        const recipientId = transaction.recipientId;
        tasks.next = eventEmitter.emit("asset", {
            type: "asset",
            transaction: transaction,
            applyInfo: {
                address: recipientId,
                assetInfo: beAssetInfo,
                amount: beExchangeNumber,
                sourceAmount: beExchangeNumber,
            },
        });
        const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(toExchangeSource, toExchangeAsset);
        // 累加发起账户交换得到的资产
        tasks.next = eventEmitter.emit("unfrozenAsset", {
            type: "unfrozenAsset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo: toAssetInfo,
                amount: toExchangeNumber,
                sourceAmount: toExchangeNumber,
                frozenIdBuffer: transaction.asset.beExchangeAsset.transactionSignatureBuffer,
                recipientId,
            },
        });
        return tasks.tryToPromise();
    }
};
BeExchangeAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper,
        core_helper_1.JSBIHelper,
        toExchangeAsset_1.ToExchangeAssetTransactionFactory])
], BeExchangeAssetTransactionFactory);
exports.BeExchangeAssetTransactionFactory = BeExchangeAssetTransactionFactory;
//# sourceMappingURL=beExchangeAsset.js.map