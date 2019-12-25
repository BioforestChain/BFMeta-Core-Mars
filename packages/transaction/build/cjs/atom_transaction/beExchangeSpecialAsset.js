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
const toExchangeSpecialAsset_1 = require("./toExchangeSpecialAsset");
const util_1 = require("@bfchain/util");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const core_model_1 = require("@bfchain/core-model");
const core_helper_1 = require("@bfchain/core-helper");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "BeExchangeSpecialAssetTransactionFactory");
/**
 * beExchangeSpecialAsset 交易工厂
 *
 */
let BeExchangeSpecialAssetTransactionFactory = class BeExchangeSpecialAssetTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper, jsbiHelper, toExchangeSpecialAssetTransactionFactory) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.jsbiHelper = jsbiHelper;
        this.toExchangeSpecialAssetTransactionFactory = toExchangeSpecialAssetTransactionFactory;
    }
    /**
     * 校验输入信息
     * 要验证 beExchangeSpecialAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 toExchangeSpecialAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用索引存储
     * key 值必须是 "transactionSignature"，value 必须是 申请特殊资产交换交易 的签名
     * 必须携带生成接收特殊资产交换交易的合法数据
     * 必须携带 申请特殊资产交换交易 的签名
     * 必须携带 申请特殊资产交换交易 的发起交易高度
     * 如果 申请特殊资产交换交易 有指定开始交易高度间隔，则必须携带则个值
     * 如果 申请特殊资产交换交易 有指定交易的有效区块高度，则必须携带这个值
     * 必须携带 申请特殊资产交换交易 的 接收范围类型 rangeType
     * 必须携带 申请特殊资产交换交易 的 接收范围 range
     *  如果 range 长度大于 0
     *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
     *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
     *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
     * 如果是公钥模式，则密文必须存在，且密文签名合法
     *
     * @param body
     * @param beExchangeSpecialAssetAsset
     */
    verifyTransactionBody(body, beExchangeSpecialAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, beExchangeSpecialAssetAsset, config);
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
        const beExchangeSpecialAsset = beExchangeSpecialAssetAsset.beExchangeSpecialAsset;
        if (!beExchangeSpecialAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "beExchangeSpecialAsset",
                ...Function_Exception_Detail,
            });
        }
        const BeExchangeSpecialAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "beExchangeSpecialAsset",
        };
        const transactionSignature = beExchangeSpecialAsset.transactionSignature;
        if (!transactionSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "transactionSignature",
                ...BeExchangeSpecialAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidSignature(transactionSignature)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "transactionSignature",
                type: "transaction signature",
                ...BeExchangeSpecialAssetAsset_Exception_Detail,
            });
        }
        if (storage.value !== transactionSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "transactionSignature",
                to_target: "storage",
                be_target: "beExchangeSpecialAsset",
                ...Function_Exception_Detail,
            });
        }
        if (!baseHelper.isPositiveInteger(beExchangeSpecialAsset.applyBlockHeight)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "applyBlockHeight",
                type: "positive integer",
                ...BeExchangeSpecialAssetAsset_Exception_Detail,
            });
        }
        // if (beExchangeSpecialAsset.numberOfBeginUnfrozenBlocks) {
        //   if (!baseHelper.isPositiveInteger(beExchangeSpecialAsset.numberOfBeginUnfrozenBlocks)) {
        //     throw new ArgumentIllegalException(PROP_IS_INVALID, {
        //       prop: "numberOfBeginUnfrozenBlocks",
        //       type: "positive integer",
        //       ...BeExchangeSpecialAssetAsset_Exception_Detail,
        //     });
        //   }
        // }
        if (beExchangeSpecialAsset.numberOfEffectiveBlocks) {
            if (!baseHelper.isPositiveInteger(beExchangeSpecialAsset.numberOfEffectiveBlocks)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "numberOfEffectiveBlocks",
                    type: "positive integer",
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
                });
            }
        }
        const { transactionRangeType, transactionRange } = beExchangeSpecialAsset;
        if (!baseHelper.isValidRange(transactionRangeType, transactionRange)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "transactionRange",
                type: "transaction recipient",
                ...BeExchangeSpecialAssetAsset_Exception_Detail,
            });
        }
        if (transactionRangeType & core_model_1.RANGE_TYPE.MULTI_ADDRESS) {
            if (!transactionRange.includes(body.senderId)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "senderId",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
                });
            }
        }
        else if (transactionRangeType & core_model_1.RANGE_TYPE.MULTI_DAPPID) {
            if (!body.dappid || !transactionRange.includes(body.dappid)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "dappid",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
                });
            }
        }
        else if (transactionRangeType & core_model_1.RANGE_TYPE.MULTI_LOCATION_NAME) {
            if (!body.lns || !transactionRange.includes(body.lns)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "lns",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
                });
            }
        }
        const { exchangeSpecialAsset } = beExchangeSpecialAsset;
        /**校验`exchangeSpecialAsset`的基本格式 */
        this.toExchangeSpecialAssetTransactionFactory.verifyExchangeSpecialAsset(exchangeSpecialAsset);
        const { cipherPublicKeys } = exchangeSpecialAsset;
        /**如果是公钥模式，那么必须存在密文 */
        if (cipherPublicKeys.length > 0) {
            if (!baseHelper.isValidAccountSignature(beExchangeSpecialAsset.ciphertextSignature)) {
                throw new ArgumentIllegalException(core_util_exception_1.NOT_EXIST, {
                    prop: "ciphertextSignature",
                    type: "signature",
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
                });
            }
            const beExchangeSpecialAssetModel = core_model_1.BeExchangeSpecialAssetModel.fromObject(beExchangeSpecialAsset);
            const { transactionSignatureBuffer, ciphertextSignature } = beExchangeSpecialAssetModel;
            const { publicKeyBuffer, signatureBuffer, publicKey } = ciphertextSignature;
            if (!cipherPublicKeys.includes(publicKey)) {
                throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "publicKey",
                    be_compare_prop: "cipherPublicKeys",
                    to_target: "ciphertextSignature",
                    be_target: "cipherPublicKeys",
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
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
                    ...BeExchangeSpecialAssetAsset_Exception_Detail,
                });
            }
        }
    }
    /**
     * 初始化 beExchangeSpecialAsset 交易
     *
     * @param body
     * @param beExchangeSpecialAsset
     */
    init(body, beExchangeSpecialAsset) {
        const transaction = core_model_1.BeExchangeSpecialAssetTransaction.fromObject({
            ...body,
            asset: beExchangeSpecialAsset,
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
        const { exchangeSpecialAsset, transactionSignatureBuffer, } = transaction.asset.beExchangeSpecialAsset;
        const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset, exchangeDirection, exchangeNumber, exchangeAssetType, } = exchangeSpecialAsset;
        const { senderId, senderPublicKeyBuffer, recipientId } = transaction;
        // ASSET_FROM_RECIPIENT 特殊资产来自 be 交易的发起账户
        if (exchangeDirection === core_model_1.EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
            // to 交易是购买交易
            const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(toExchangeSource, toExchangeAsset);
            // 发起账户将得到的资产解冻并收入账下(发起账户是出售特殊资产)
            tasks.next = eventEmitter.emit("unfrozenAsset", {
                type: "unfrozenAsset",
                transaction,
                applyInfo: {
                    address: senderId,
                    publicKeyBuffer: senderPublicKeyBuffer,
                    assetInfo: toAssetInfo,
                    amount: exchangeNumber,
                    sourceAmount: exchangeNumber,
                    frozenIdBuffer: transactionSignatureBuffer,
                    recipientId,
                },
            });
            if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.DAPP_ID) {
                // 接收账户成为 dappid 的拥有者
                tasks.next = eventEmitter.emit("purchaseDAppid", {
                    type: "purchaseDAppid",
                    transaction,
                    applyInfo: {
                        address: senderId,
                        publicKeyBuffer: senderPublicKeyBuffer,
                        possessorAddress: recipientId,
                        sourceChainMagic: beExchangeSource,
                        dappid: beExchangeAsset,
                    },
                });
            }
            else {
                // 接收账户成为链域名的拥有者
                tasks.next = eventEmitter.emit("purchaseLocationName", {
                    type: "purchaseLocationName",
                    transaction,
                    applyInfo: {
                        address: senderId,
                        publicKeyBuffer: senderPublicKeyBuffer,
                        possessorAddress: recipientId,
                        sourceChainMagic: beExchangeSource,
                        name: beExchangeAsset,
                    },
                });
            }
        }
        else {
            // to 交易时出售交易
            const beAssetInfo = this.chainAssetInfoHelper.getAssetInfo(beExchangeSource, beExchangeAsset);
            // 扣除发起账户用于交换资产(发起账户是购买资产)
            tasks.next = eventEmitter.emit("asset", {
                type: "asset",
                transaction,
                applyInfo: {
                    address: transaction.senderId,
                    publicKeyBuffer: senderPublicKeyBuffer,
                    assetInfo: beAssetInfo,
                    amount: `-${exchangeNumber}`,
                    sourceAmount: exchangeNumber,
                },
            });
            // 累加接收账户得到的资产
            tasks.next = eventEmitter.emit("asset", {
                type: "asset",
                transaction,
                applyInfo: {
                    address: recipientId,
                    assetInfo: beAssetInfo,
                    amount: exchangeNumber,
                    sourceAmount: exchangeNumber,
                },
            });
            if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.DAPP_ID) {
                // 发起账户成为 dappid 的拥有者
                tasks.next = eventEmitter.emit("purchaseDAppid", {
                    type: "purchaseDAppid",
                    transaction,
                    applyInfo: {
                        address: senderId,
                        publicKeyBuffer: senderPublicKeyBuffer,
                        possessorAddress: senderId,
                        sourceChainMagic: toExchangeSource,
                        dappid: toExchangeAsset,
                    },
                });
            }
            else {
                // 发起账户成为链域名的拥有者
                tasks.next = eventEmitter.emit("purchaseLocationName", {
                    type: "purchaseLocationName",
                    transaction,
                    applyInfo: {
                        address: senderId,
                        publicKeyBuffer: senderPublicKeyBuffer,
                        possessorAddress: senderId,
                        sourceChainMagic: toExchangeSource,
                        name: toExchangeAsset,
                    },
                });
            }
        }
        return tasks.tryToPromise();
    }
};
BeExchangeSpecialAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper,
        core_helper_1.JSBIHelper,
        toExchangeSpecialAsset_1.ToExchangeSpecialAssetTransactionFactory])
], BeExchangeSpecialAssetTransactionFactory);
exports.BeExchangeSpecialAssetTransactionFactory = BeExchangeSpecialAssetTransactionFactory;
//# sourceMappingURL=beExchangeSpecialAsset.js.map