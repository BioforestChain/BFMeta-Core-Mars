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
const _txbaseLogicVerifier_1 = require("./_txbaseLogicVerifier");
const core_model_1 = require("@bfchain/core-model");
const util_1 = require("@bfchain/util");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "IssueSubchainLogicVerifier");
let IssueSubchainLogicVerifier = class IssueSubchainLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const Function_Exception_Detail = {
            function: "verify",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        const issueSubchain = transaction.asset.issueSubchain;
        // 保证账户上足够的本链资产，避免 py 操作
        const { magic: chainMagic, assetType: chainAssetType, issueSubchainMinChainAsset, parentGenesisBlock, } = this.configHelper;
        const { accountAssets } = sender;
        this.isPossessAssetExceptForChainAsset(accountAssets);
        // 子链不能再次发行子链
        if (parentGenesisBlock) {
            throw new ConsensusException(core_util_exception_1.SUBCHAIN_CAN_NOT_ISSUE_SUBCHAIN, {
                magic: parentGenesisBlock.remark.magic,
                ...Function_Exception_Detail,
            });
        }
        const remainBalance = BigInt(accountAssets[chainMagic][chainAssetType].assetNumber) - BigInt(transaction.fee);
        if (BigInt(issueSubchainMinChainAsset) > remainBalance) {
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                reason: `No enough asset, Min account asset ${issueSubchainMinChainAsset}, remain Assets: ${remainBalance}`,
                errorId: core_model_1.NewTransactionRefuseReason.CHAIN_ASSET_NOT_ENOUGH,
                ...Function_Exception_Detail,
            });
        }
        await this.isLocationNamePossessorOrManager(transaction, currentBlockHeight, accountGetterHelper);
        await this.isDAppidPossessor(transaction, currentBlockHeight, accountGetterHelper);
        await this.checkMaxTPSPerBlock(issueSubchain.maxTPSPerBlock, accountGetterHelper);
        await this.isSubchainNameForbidden(issueSubchain.chainName, accountGetterHelper);
        await this.isSubchainNameAlreadyExist(issueSubchain.chainName, accountGetterHelper);
        await this.isSubchainAssetTypeForbidden(issueSubchain.assetType, accountGetterHelper);
        await this.isSubchainAssetTypeAlreadyExist(issueSubchain.assetType, accountGetterHelper);
        // FIXME: 子链的创世链域名不需要在父链创建，而且二者根域名不同无法创建
        // 链上域名的根域名都是链名
        // await this.isGenesisNodeAddressAlreadyExist(
        //   issueSubchain.genesisNodeAddress,
        //   issueSubchain.magic,
        //   currentBlockHeight,
        //   accountGetterHelper,
        // );
        await this.isSubchainAlreadyExist(issueSubchain.magic, accountGetterHelper);
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
                reason: "Location name possessor or manager can not initiate a subchain transaction",
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
                reason: "DApp id possessor can not initiate a subchain transaction",
                errorId: core_model_1.NewTransactionRefuseReason.DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 链名是否被禁用
     *
     * @param name
     */
    async isSubchainNameForbidden(name, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isSubchainNameForbidden",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const result = await accountGetterHelper.isCurrencyForbidden(name);
        // 子链名禁止使用
        if (result) {
            throw new ConsensusException(core_util_exception_1.FORBIDDEN, {
                prop: `Subchain name ${name}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 链名是否已经存在
     *
     * @param name
     */
    async isSubchainNameAlreadyExist(name, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isSubchainNameAlreadyExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const memLegalCurrency = await accountGetterHelper.getCurrency(name);
        // 子链名已经存在
        if (memLegalCurrency) {
            throw new ConsensusException(core_util_exception_1.ALREADY_EXIST, {
                prop: `Subchain name ${name}`,
                target: "blockChain",
                errorId: core_model_1.NewTransactionRefuseReason.CHAINNAME_ALREADY_EXIST,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 链名是否被禁用
     *
     * @param name
     */
    async isSubchainAssetTypeForbidden(assetType, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isSubchainAssetTypeForbidden",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const result = await accountGetterHelper.isCurrencyForbidden(assetType);
        // 子链资产名禁止使用
        if (result) {
            throw new ConsensusException(core_util_exception_1.FORBIDDEN, {
                prop: `Subchain assetType ${assetType}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 链资产名是否已经存在
     *
     * @param assetType
     */
    async isSubchainAssetTypeAlreadyExist(assetType, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isSubchainAssetTypeAlreadyExist",
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
                prop: `Subchain assetType ${assetType}`,
                target: "blockChain",
                errorId: core_model_1.NewTransactionRefuseReason.ASSETTYPE_ALREADY_EXIST,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 创世节点地址(链域名)是否已经存在
     *
     * @param genesisNodeAddress
     * @param magic
     * @param currentBlockHeight
     */
    async isGenesisNodeAddressAlreadyExist(genesisNodeAddress, magic, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isGenesisNodeAddressAlreadyExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const memLocation = await accountGetterHelper.getLocationName(magic, genesisNodeAddress, currentBlockHeight);
        if (!memLocation) {
            throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                locationName: genesisNodeAddress,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 资产是否已经存在
     *
     * @param transaction
     * @param issueSubchain
     */
    async isSubchainAlreadyExist(magic, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isSubchainAlreadyExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 查询本地是否已经存在这个子链, 注意忽略大小写
        const memSubchain = await accountGetterHelper.getSubchain(magic);
        if (memSubchain) {
            throw new ConsensusException(core_util_exception_1.ALREADY_EXIST, {
                prop: `Subchain with magic ${magic}}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 校验资产最大的发行量
     * 子链的每个块最大交易量不能大于已知子链每个块最大交易量的 2 倍
     *
     * @param subchainMaxTPSPerBlock
     */
    async checkMaxTPSPerBlock(subchainMaxTPSPerBlock, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkMaxTPSPerBlock",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 验证数字资产的最大发行数量
        // 子链的每个块最大交易量不能大于已知子链每个块最大交易量的 2 倍
        let maxTPSPerBlock = await accountGetterHelper.getChainMaxTPSPerBlock();
        if (maxTPSPerBlock < this.configHelper.maxTPSPerBlock) {
            maxTPSPerBlock = this.configHelper.maxTPSPerBlock;
        }
        if (subchainMaxTPSPerBlock > maxTPSPerBlock * 2) {
            throw new ConsensusException(core_util_exception_1.TOO_LARGE, {
                prop: "maxTPSPerBlock",
                reason: "Subchain max transaction per block is too large",
                errorId: core_model_1.NewTransactionRefuseReason.SUBCHAIN_MAXTPSPERBLOCK_TOO_BIG,
                ...Function_Exception_Detail,
            });
        }
    }
};
IssueSubchainLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], IssueSubchainLogicVerifier);
exports.IssueSubchainLogicVerifier = IssueSubchainLogicVerifier;
//# sourceMappingURL=issueSubchainLogicVerifier.js.map