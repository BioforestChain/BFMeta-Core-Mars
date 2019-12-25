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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "SetLnsManagerLogicVerifier");
let SetLnsManagerLogicVerifier = class SetLnsManagerLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
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
        const lnsManager = transaction.asset.lnsManager;
        const sourceChainMagic = lnsManager.sourceChainMagic;
        const name = lnsManager.name;
        // 不能将冻结账户设置为管理员
        const newManager = await accountGetterHelper.getAccountInfo(lnsManager.manager);
        if (newManager) {
            this.checkSenderAccountStatus(newManager);
        }
        // 链域名不存在不能设置管理员
        const memLocation = (await accountGetterHelper.getLocationName(sourceChainMagic, name, currentBlockHeight));
        if (!memLocation) {
            throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                locationName: name,
                ...Function_Exception_Detail,
            });
        }
        // 处于冻结状态的链域名不能设置管理员
        if (memLocation.status === core_model_1.ASSET_STATUS.FROZEN) {
            throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_MANAGER_FIELD, {
                locationName: name,
                reason: "Frozen location name can not set manager",
                ...Function_Exception_Detail,
            });
        }
        // 不能将原来的管理员设置为管理员
        if (lnsManager.manager === memLocation.manager) {
            throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_MANAGER_FIELD, {
                locationName: name,
                reason: "Can not set the same account as manager",
                errorId: core_model_1.NewTransactionRefuseReason.CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER,
                ...Function_Exception_Detail,
            });
        }
        const { senderId } = transaction;
        if (memLocation.level === core_model_1.LOCATION_NAME_LEVEL.MULTI_LEVEL) {
            const names = name.split(".");
            const index = names[0].length + 1;
            const lastLocationName = name.substr(index);
            const lastMemLocation = (await accountGetterHelper.getLocationName(sourceChainMagic, lastLocationName, currentBlockHeight));
            // 上级域名不存在
            if (!lastMemLocation) {
                throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_MANAGER_FIELD, {
                    locationName: lastLocationName,
                    reason: "Last location name is not exists",
                    ...Function_Exception_Detail,
                });
            }
            // 多级域名只有域名的拥有者或者上级域名的管理员可以设置管理员
            if (!(senderId === memLocation.possessorAddress || senderId === lastMemLocation.manager)) {
                throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_MANAGER_FIELD, {
                    locationName: lastLocationName,
                    reason: "Only the location name possessor or upper level location name manager can set manager of multi level location name",
                    ...Function_Exception_Detail,
                });
            }
        }
        else {
            // 顶级域名只有域名的拥有者可以设置管理员
            if (senderId !== memLocation.possessorAddress) {
                throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_MANAGER_FIELD, {
                    locationName: name,
                    reason: "Only the location name possessor can set manager of top level location name",
                    ...Function_Exception_Detail,
                });
            }
        }
        return true;
    }
};
SetLnsManagerLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], SetLnsManagerLogicVerifier);
exports.SetLnsManagerLogicVerifier = SetLnsManagerLogicVerifier;
//# sourceMappingURL=setLnsManagerLogicVerifier.js.map