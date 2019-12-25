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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "ToExchangeSpecialAssetLogicVerifier");
let ToExchangeSpecialAssetLogicVerifier = class ToExchangeSpecialAssetLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
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
        const toExchangeSpecialAssetAsset = transaction.asset.toExchangeSpecialAsset;
        const { senderId } = transaction;
        const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset, exchangeDirection, exchangeAssetType, } = toExchangeSpecialAssetAsset;
        if (exchangeDirection === core_model_1.EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
            const memToAssets = await accountGetterHelper.getAsset(toExchangeSource, toExchangeAsset);
            if (!memToAssets) {
                // 不存在的资产不能被交换
                throw new ConsensusException(core_util_exception_1.ASSET_NOT_EXIST, {
                    magic: toExchangeSource,
                    assetType: toExchangeAsset,
                    ...Function_Exception_Detail,
                });
            }
            if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.DAPP_ID) {
                const memDapp = (await accountGetterHelper.getDApp(beExchangeSource, beExchangeAsset, currentBlockHeight));
                if (!memDapp) {
                    throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                        dappid: beExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memDapp.possessorAddress === senderId) {
                    throw new ConsensusException(core_util_exception_1.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
                        type: "dappid",
                        asset: beExchangeAsset,
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
                if (memLocation.possessorAddress === senderId) {
                    throw new ConsensusException(core_util_exception_1.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
                        type: "locationName",
                        asset: beExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                // 只有顶级域名能交换
                if (memLocation.level !== core_model_1.LOCATION_NAME_LEVEL.TOP_LEVEL) {
                    throw new ConsensusException(core_util_exception_1.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
                        ...Function_Exception_Detail,
                    });
                }
            }
        }
        else {
            const memBeAssets = await accountGetterHelper.getAsset(beExchangeSource, beExchangeAsset);
            if (!memBeAssets) {
                // 不存在的资产不能被交换
                throw new ConsensusException(core_util_exception_1.ASSET_NOT_EXIST, {
                    magic: beExchangeSource,
                    assetType: beExchangeAsset,
                    ...Function_Exception_Detail,
                });
            }
            if (exchangeAssetType === core_model_1.SPECIAL_ASSET_TYPE.DAPP_ID) {
                const memDapp = (await accountGetterHelper.getDApp(toExchangeSource, toExchangeAsset, currentBlockHeight));
                if (!memDapp) {
                    throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                        dappid: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memDapp.possessorAddress !== senderId) {
                    throw new ConsensusException(core_util_exception_1.ACCOUNT_NOT_DAPPID_POSSESSOR, {
                        address: senderId,
                        dappid: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                if (memDapp.status === core_model_1.ASSET_STATUS.FROZEN) {
                    throw new ConsensusException(core_util_exception_1.DAPPID_ALREADY_FROZEN, {
                        dappid: toExchangeAsset,
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
                if (memLocation.possessorAddress !== senderId) {
                    throw new ConsensusException(core_util_exception_1.ACCOUNT_NOT_LOCATION_NAME_POSSESSOR, {
                        address: senderId,
                        locationName: toExchangeAsset,
                        errorId: core_model_1.NewTransactionRefuseReason.ACCOUNT_NOT_LNS_POSSESSOR,
                        ...Function_Exception_Detail,
                    });
                }
                if (memLocation.status === core_model_1.ASSET_STATUS.FROZEN) {
                    throw new ConsensusException(core_util_exception_1.LOCATION_NAME_ALREADY_FROZEN, {
                        locationName: toExchangeAsset,
                        ...Function_Exception_Detail,
                    });
                }
                // 只有顶级域名能交换
                if (memLocation.level !== core_model_1.LOCATION_NAME_LEVEL.TOP_LEVEL) {
                    throw new ConsensusException(core_util_exception_1.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE, {
                        ...Function_Exception_Detail,
                    });
                }
            }
        }
        return true;
    }
};
ToExchangeSpecialAssetLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], ToExchangeSpecialAssetLogicVerifier);
exports.ToExchangeSpecialAssetLogicVerifier = ToExchangeSpecialAssetLogicVerifier;
//# sourceMappingURL=toExchangeSpecialAssetLogicVerifier.js.map