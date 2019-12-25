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
const util_1 = require("@bfchain/util");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "GrabAssetLogicVerifier");
let GrabAssetLogicVerifier = class GrabAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
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
        const grabAsset = transaction.asset.grabAsset;
        const { transactionSignature } = grabAsset;
        const trs = (await transactionGetterHelper.getTransactionById(transactionSignature));
        if (!trs) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: `Transaction with id ${transactionSignature}`,
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        this.isValidRecipientId(transaction, trs);
        this.isDependentTransactionMatch(transaction, trs);
        await this.isValidToUnfrozenAsset(transaction, trs, currentBlockHeight, accountGetterHelper);
        return true;
    }
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param giftAssetJson
     */
    isValidRecipientId(transaction, giftAssetJson) {
        if (transaction.recipientId !== giftAssetJson.senderId) {
            throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "recipientId",
                be_compare_prop: "senderId",
                to_target: "GrabAssetTransaction",
                be_target: "GiftAssetTransaction",
                function: "isValidRecipientId",
            });
        }
    }
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param giftAssetJson
     */
    isDependentTransactionMatch(transaction, giftAssetJson) {
        const Function_Exception_Detail = {
            function: "isDependentTransactionMatch",
        };
        const grabAsset = transaction.asset.grabAsset;
        const { applyBlockHeight, numberOfBeginUnfrozenBlocks, numberOfEffectiveBlocks, transactionRangeType, transactionRange, giftAsset, } = grabAsset;
        const { sourceChainMagic, assetType, giftDistributionRule } = giftAsset;
        const trsAsset = giftAssetJson.asset.giftAsset;
        if (trsAsset.sourceChainMagic !== sourceChainMagic ||
            trsAsset.assetType !== assetType ||
            trsAsset.giftDistributionRule !== giftDistributionRule ||
            giftAssetJson.applyBlockHeight !== applyBlockHeight ||
            giftAssetJson.rangeType !== transactionRangeType ||
            giftAssetJson.range.length !== transactionRange.length) {
            throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "giftAssetInfo",
                be_compare_prop: "giftAssetInfo",
                to_target: "GrabAssetTransaction",
                be_target: "GiftAssetTransaction",
                ...Function_Exception_Detail,
            });
        }
        const range = transaction.range;
        for (const item of range) {
            if (!transactionRange.includes(item)) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "giftAssetRange",
                    be_compare_prop: "giftAssetRange",
                    to_target: "GrabAssetTransaction",
                    be_target: "GiftAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
        if (transaction.numberOfEffectiveBlocks) {
            if (numberOfEffectiveBlocks !== transaction.numberOfEffectiveBlocks) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "numberOfEffectiveBlocks",
                    be_compare_prop: "numberOfEffectiveBlocks",
                    to_target: "GrabAssetTransaction",
                    be_target: "GiftAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
        if (trsAsset.numberOfBeginUnfrozenBlocks) {
            if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "numberOfBeginUnfrozenBlocks",
                    be_compare_prop: "numberOfBeginUnfrozenBlocks",
                    to_target: "GrabAssetTransaction",
                    be_target: "GiftAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param giftAssetJson
     * @param currentBlockHeight
     */
    async isValidToUnfrozenAsset(transaction, giftAssetJson, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
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
        const { grabAsset } = transaction.asset;
        const { sourceChainMagic, assetType } = giftAssetJson.asset.giftAsset;
        const frozenAsset = await accountGetterHelper.getFrozenAsset(giftAssetJson.senderId, giftAssetJson.signature);
        if (!frozenAsset) {
            throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                prop: `Frozen asset with id ${giftAssetJson.signature}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
        const { maxEffectiveHeight, minEffectiveHeight, remainUnfrozenTimes, amount } = frozenAsset;
        // 是否到达解冻高度
        if (minEffectiveHeight > transaction.applyBlockHeight) {
            throw new ConsensusException(core_util_exception_1.NOT_BEGIN_UNFROZEN_YET, {
                frozenId: giftAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
            throw new ConsensusException(core_util_exception_1.FROZEN_ASSET_EXPIRATION, {
                frozenId: giftAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        if (maxEffectiveHeight < transaction.applyBlockHeight) {
            throw new ConsensusException(core_util_exception_1.FROZEN_ASSET_EXPIRATION, {
                frozenId: giftAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        if (BigInt(grabAsset.amount) > BigInt(amount)) {
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                reason: `No enough asset to change magic ${sourceChainMagic} assetType ${assetType} remain ${amount} spend ${grabAsset.amount}`,
                ...Function_Exception_Detail,
            });
        }
        if (remainUnfrozenTimes && remainUnfrozenTimes === 0) {
            throw new ConsensusException(core_util_exception_1.GRABALE_TIME_USE_UP, {
                frozenId: giftAssetJson.signature,
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
                reason: `Can not secondary grab asset, sender ${transaction.senderId} gift transaction signature ${transaction.storageValue}`,
                ...Function_Exception_Detail,
            });
        }
    }
};
GrabAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], GrabAssetLogicVerifier);
exports.GrabAssetLogicVerifier = GrabAssetLogicVerifier;
//# sourceMappingURL=grabAssetLogicVerifier.js.map