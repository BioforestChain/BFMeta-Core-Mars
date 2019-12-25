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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "DAppPurchasingLogicVerifier");
let DAppPurchasingLogicVerifier = class DAppPurchasingLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
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
        const dappAsset = transaction.asset.dappPurchasing.dappAsset;
        const memDapp = (await accountGetterHelper.getDApp(dappAsset.sourceChainMagic, dappAsset.dappid, currentBlockHeight));
        if (!memDapp) {
            throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                dappid: dappAsset.dappid,
                ...Function_Exception_Detail,
            });
        }
        if (transaction.senderId === memDapp.possessorAddress) {
            throw new ConsensusException(core_util_exception_1.NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
                type: "dappid",
                asset: dappAsset.dappid,
                ...Function_Exception_Detail,
            });
        }
        if (transaction.recipientId !== memDapp.possessorAddress) {
            throw new ConsensusException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "recipientId",
                to_target: "transaction",
                be_compare_prop: "dapp possessor",
                ...Function_Exception_Detail,
            });
        }
        return true;
    }
};
DAppPurchasingLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], DAppPurchasingLogicVerifier);
exports.DAppPurchasingLogicVerifier = DAppPurchasingLogicVerifier;
//# sourceMappingURL=dappPurchasingLogicVerifier.js.map