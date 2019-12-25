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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "BeExchangeSpecialAssetLogicVerifier");
let BeExchangeSpecialAssetLogicVerifier = class BeExchangeSpecialAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
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
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        // await this.checkSecondaryTransaction(transaction, transactionGetterHelper);
        const beExchangeSpecialAsset = transaction.asset.beExchangeSpecialAsset;
        const { transactionSignature } = beExchangeSpecialAsset;
        const toExchangeSpecialAssetJson = (await transactionGetterHelper.getTransactionById(transactionSignature));
        if (!toExchangeSpecialAssetJson) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: `Transaction with id ${transactionSignature}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
        this.isValidRecipientId(transaction, toExchangeSpecialAssetJson);
        this.isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson);
        await this.isValidToUnfrozenAsset(transaction, toExchangeSpecialAssetJson, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        return true;
    }
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param toExchangeSpecialAssetJson
     */
    isValidRecipientId(transaction, toExchangeSpecialAssetJson) {
        // be交易的接收账户必须是to交易的发起账户
        if (transaction.recipientId !== toExchangeSpecialAssetJson.senderId) {
            throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "recipientId",
                be_compare_prop: "senderId",
                to_target: "BeExchangeSpecialAssetTransaction",
                be_target: "ToExchangeSpecialAssetTransaction",
                function: "isValidRecipientId",
            });
        }
    }
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param toExchangeSpecialAssetJson
     */
    isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson) {
        const Function_Exception_Detail = {
            function: "isDependentTransactionMatch",
        };
        const beExchangeAssetAsset = transaction.asset.beExchangeSpecialAsset;
        const { exchangeSpecialAsset, applyBlockHeight, numberOfEffectiveBlocks, transactionRangeType, transactionRange, } = beExchangeAssetAsset;
        const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset, } = exchangeSpecialAsset;
        const trsAsset = toExchangeSpecialAssetJson.asset.toExchangeSpecialAsset;
        if (trsAsset.toExchangeSource !== toExchangeSource ||
            trsAsset.beExchangeSource !== beExchangeSource ||
            trsAsset.toExchangeAsset !== toExchangeAsset ||
            trsAsset.beExchangeAsset !== beExchangeAsset ||
            toExchangeSpecialAssetJson.applyBlockHeight !== applyBlockHeight ||
            toExchangeSpecialAssetJson.rangeType !== transactionRangeType ||
            toExchangeSpecialAssetJson.range.length !== transactionRange.length) {
            throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "exchangeSpecialAssetInfo",
                be_compare_prop: "exchangeSpecialAssetInfo",
                to_target: "BeExchangeSpecialAssetTransaction",
                be_target: "ToExchangeSpecialAssetTransaction",
                ...Function_Exception_Detail,
            });
        }
        const range = toExchangeSpecialAssetJson.range;
        for (const item of range) {
            if (!transactionRange.includes(item)) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "exchangeSpecialAssetRange",
                    be_compare_prop: "exchangeSpecialAssetRange",
                    to_target: "BeExchangeSpecialAssetTransaction",
                    be_target: "ToExchangeSpecialAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
        if (toExchangeSpecialAssetJson.numberOfEffectiveBlocks) {
            if (numberOfEffectiveBlocks !== toExchangeSpecialAssetJson.numberOfEffectiveBlocks) {
                throw new ConsensusException(core_util_exception_1.NOT_MATCH, {
                    to_compare_prop: "numberOfEffectiveBlocks",
                    be_compare_prop: "numberOfEffectiveBlocks",
                    to_target: "BeExchangeSpecialAssetTransaction",
                    be_target: "ToExchangeSpecialAssetTransaction",
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param toExchangeSpecialAssetJson
     * @param currentBlockHeight
     */
    async isValidToUnfrozenAsset(transaction, toExchangeSpecialAssetJson, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper) {
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
        if (!transactionGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "transactionGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const { exchangeSpecialAsset, applyBlockHeight, 
        // numberOfBeginUnfrozenBlocks,
        numberOfEffectiveBlocks, } = transaction.asset.beExchangeSpecialAsset;
        const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset, exchangeAssetType, exchangeDirection, } = exchangeSpecialAsset;
        // 交易是否开始解冻
        if (applyBlockHeight > transaction.applyBlockHeight) {
            throw new ConsensusException(core_util_exception_1.NOT_BEGIN_UNFROZEN_YET, {
                frozenId: toExchangeSpecialAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        const senderId = transaction.senderId;
        let maxEffectiveHeight = applyBlockHeight + this.configHelper.maxApplyAndConfirmedBlockHeightDiff;
        // 交易交易是否过期
        if (currentBlockHeight > maxEffectiveHeight) {
            throw new ConsensusException(core_util_exception_1.FROZEN_ASSET_EXPIRATION, {
                frozenId: toExchangeSpecialAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        if (maxEffectiveHeight < transaction.applyBlockHeight) {
            throw new ConsensusException(core_util_exception_1.FROZEN_ASSET_EXPIRATION, {
                frozenId: toExchangeSpecialAssetJson.signature,
                ...Function_Exception_Detail,
            });
        }
        // 校验资产
        if (exchangeDirection === core_model_1.EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
            if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.DAPP_ID) {
                const memDapp = (await accountGetterHelper.getDApp(beExchangeSource, beExchangeAsset, currentBlockHeight));
                if (!memDapp) {
                    throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                        dappid: beExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memDapp.possessorAddress !== senderId) {
                    throw new ConsensusException(core_util_exception_1.ACCOUNT_NOT_DAPPID_POSSESSOR, {
                        address: senderId,
                        dappid: beExchangeAsset,
                        errorId: core_model_1.NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
                        ...Function_Exception_Detail,
                    });
                }
            }
            else if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                // 域名是否存在
                const memLocation = (await accountGetterHelper.getLocationName(beExchangeSource, beExchangeAsset, currentBlockHeight));
                if (!memLocation) {
                    throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                        locationName: beExchangeAsset,
                        errorId: core_model_1.NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
                        ...Function_Exception_Detail,
                    });
                }
                if (memLocation.possessorAddress !== senderId) {
                    throw new ConsensusException(core_util_exception_1.ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
                        address: senderId,
                        locationName: beExchangeAsset,
                        errorId: core_model_1.NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
                        ...Function_Exception_Detail,
                    });
                }
            }
        }
        else {
            if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.DAPP_ID) {
                const memDapp = (await accountGetterHelper.getDApp(toExchangeSource, toExchangeAsset, currentBlockHeight));
                if (!memDapp) {
                    throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                        dappid: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memDapp.status === core_model_1.ASSET_STATUS.NORMAL) {
                    throw new ConsensusException(core_util_exception_1.DAPPID_NOT_FROZEN, {
                        dappid: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memDapp.possessorAddress === senderId) {
                    throw new ConsensusException(core_util_exception_1.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
                        type: "dappid",
                        asset: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
            }
            else if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                // 域名是否存在
                const memLocation = (await accountGetterHelper.getLocationName(toExchangeSource, toExchangeAsset, currentBlockHeight));
                if (!memLocation) {
                    throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                        locationName: toExchangeAsset,
                        errorId: core_model_1.NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
                        ...Function_Exception_Detail,
                    });
                }
                if (memLocation.status === core_model_1.ASSET_STATUS.NORMAL) {
                    throw new ConsensusException(core_util_exception_1.LOCATION_NAME_NOT_FROZEN, {
                        locationName: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memLocation.possessorAddress === senderId) {
                    throw new ConsensusException(core_util_exception_1.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
                        type: "locationName",
                        asset: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
            }
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
                reason: `Can not secondary exchange special asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
                ...Function_Exception_Detail,
            });
        }
    }
};
BeExchangeSpecialAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], BeExchangeSpecialAssetLogicVerifier);
exports.BeExchangeSpecialAssetLogicVerifier = BeExchangeSpecialAssetLogicVerifier;
//# sourceMappingURL=beExchangeSpecialAssetLogicVerifier.js.map