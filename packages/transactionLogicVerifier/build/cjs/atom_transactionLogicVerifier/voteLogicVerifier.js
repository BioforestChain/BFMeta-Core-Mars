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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "VoteLogicVerifier");
let VoteLogicVerifier = class VoteLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    async verify(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper, transactionGetterHelper = this.transactionGetterHelper, customTransactionCenter = this.customTransactionCenter) {
        const sender = await this.logicVerify(transaction, currentBlockHeight, accountGetterHelper, transactionGetterHelper);
        await this.isVoteForAcceptVoteDelegate(transaction.recipientId, accountGetterHelper);
        await this.enableToUseDAppid(transaction, currentBlockHeight, accountGetterHelper);
        return true;
    }
    /**
     * 能否使用 dappid
     *
     * @param transaction
     * @param currentBlockHeight
     * @param accountGetterHelper
     */
    async enableToUseDAppid(transaction, currentBlockHeight, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "enableToUseDAppid",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        // 校验 dappid
        const { fromMagic, dappid, senderId, recipientId } = transaction;
        if (dappid) {
            const { blockHelper } = this;
            const dapp = (await accountGetterHelper.getDApp(fromMagic, dappid, currentBlockHeight));
            if (!dapp) {
                throw new ConsensusException(core_util_exception_1.DAPPID_IS_NOT_EXIST, {
                    dappid,
                    ...Function_Exception_Detail,
                });
            }
            if (dapp.possessorAddress === recipientId) {
                return;
            }
            // 获取dapp开发账户
            const accountInfo = await accountGetterHelper.getAccountInfo(dapp.possessorAddress);
            if (!accountInfo) {
                throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                    prop: `Account with address ${dapp.possessorAddress}`,
                    target: "blockChain",
                    ...Function_Exception_Detail,
                });
            }
            if (!accountInfo.isAcceptVote) {
                return;
            }
            const curRound = blockHelper.calcRoundByHeight(currentBlockHeight);
            // 判断当前账户是否给 dapp 开发者投过票
            const isVote = await accountGetterHelper.getVoteForDelegate(senderId, dapp.possessorAddress, dappid, curRound);
            if (!isVote) {
                throw new ConsensusException(core_util_exception_1.NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE, {
                    dappid,
                    errorId: core_model_1.NewTransactionRefuseReason.MUSET_VOTE_FOR_DAPP_POSSESSOR,
                    ...Function_Exception_Detail,
                });
            }
        }
    }
    /**
     * 是否投给了接收投票的受托人
     *
     * @param address
     * @param accountGetterHelper
     */
    async isVoteForAcceptVoteDelegate(address, accountGetterHelper = this.accountGetterHelper) {
        const Function_Exception_Detail = {
            function: "isVoteForAcceptVoteDelegate",
        };
        if (!accountGetterHelper) {
            throw new NoFoundException(core_util_exception_1.NOT_EXIST, {
                prop: "accountGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
            });
        }
        const delegate = await accountGetterHelper.getAccountInfo(address);
        if (!delegate) {
            throw new ConsensusException(core_util_exception_1.NOT_EXIST, {
                prop: `Account with address ${address}`,
                target: "blockChain",
                ...Function_Exception_Detail,
            });
        }
        if (!delegate.isDelegate) {
            throw new ConsensusException(core_util_exception_1.ACCOUNT_IS_NOT_AN_DELEGATE, {
                address,
                ...Function_Exception_Detail,
            });
        }
        if (!delegate.isAcceptVote) {
            throw new ConsensusException(core_util_exception_1.DELEGATE_IS_ALREADY_REJECT_VOTE, {
                address,
                ...Function_Exception_Detail,
            });
        }
    }
};
VoteLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], VoteLogicVerifier);
exports.VoteLogicVerifier = VoteLogicVerifier;
//# sourceMappingURL=voteLogicVerifier.js.map