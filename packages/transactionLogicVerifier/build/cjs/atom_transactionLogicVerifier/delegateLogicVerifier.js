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
const { ConsensusException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "DelegateLogicVerifier");
let DelegateLogicVerifier = class DelegateLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const Function_Exception_Detail = {
            function: "verify",
        };
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        const accountInfo = sender.accountInfo;
        if (!accountInfo.username) {
            throw new ConsensusException(core_util_exception_1.SET_USERANME_AT_FIRST, {
                address: accountInfo.address,
                ...Function_Exception_Detail,
            });
        }
        if (transaction.asset.delegate.username !== accountInfo.username) {
            throw new ConsensusException(core_util_exception_1.INVALID_ACCOUNT_ALIAS, {
                address: accountInfo.address,
                alias: transaction.asset.delegate.username,
                ...Function_Exception_Detail,
            });
        }
        if (accountInfo.isDelegate) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_IS_ALREADY_AN_DELEGATE, {
                address: accountInfo.address,
                errorId: core_model_1.NewTransactionRefuseReason.ACCOUNT_ALREADY_DELEGATE,
                ...Function_Exception_Detail,
            });
        }
        return true;
    }
};
DelegateLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], DelegateLogicVerifier);
exports.DelegateLogicVerifier = DelegateLogicVerifier;
//# sourceMappingURL=delegateLogicVerifier.js.map