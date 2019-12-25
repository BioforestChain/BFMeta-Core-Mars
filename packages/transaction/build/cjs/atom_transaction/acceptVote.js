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
const _txbase_1 = require("./_txbase");
const core_model_1 = require("@bfchain/core-model");
const core_helper_1 = require("@bfchain/core-helper");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const util_1 = require("@bfchain/util");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "AcceptVoteTransactionFactory");
/**
 * acceptVote 交易工厂
 *
 */
let AcceptVoteTransactionFactory = class AcceptVoteTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
    }
    /**
     * 校验输入信息
     * 要验证 acceptVote 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     *
     * @param body
     * @param acceptVoteAsset
     */
    verifyTransactionBody(body, acceptVoteAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, acceptVoteAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        if (body.recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_EXIST, {
                prop: "recipientId",
                ...Function_Exception_Detail,
            });
        }
        if (body.fromMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "fromMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                ...Function_Exception_Detail,
            });
        }
        if (body.toMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                ...Function_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 acceptVote 交易
     *
     * @param body
     * @param acceptVoteAsset
     */
    init(body, acceptVoteAsset) {
        const transaction = core_model_1.AcceptVoteTransaction.fromObject({
            ...body,
            asset: acceptVoteAsset,
        });
        return transaction;
    }
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction, eventEmitter, config = this.configHelper) {
        const tasks = new util_1.TaskList();
        tasks.next = super.applyTransaction(transaction, eventEmitter, config);
        // 接收投票
        tasks.next = eventEmitter.emit("acceptVote", {
            type: "acceptVote",
            transaction: transaction,
            applyInfo: {
                address: transaction.senderId,
                publicKeyBuffer: transaction.senderPublicKeyBuffer,
            },
        });
        return tasks.tryToPromise();
    }
};
AcceptVoteTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], AcceptVoteTransactionFactory);
exports.AcceptVoteTransactionFactory = AcceptVoteTransactionFactory;
//# sourceMappingURL=acceptVote.js.map