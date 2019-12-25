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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "EmigrateAssetTransactionFactory");
/**
 * emigrateAsset 交易工厂
 *
 */
let EmigrateAssetTransactionFactory = class EmigrateAssetTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 emigrateAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带生成资产迁出交易的合法数据
     * 需要携带合法的资产所属链名称,并且是本链
     * 需要携带合法的资产所属链的网络标识符,并且是本链
     * 需要携带合法的资产名称，并且是链资产
     * 需要携带迁出的资产数量，并且大于 0
     * 必须携带合法的可验证的本链创世账户的签名和二次签名(创世账户的公钥+签名)
     *
     * @param body
     * @param emigrateAssetAsset
     */
    verifyTransactionBody(body, emigrateAssetAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, emigrateAssetAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
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
        if (body.toMagic === config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                ...Function_Exception_Detail,
            });
        }
        const { baseHelper, accountHelper } = this;
        const emigrateAsset = emigrateAssetAsset.emigrateAsset;
        if (!emigrateAsset) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "emigrateAsset",
                function: "verifyTransactionBody",
            });
        }
        const EmigrateAssetAsset_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "emigrateAssetAsset",
        };
        const { sourceChainMagic, sourceChainName, assetType, amount, genesisDelegateSignature, } = emigrateAsset;
        this.checkChainName(sourceChainName, "sourceChainName", EmigrateAssetAsset_Exception_Detail);
        if (sourceChainName !== config.chainName) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainName",
                to_target: "body",
                be_compare_prop: "local chain name",
                target: "body",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", EmigrateAssetAsset_Exception_Detail);
        if (sourceChainMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        this.checkAssetType(assetType, "assetType", EmigrateAssetAsset_Exception_Detail);
        if (assetType !== config.assetType) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "assetType",
                to_target: "body",
                be_compare_prop: "local chain assetType",
                target: "body",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        this.checkAssetAmount(amount, "amount", EmigrateAssetAsset_Exception_Detail);
        if (amount === "0") {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_SHOULD_GT_FIELD, {
                prop: "amount",
                fueld: "0",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        if (!genesisDelegateSignature) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "genesisDelegateSignature",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        if (!baseHelper.isValidAccountSignature(genesisDelegateSignature)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "genesisDelegateSignature",
                type: "account signature",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        const { publicKey, signature, secondPublicKey, signSignature } = genesisDelegateSignature;
        const address = accountHelper.getAddressFromPublicKeyString(publicKey);
        const genesisDelegates = this.transactionHelper.genesisDelegates(config);
        if (!genesisDelegates.includes(address)) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "signature address",
                be_compare_prop: "genesis delegate address",
                to_target: "emigrateAsset",
                be_target: "config",
                ...EmigrateAssetAsset_Exception_Detail,
            });
        }
        const signatureBuffer = util_1.parseHexToArrayBuffer(signature);
        if (!this.transactionHelper.verifyEmigrateAssetGenesisSignature({
            secretPublicKey: util_1.parseHexToArrayBuffer(publicKey),
            signatureBuffer,
            chainName: sourceChainName,
            magic: sourceChainMagic,
            assetType,
            senderId: body.senderId,
        })) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "genesisDelegateSignature",
                type: "signature",
                target: "genesisDelegateSignature",
                ...Function_Exception_Detail,
            });
        }
        if (secondPublicKey && signSignature) {
            if (!this.transactionHelper.verifyEmigrateAssetGenesisSignature({
                secretPublicKey: util_1.parseHexToArrayBuffer(secondPublicKey),
                signatureBuffer: util_1.parseHexToArrayBuffer(signSignature),
                chainName: sourceChainName,
                magic: sourceChainMagic,
                assetType,
                senderId: body.senderId,
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
    }
    /**
     * 初始化 emigrateAsset 交易
     *
     * @param body
     * @param emigrateAssetAsset
     */
    init(body, emigrateAssetAsset) {
        const transaction = core_model_1.EmigrateAssetTransaction.fromObject({
            ...body,
            asset: emigrateAssetAsset,
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
        // 冻结账户
        tasks.next = eventEmitter.emit("frozenAccount", {
            type: "frozenAccount",
            transaction,
            applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                accountStatus: core_model_1.ACCOUNT_STATUS.FROZEN_IN_AND_OUT,
            },
        });
        return tasks.tryToPromise();
    }
};
EmigrateAssetTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], EmigrateAssetTransactionFactory);
exports.EmigrateAssetTransactionFactory = EmigrateAssetTransactionFactory;
//# sourceMappingURL=emigrateAsset.js.map