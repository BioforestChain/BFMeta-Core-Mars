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
const _txbaseLogicVerifier_1 = require("./_txbaseLogicVerifier");
const core_model_1 = require("@bfchain/core-model");
const util_1 = require("@bfchain/util");
const core_helper_account_1 = require("@bfchain/core-helper-account");
const core_helper_transaction_1 = require("@bfchain/core-helper-transaction");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "IssueAssetLogicVerifier");
let IssueAssetLogicVerifier = class IssueAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor(accountHelper, transactionHelper) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        const issueAsset = transaction.asset.issueAsset;
        // 保证账户上足够的本链资产，避免 py 操作
        const { magic: chainMagic, assetType: chainAssetType, issueAssetMinChainAsset, } = this.configHelper;
        const { accountAssets } = sender;
        this.isPossessAssetExceptForChainAsset(accountAssets);
        const remainBalance = BigInt(accountAssets[chainMagic][chainAssetType].assetNumber) - BigInt(transaction.fee);
        if (BigInt(issueAssetMinChainAsset) > remainBalance) {
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                reason: `No enough asset, Min account asset ${issueAssetMinChainAsset}, remain Assets: ${remainBalance}`,
                errorId: core_model_1.NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
                function: "verify",
            });
        }
        await this.isLocationNamePossessorOrManager(transaction, currentBlockHeight, accountGetterHelper);
        await this.isDAppidPossessor(transaction, currentBlockHeight, accountGetterHelper);
        this.checkMaxIssueAssets(BigInt(issueAsset.expectedIssuedAssets), remainBalance);
        await this.isAssetTypeForbidden(issueAsset.assetType, accountGetterHelper);
        await this.isAssetTypeAlreadyExist(issueAsset.assetType, accountGetterHelper);
        await this.isAssetAlreadyExist(chainMagic, issueAsset.assetType, accountGetterHelper);
        await this.isGenesisAccountTransferToApplyAccount(transaction, transactionGetterHelper);
        return true;
    }
    /**
     * 发起账户是否是链域名的拥有者账户或管理账户
     *
     * @param transaction
     * @param currentBlockHeight
     */
    async isLocationNamePossessorOrManager(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isLocationNamePossessorOrManager",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 资产的发行账户不能是链域名的拥有者账户或管理账户
        const memLocationName = await accountGetterHelper.getLocationName(transaction.fromMagic, "", currentBlockHeight, {
            address: transaction.senderId,
        });
        if (memLocationName) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_CAN_NOT_BE_FROZEN, {
                address: transaction.senderId,
                reason: "Location name possessor or manager can not initiate a asset transaction",
                errorId: core_model_1.NewTransactionRefuseReason.LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 发起账户是否是 dappid 的拥有者账户
     *
     * @param transaction
     * @param currentBlockHeight
     */
    async isDAppidPossessor(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isDAppidPossessor",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 资产的发行账户不能是dapp的拥有者
        const memDApp = await accountGetterHelper.getDApp(transaction.fromMagic, "", currentBlockHeight, { address: transaction.senderId });
        if (memDApp) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_CAN_NOT_BE_FROZEN, {
                address: transaction.senderId,
                reason: "DApp id possessor can not initiate a asset transaction",
                errorId: core_model_1.NewTransactionRefuseReason.DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 校验资产最大的发行量
     *
     * @param expectedIssuedAssets
     * @param remainChainAsset
     */
    checkMaxIssueAssets(expectedIssuedAssets, remainChainAsset) {
        // 验证数字资产的最大发行数量
        const maxIssueAssets = remainChainAsset * BigInt(this.configHelper.chainAssetAndDigitalAssetExchangeRate);
        if (expectedIssuedAssets > maxIssueAssets) {
            throw new ConsensusException(core_util_exception_1.TOO_MANY_EXPECTEDISSUEDASSETS, {
                reason: `Remain balance: ${remainChainAsset.toString()}, max isseuedAssets: ${maxIssueAssets.toString()}, received expectedIssuedAssets: ${expectedIssuedAssets.toString()}`,
                function: "checkMaxIssueAssets",
            });
        }
    }
    /**
     * 资产名是否已经存在
     *
     * @param assetType
     */
    async isAssetTypeForbidden(assetType, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isAssetTypeForbidden",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 验证资产名是否被禁用
        const result = await accountGetterHelper.isCurrencyForbidden(assetType);
        if (result) {
            throw new ConsensusException(core_util_exception_1.FORBIDDEN, {
                prop: `AssetType ${assetType}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 资产名是否已经存在
     *
     * @param assetType
     */
    async isAssetTypeAlreadyExist(assetType, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isAssetTypeAlreadyExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 验证资产名是否已经存在
        const memLegalCurrency = await accountGetterHelper.getCurrency(assetType);
        if (memLegalCurrency) {
            throw new ConsensusException(core_util_exception_1.ALREADY_EXIST, {
                prop: `AssetType ${assetType}`,
                target: "blockChain",
                errorId: core_model_1.NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 资产是否已经存在
     *
     * @param magic
     * @param assetType
     */
    async isAssetAlreadyExist(magic, assetType, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isAssetAlreadyExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 验证资产是否已经存在
        const memAssets = await accountGetterHelper.getAsset(magic, assetType);
        if (memAssets) {
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_EXIST, {
                magic,
                assetType,
                errorId: core_model_1.NewTransactionRefuseReason.ASSET_ALREADY_EXIST,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 资产的创世账户是否给资产的发行账户转过账
     *
     * @param transaction
     */
    async isGenesisAccountTransferToApplyAccount(transaction, transactionGetterHelper = this.transactionGetterHelper) {
        const Function_Exception_Detail = {
            function: "isGenesisAccountTransferToApplyAccount",
        };
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 查询指定的创世账户是否已经给发起账户转过账
        const countTrs = await transactionGetterHelper.getCountTransaction({
            senderId: transaction.asset.issueAsset.genesisAddress,
            recipientId: transaction.senderId,
            type: this.transactionHelper.TRANSFER_ASSET,
        });
        if (countTrs < 1) {
            throw new ConsensusException(core_util_exception_1.TRANSFER_TO_SENDER_BEFORE, {
                genesisAddress: transaction.asset.issueAsset.genesisAddress,
                senderAddress: transaction.senderId,
                ...Function_Exception_Detail,
            });
        }
    }
};
IssueAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject(core_helper_account_1.AccountBaseHelper)),
    __param(1, util_1.Inject(core_helper_account_1.AccountBaseHelper)),
    __metadata("design:paramtypes", [core_helper_account_1.AccountBaseHelper,
        core_helper_transaction_1.TransactionHelper])
], IssueAssetLogicVerifier);
exports.IssueAssetLogicVerifier = IssueAssetLogicVerifier;
//# sourceMappingURL=issueAssetLogicVerifier.js.map