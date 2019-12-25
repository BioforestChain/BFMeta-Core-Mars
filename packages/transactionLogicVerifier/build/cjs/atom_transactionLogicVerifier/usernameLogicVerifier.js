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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "UsernameLogicVerifier");
let UsernameLogicVerifier = class UsernameLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
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
        if (sender.accountInfo.username) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_ALREADY_HAVE_USERNAME, {
                errorId: core_model_1.NewTransactionRefuseReason.ACCOUNT_ALREADY_HAVE_USERNAME,
                function: "verify",
            });
        }
        await this.isAliasAlreadyExist(transaction.asset.username.alias, accountGetterHelper);
        return true;
    }
    /**
     * 委托账户是否处于冻结状态
     *
     * @param trustees
     */
    async isAliasAlreadyExist(alias, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isAliasAlreadyExist",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const memUsername = await accountGetterHelper.getAlias(alias);
        if (memUsername) {
            throw new ConsensusException(core_util_exception_1.USERNAME_ALREADY_EXIST, {
                errorId: core_model_1.NewTransactionRefuseReason.USERNAME_ALREADY_EXIST,
                ...Function_Exception_Detail,
            });
        }
    }
};
UsernameLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], UsernameLogicVerifier);
exports.UsernameLogicVerifier = UsernameLogicVerifier;
//# sourceMappingURL=usernameLogicVerifier.js.map