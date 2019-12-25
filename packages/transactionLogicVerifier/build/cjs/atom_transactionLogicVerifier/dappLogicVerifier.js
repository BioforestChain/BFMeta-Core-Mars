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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "DAppLogicVerifier");
let DAppLogicVerifier = class DAppLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        const dapp = transaction.asset.dapp;
        const { purchaseAsset } = dapp;
        if (purchaseAsset) {
            await this.isPurchaseAssetExist(purchaseAsset, accountGetterHelper);
        }
        await this.isPurchaseDAppidExist(dapp, currentBlockHeight, accountGetterHelper);
        return true;
    }
    /**
     * 用于购买 dapp 的资产是否存在
     *
     * @param purchaseAsset
     */
    async isPurchaseAssetExist(purchaseAsset, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isPurchaseAssetExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const { sourceChainMagic, assetType, amount } = purchaseAsset;
        const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);
        if (!memAsset) {
            throw new ConsensusException(core_util_exception_1.ASSET_NOT_EXIST, {
                magic: sourceChainMagic,
                assetType,
                ...Function_Exception_Detail,
            });
        }
        if (sourceChainMagic !== this.configHelper.magic && assetType !== this.configHelper.assetType) {
            if (memAsset.remainAssets < BigInt(amount)) {
                throw new ConsensusException(core_util_exception_1.ASSET_NOT_ENOUGH, {
                    reason: `Purchase asset amount greater than remain assets, spend ${amount}, remain ${memAsset.remainAssets}`,
                    errorId: core_model_1.NewTransactionRefuseReason.ASSET_NOT_ENOUGH,
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 购买的 dappid 是否存在
     *
     * @param dapp
     * @param currentBlockHeight
     * @param accountGetterHelper
     */
    async isPurchaseDAppidExist(dapp, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isPurchaseDAppidExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const memDapp = await accountGetterHelper.getDApp(dapp.sourceChainMagic, dapp.dappid, currentBlockHeight);
        if (memDapp) {
            throw new ConsensusException(core_util_exception_1.DAPPID_IS_ALREADY_EXIST, {
                dappid: dapp.dappid,
                errorId: core_model_1.NewTransactionRefuseReason.DAPP_ALREADY_EXISTS,
                ...Function_Exception_Detail,
            });
        }
    }
};
DAppLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], DAppLogicVerifier);
exports.DAppLogicVerifier = DAppLogicVerifier;
//# sourceMappingURL=dappLogicVerifier.js.map