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
const custom_event_1 = require("./custom.event");
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "CustomTransactionFactory");
/**
 *  交易工厂
 *
 */
let CustomTransactionFactory = class CustomTransactionFactory extends _txbase_1.TransactionFactory {
    constructor(accountHelper, transactionHelper, baseHelper, configHelper, chainAssetInfoHelper, customTransactionEvent) {
        super();
        this.accountHelper = accountHelper;
        this.transactionHelper = transactionHelper;
        this.baseHelper = baseHelper;
        this.configHelper = configHelper;
        this.chainAssetInfoHelper = chainAssetInfoHelper;
        this.customTransactionEvent = customTransactionEvent;
    }
    /**
     * 校验输入信息
     * 要验证 custom 交易的基础信息是否合法和 asset 信息是否存在
     * @param body
     * @param customAsset
     */
    verifyTransactionBody(body, customAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, customAsset, config);
        const custom = customAsset.custom;
        // const { baseHelper } = this;
        const Function_Exception_Detail = { function: "verifyTransactionBody" };
        // if (body.recipientId) {
        //   throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        //     prop: "recipientId",
        //     target: "body",
        //     ...Function_Exception_Detail,
        //   });
        // }
        if (!custom) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "custom",
                ...Function_Exception_Detail,
            });
        }
        //  获取对应子链交易中心信息，与之通讯获取自定义asset的校验结果...
        if (this.customTransactionCenter) {
            const res = this.customTransactionCenter.verify(body, customAsset, config);
            if (!res.ret) {
                throw new ArgumentIllegalException(core_util_exception_1.CUSTOM_TRANS_VERIFY_FAIL, {
                    message: res.message,
                });
            }
        }
    }
    /**
     * 初始化 custom 交易
     *
     * @param body
     * @param customAsset
     */
    init(body, customAsset) {
        const transaction = core_model_1.CustomTransaction.fromObject({
            ...body,
            asset: customAsset,
        });
        return transaction;
    }
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction, eventEmitter) {
        const tasks = new util_1.TaskList();
        tasks.next = super.applyTransaction(transaction, eventEmitter);
        // TODO....账务处理
        if (this.customTransactionCenter) {
            const applyResults = this.customTransactionCenter.apply(transaction, this.configHelper);
            for (const applyResult of applyResults) {
                this.customTransactionEvent.verifyApplyResult(applyResult, transaction);
                tasks.next = this.customTransactionEvent.combineApplyEvent(transaction, eventEmitter, applyResult);
            }
        }
        //  ....
        return tasks.tryToPromise();
    }
};
__decorate([
    util_1.Inject("customTransactionCenter"),
    __metadata("design:type", Object)
], CustomTransactionFactory.prototype, "customTransactionCenter", void 0);
CustomTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper,
        custom_event_1.CustomTransactionEvent])
], CustomTransactionFactory);
exports.CustomTransactionFactory = CustomTransactionFactory;
//# sourceMappingURL=custom.js.map