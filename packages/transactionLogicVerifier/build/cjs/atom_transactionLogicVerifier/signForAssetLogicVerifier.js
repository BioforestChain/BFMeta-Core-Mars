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
const util_1 = require("@bfchain/util");
const core_helper_account_1 = require("@bfchain/core-helper-account");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "SignForAssetLogicVerifier");
let SignForAssetLogicVerifier = class SignForAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor(accountHelper) {
        super();
        this.accountHelper = accountHelper;
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const Function_Exception_Detail = {
            function: "verify",
        };
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        // await this.checkSecondaryTransaction(transaction, transactionGetterHelper);
        const { transactionSignature, thirdPartySignatures } = transaction.asset.signForAsset;
        const trs = (await transactionGetterHelper.getTransactionById(transactionSignature));
        if (!trs) {
            throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                prop: `Transaction with id ${transactionSignature}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
        this.isValidRecipientId(transaction, trs);
        await this.isValidThirdPartySignatures(thirdPartySignatures, accountGetterHelper);
        this.isDependentTransactionMatch(transaction, trs);
        await this.isValidToUnfrozenAsset(transaction, trs, currentBlockHeight, accountGetterHelper);
        return true;
    }
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param trustAssetJson
     */
    isValidRecipientId(transaction, trustAssetJson) {
        // 签收交易的接收账户必须是委托交易的接收账户
        if (transaction.recipientId !== trustAssetJson.recipientId) {
            throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "recipientId",
                be_compare_prop: "senderId",
                to_target: "SignForAssetTransaction",
                be_target: "TrustAssetTransaction",
                function: "isValidRecipientId",
            });
        }
    }
    /**
     * 第三方签名是否合法
     *
     * @param thirdPartySignatures
     */
    async isValidThirdPartySignatures(thirdPartySignatures, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isValidThirdPartySignatures",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const { accountHelper } = this;
        for (const thirdPartySignature of thirdPartySignatures) {
            const { publicKey, secondPublicKey } = thirdPartySignature;
            const address = accountHelper.getAddressFromPublicKeyString(publicKey);
            const trustee = await accountGetterHelper.getAccountInfo(address);
            if (!trustee) {
                throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                    prop: `Account with address ${address}`,
                    target: "blockChain",
                    ...Function_Exception_Detail,
                });
            }
            if (trustee.secondPublicKey) {
                if (trustee.secondPublicKey !== secondPublicKey) {
                    throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                        to_compare_prop: "secondPublicKey",
                        be_compare_prop: "secondPublicKey",
                        to_target: "trustee",
                        be_target: "thirdPartySignature",
                        ...Function_Exception_Detail,
                    });
                }
            }
            else {
                if (secondPublicKey) {
                    throw new ConsensusException(core_util_exception_1.CAN_NOT_CARRY_SECOND_PUBLICKEY, {
                        ...Function_Exception_Detail,
                    });
                }
            }
        }
    }
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param trustAssetJson
     */
    isDependentTransactionMatch(transaction, trustAssetJson) {
        const Function_Exception_Detail = {
            function: "isDependentTransactionMatch",
        };
        const { transactionSignature, applyBlockHeight, 
        // numberOfBeginUnfrozenBlocks,
        numberOfEffectiveBlocks, trustSenderId, trustRecipientId, trustNumberOfSignFor, trustAsset, } = transaction.asset.signForAsset;
        const trsAsset = trustAssetJson.asset.trustAsset;
        if (trsAsset.sourceChainMagic !== trustAsset.sourceChainMagic ||
            trsAsset.assetType !== trustAsset.assetType ||
            trsAsset.amount !== trustAsset.amount ||
            trsAsset.trustees.length !== trustAsset.trustees.length ||
            trsAsset.numberOfSignFor !== trustNumberOfSignFor ||
            trustAssetJson.applyBlockHeight !== applyBlockHeight ||
            trustAssetJson.senderId !== trustSenderId ||
            trustAssetJson.recipientId !== trustRecipientId) {
            throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "trustAssetInfo",
                be_compare_prop: "trustAssetInfo",
                to_target: "SignForAssetTransaction",
                be_target: "TrustAssetTransaction",
                ...Function_Exception_Detail,
            });
        }
        if (trustAssetJson.numberOfEffectiveBlocks) {
            if (numberOfEffectiveBlocks !== trustAssetJson.numberOfEffectiveBlocks) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "numberOfEffectiveBlocks",
                    be_compare_prop: "numberOfEffectiveBlocks",
                    to_target: "SignForAssetTransaction",
                    be_target: "TrustAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
        // if (trsAsset.numberOfBeginUnfrozenBlocks) {
        //     if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
        //         throw new ConsensusException(`Trust asset not match`, `transaction signature ${tr.signature} trust asset transaction signature ${transactionSignature}`);
        //     }
        // }
        const trustTrsRange = [...trustAssetJson.range, ...trsAsset.trustees];
        const trustRange = [...trustAsset.trustees];
        for (const address of trustTrsRange) {
            if (!trustRange.includes(address)) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "trustAssetRange",
                    be_compare_prop: "trustAssetRange",
                    to_target: "SignForAssetTransaction",
                    be_target: "TrustAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param trustAssetJson
     * @param currentBlockHeight
     */
    async isValidToUnfrozenAsset(transaction, trustAssetJson, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isValidToUnfrozenAsset",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const frozenAsset = await accountGetterHelper.getFrozenAsset(trustAssetJson.senderId, trustAssetJson.signature);
        if (!frozenAsset) {
            throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                prop: `Frozen asset with id ${trustAssetJson.signature}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
        const { maxEffectiveHeight, minEffectiveHeight, amount } = frozenAsset;
        // 是否到达解冻高度
        if (minEffectiveHeight > transaction.applyBlockHeight) {
            throw new ConsensusException(core_util_exception_1.NOT_BEGIN_UNFROZEN_YET, {
                frozenId: trustAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
            throw new ConsensusException(core_util_exception_1.FROZEN_ASSET_EXPIRATION, {
                frozenId: trustAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        if (maxEffectiveHeight < transaction.applyBlockHeight) {
            throw new ConsensusException(core_util_exception_1.FROZEN_ASSET_EXPIRATION, {
                frozenId: trustAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        if (amount === BigInt(0)) {
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                reason: `Trust assets already been sign for`,
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    async checkSecondaryTransaction(transaction, transactionGetterHelper = this.transactionGetterHelper) {
        const Function_Exception_Detail = {
            function: "checkSecondaryTransaction",
        };
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const count = await transactionGetterHelper.getCountTransaction({
            senderId: transaction.senderId,
            storageValue: transaction.storageValue,
        });
        if (count > 0) {
            throw new ConsensusException(core_util_exception_1.CAN_NOT_SECONDARY_TRANSACTION, {
                reason: `Can not secondary sign for asset, sender ${transaction.senderId} trust transaction signature ${transaction.storageValue}`,
                ...Function_Exception_Detail,
            });
        }
    }
};
SignForAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __param(0, util_1.Inject(core_helper_account_1.AccountBaseHelper)),
    __metadata("design:paramtypes", [core_helper_account_1.AccountBaseHelper])
], SignForAssetLogicVerifier);
exports.SignForAssetLogicVerifier = SignForAssetLogicVerifier;
//# sourceMappingURL=signForAssetLogicVerifier.js.map