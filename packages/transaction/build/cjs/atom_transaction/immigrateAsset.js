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
const emigrateAsset_1 = require("./emigrateAsset");
const util_1 = require("@bfchain/util");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "ImmigrateAssetTransactionFactory");
/**
 * immigrateAsset 交易工厂
 *
 */
let ImmigrateAssetTransactionFactory = class ImmigrateAssetTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper, emigrateAssetTransactionFactory, configMap) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.emigrateAssetTransactionFactory = emigrateAssetTransactionFactory;
        this.configMap = configMap;
    }
    /**
     * 校验输入信息
     * 要验证 immigrateAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 必须是 emigrateAsset 的签名
     * 必须携带生成资产迁入交易的合法数据
     * 必须携带完整的可验证的 资产迁出 交易
     * 必须携带合法的可验证的本链创世受托人的签名和二次签名
     *
     * @param body
     * @param migrateAssetAsset
     */
    verifyTransactionBody(body, immigrateAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, immigrateAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper, accountHelper, emigrateAssetTransactionFactory } = this;
        if (body.recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_EXIST, {
                prop: "recipientId",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.fromMagic === config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_BE, {
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
        if (storage.key !== "transactionSignature") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "transactionSignature",
                ...Function_Exception_Detail,
            });
        }
        const immigrateAsset = immigrateAssetAsset.immigrateAsset;
        if (!immigrateAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "immigrateAsset",
                function: "verifyTransactionBody",
            });
        }
        const ImmigrateAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "migrateAssetAsset",
        };
        const { genesisDelegateSignature, emigrateAssetTransaction } = immigrateAsset;
        if (!emigrateAssetTransaction) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "emigrateAssetTransaction",
                ...ImmigrateAssetAsset_Exception_Detail,
            });
        }
        // 验证完整交易包含签名
        const emigrateAssetTransactionModel = emigrateAssetTransactionFactory.fromJSON(emigrateAssetTransaction);
        const otherChainConfig = this.configMap.get(emigrateAssetTransactionModel.fromMagic);
        if (!otherChainConfig) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_EXIST, {
                prop: emigrateAssetTransactionModel.fromMagic,
                target: "configMap",
                ...Function_Exception_Detail,
            });
        }
        emigrateAssetTransactionFactory.verify(emigrateAssetTransactionModel, otherChainConfig);
        if (!genesisDelegateSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "genesisDelegateSignature",
                ...ImmigrateAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidAccountSignature(genesisDelegateSignature)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "genesisDelegateSignature",
                type: "account signature",
                ...ImmigrateAssetAsset_Exception_Detail,
            });
        }
        const { publicKey, signature, secondPublicKey, signSignature } = genesisDelegateSignature;
        const address = accountHelper.getAddressFromPublicKeyString(publicKey);
        const genesisDelegates = this.transactionHelper.genesisDelegates(config);
        if (!genesisDelegates.includes(address)) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "signature address",
                be_compare_prop: "genesis delegate address",
                to_target: "immigrateAsset",
                be_target: "config",
                ...ImmigrateAssetAsset_Exception_Detail,
            });
        }
        const signatureBuffer = util_1.parseHexToArrayBuffer(signature);
        if (!this.transactionHelper.verifyImmigrateAssetGenesisSignature({
            secretPublicKey: util_1.parseHexToArrayBuffer(publicKey),
            signatureBuffer,
            transactionSignatureBuffer: emigrateAssetTransactionModel.signatureBuffer,
        })) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "genesisDelegateSignature",
                type: "signature",
                target: "genesisDelegateSignature",
                ...Function_Exception_Detail,
            });
        }
        if (secondPublicKey && signSignature) {
            if (!this.transactionHelper.verifyImmigrateAssetGenesisSignature({
                secretPublicKey: util_1.parseHexToArrayBuffer(secondPublicKey),
                signatureBuffer: util_1.parseHexToArrayBuffer(signSignature),
                transactionSignatureBuffer: emigrateAssetTransactionModel.signatureBuffer,
                genesisSignatureBuffer: signatureBuffer,
            })) {
                throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                    prop: "genesisDelegateSignSignature",
                    type: "signature",
                    target: "genesisDelegateSignSignature",
                    ...Function_Exception_Detail,
                });
            }
        }
        if (storage.value !== emigrateAssetTransaction.signature) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "signature",
                to_target: "storage",
                be_target: "emigrateAssetTransaction",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 immigrateAsset 交易
     *
     * @param body
     * @param immigrateAssetAsset
     */
    init(body, immigrateAssetAsset) {
        // FIXME: @wmc
        const transaction = core_model_1.ImmigrateAssetTransaction.fromObject({
            ...body,
            asset: immigrateAssetAsset,
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
        const { amount, sourceChainMagic, assetType, } = transaction.asset.immigrateAsset.emigrateAssetTransaction.asset.emigrateAsset;
        const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        // 累加资产
        tasks.next = eventEmitter.emit("asset", {
            type: "asset",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
                assetInfo,
                amount: amount,
                sourceAmount: amount,
            },
        });
        return tasks.tryToPromise();
    }
};
ImmigrateAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper,
        emigrateAsset_1.EmigrateAssetTransactionFactory,
        core_helper_1.ConfigHelperMap])
], ImmigrateAssetTransactionFactory);
exports.ImmigrateAssetTransactionFactory = ImmigrateAssetTransactionFactory;
//# sourceMappingURL=immigrateAsset.js.map