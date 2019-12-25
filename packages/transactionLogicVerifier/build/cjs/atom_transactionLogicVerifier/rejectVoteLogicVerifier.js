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
const { ConsensusException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "RejectVoteLogicVerifyer");
let RejectVoteLogicVerifier = class RejectVoteLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        this.isDelegateAlready(sender.accountInfo);
        this.isRejectVoteAlready(sender.accountInfo);
        return true;
    }
    /**
     * 是否已经是受托人
     *
     * @param accountInfo
     */
    isDelegateAlready(accountInfo) {
        if (!accountInfo.isDelegate) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_IS_NOT_AN_DELEGATE, {
                address: accountInfo.address,
                function: "isDelegateAlready",
            });
        }
    }
    /**
     * 是否已经开启接收投票
     *
     * @param accountInfo
     */
    isRejectVoteAlready(accountInfo) {
        if (!accountInfo.isAcceptVote) {
            throw new ConsensusException(core_util_exception_1.DELEGATE_IS_ALREADY_REJECT_VOTE, {
                address: accountInfo.address,
                function: "isRejectVoteAlready",
            });
        }
    }
};
RejectVoteLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], RejectVoteLogicVerifier);
exports.RejectVoteLogicVerifier = RejectVoteLogicVerifier;
//# sourceMappingURL=rejectVoteLogicVerifier.js.map