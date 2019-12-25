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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const _txbase_1 = require("./_txbase");
const core_model_1 = require("@bfchain/core-model");
const core_helper_1 = require("@bfchain/core-helper");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const giftAsset_1 = require("./giftAsset");
const util_1 = require("@bfchain/util");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "GrabAssetTransactionFactory");
/**
 * grabAsset 交易工厂
 *
 */
let GrabAssetTransactionFactory = class GrabAssetTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper, giftAssetTransactionFactory, asymmetricHelper, cryptoHelper, Buffer) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.giftAssetTransactionFactory = giftAssetTransactionFactory;
        this.asymmetricHelper = asymmetricHelper;
        this.cryptoHelper = cryptoHelper;
        this.Buffer = Buffer;
    }
    /**
     * 校验输入信息
     * 要验证 grabAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址(是 giftAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 必须是 giftAsset 的签名
     * asset 是完整的 grabAsset 信息
     * 必须携带 发红包交易 被确认的区块签名
     * 必须携带 发红包交易 的签名
     * 必须携带 发红包交易 的 接收范围类型 rangeType
     * 必须携带 发红包交易 的 接收范围 range
     *  如果 range 长度大于 0
     *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
     *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
     *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
     * 必须携带 发红包交易 的发起交易高度
     * 如果 发红包交易 有指定开始交易高度间隔，则必须携带则个值
     * 如果 发红包交易 有指定交易的有效区块高度，则必须携带这个值
     * 如果是公钥模式，则密文必须存在，且密文签名合法
     * 根据 发红包交易 的模式，校验金额是否正确
     *
     * @param body
     * @param grabAssetAsset
     */
    verifyTransactionBody(body, grabAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, grabAssetAsset, config);
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
        if (storage.key !== "transactionSignature") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "transactionSignature",
                ...Function_Exception_Detail,
            });
        }
        const grabAsset = grabAssetAsset.grabAsset;
        if (!grabAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "grabAsset",
                function: "verifyTransactionBody",
            });
        }
        const GrabAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "grabAssetAsset",
        };
        const { blockSignature, transactionSignature, transactionRangeType, transactionRange, } = grabAsset;
        if (!blockSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "blockSignature",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidSignature(blockSignature)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "blockSignature",
                type: "block signature",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        if (!transactionSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "transactionSignature",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidSignature(transactionSignature)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "transactionSignature",
                type: "transaction signature",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        if (storage.value !== transactionSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "transactionSignature",
                to_target: "storage",
                be_target: "grabAsset",
                ...Function_Exception_Detail,
            });
        }
        if (!baseHelper.isValidRange(transactionRangeType, transactionRange)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "transactionRange",
                type: "transaction recipient",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        if (transactionRangeType & core_model_1.RANGE_TYPE.MULTI_ADDRESS) {
            if (!transactionRange.includes(body.senderId)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "senderId",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
        }
        else if (transactionRangeType & core_model_1.RANGE_TYPE.MULTI_DAPPID) {
            if (!body.dappid || !transactionRange.includes(body.dappid)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "dappid",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
        }
        else if (transactionRangeType & core_model_1.RANGE_TYPE.MULTI_LOCATION_NAME) {
            if (!body.lns || !transactionRange.includes(body.lns)) {
                throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                    to_compare_prop: "lns",
                    to_target: "body",
                    be_compare_prop: "transactionRange",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
        }
        if (!baseHelper.isPositiveInteger(grabAsset.applyBlockHeight)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "applyBlockHeight",
                type: "positive integer",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        if (grabAsset.numberOfBeginUnfrozenBlocks) {
            if (!baseHelper.isPositiveInteger(grabAsset.numberOfBeginUnfrozenBlocks)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "numberOfBeginUnfrozenBlocks",
                    type: "positive integer",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
        }
        if (grabAsset.numberOfEffectiveBlocks) {
            if (!baseHelper.isPositiveInteger(grabAsset.numberOfEffectiveBlocks)) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "numberOfEffectiveBlocks",
                    type: "positive integer",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
        }
        if (!baseHelper.isValidAssetNumber(grabAsset.amount)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "amount",
                type: "asset number",
                ...GrabAssetAsset_Exception_Detail,
            });
        }
        const { giftAsset } = grabAsset;
        /**
         * 校验`giftAsset`的基本格式
         */
        this.giftAssetTransactionFactory.verifyGiftAsset(giftAsset);
        const { cipherPublicKeys } = giftAsset;
        const trsSignBuffer = util_1.parseHexToArrayBuffer(transactionSignature);
        const blockSignBuffer = util_1.parseHexToArrayBuffer(blockSignature);
        /**如果是公钥模式，那么必须存在密文 */
        if (cipherPublicKeys.length > 0) {
            const { ciphertextSignature } = grabAsset;
            if (!ciphertextSignature) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "ciphertextSignature",
                    type: "grabAsset",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
            if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
                throw new ArgumentIllegalException(core_util_exception_1.NOT_EXIST, {
                    prop: "ciphertextSignature",
                    type: "signature",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
            const { publicKey, signature } = ciphertextSignature;
            if (!cipherPublicKeys.includes(publicKey)) {
                throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "publicKey",
                    be_compare_prop: "cipherPublicKeys",
                    to_target: "ciphertextSignature",
                    be_target: "cipherPublicKeys",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
            /// 对密文进行解码校验
            if (!this.transactionHelper.verifyCiphertextSignature({
                secretPublicKey: util_1.parseHexToArrayBuffer(publicKey),
                ciphertextSignatureBuffer: util_1.parseHexToArrayBuffer(signature),
                transactionSignatureBuffer: trsSignBuffer,
                senderId: body.senderId,
            })) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "ciphertextSignature",
                    type: "signature",
                    ...GrabAssetAsset_Exception_Detail,
                });
            }
        }
        /**校验金额 */
        let should_grap_amount_BI;
        switch (giftAsset.giftDistributionRule) {
            case core_model_1.GIFT_DISTRIBUTION_RULE.AVERAGE:
                should_grap_amount_BI = this.transactionHelper.calcGrabAverageGiftAssetNumber(giftAsset.amount, giftAsset.totalGrabableTimes);
                break;
            case core_model_1.GIFT_DISTRIBUTION_RULE.RANDOM:
                should_grap_amount_BI = this.transactionHelper.calcGrabRandomGiftAssetNumber(body.senderId, blockSignBuffer, trsSignBuffer, recipientId, giftAsset.amount, giftAsset.totalGrabableTimes);
                break;
            case core_model_1.GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
                should_grap_amount_BI = this.transactionHelper.calcGrabRecipientRandomGiftAssetNumber(body.senderId, blockSignBuffer, trsSignBuffer, recipientId, grabAsset.transactionRange, giftAsset.amount);
                break;
        }
        if (!should_grap_amount_BI) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "calculate amount",
                target: "giftAsset",
                ...Function_Exception_Detail,
            });
        }
        if (should_grap_amount_BI.toString() !== grabAsset.amount) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "amount",
                to_target: "grabAsset",
                be_compare_prop: should_grap_amount_BI.toString(),
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 grabAsset 交易
     *
     * @param body
     * @param grabAsset
     */
    init(body, grabAsset) {
        const transaction = core_model_1.GrabAssetTransaction.fromObject({
            ...body,
            asset: grabAsset,
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
        const { chainAssetInfoHelper } = this;
        const { grabAsset } = transaction.asset;
        const { amount, giftTransactionSignatureBuffer } = grabAsset;
        const { assetType, sourceChainMagic /* unitReserveFee */ } = grabAsset.giftAsset;
        const recipientId = transaction.recipientId;
        const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        // 发起账户将得到的资产解冻并收入账下
        tasks.next = eventEmitter.emit("unfrozenAsset", {
            type: "unfrozenAsset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo,
                amount: amount,
                sourceAmount: amount,
                frozenIdBuffer: giftTransactionSignatureBuffer,
                recipientId,
            },
        });
        return tasks.tryToPromise();
    }
};
GrabAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __param(7, util_1.Inject("cryptoHelper")),
    __param(8, util_1.Inject("Buffer")),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper,
        giftAsset_1.GiftAssetTransactionFactory,
        core_helper_1.AsymmetricHelper, Object, Object])
], GrabAssetTransactionFactory);
exports.GrabAssetTransactionFactory = GrabAssetTransactionFactory;
//# sourceMappingURL=grabAsset.js.map