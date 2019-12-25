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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "SetLnsRecordValueLogicVerifier");
let SetLnsRecordValueLogicVerifier = class SetLnsRecordValueLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
    constructor() {
        super();
    }
    addRecord(locationName, addRecord, records) {
        const { recordType, recordValue } = addRecord;
        if (records && records[recordType] && records[recordType][recordValue]) {
            throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                locationName,
                reason: "New location name record value already exist",
                function: "addRecord",
            });
        }
    }
    deleteRecord(locationName, deleteRecord, records) {
        const { recordType, recordValue } = deleteRecord;
        if (!(records[recordType] && records[recordType][recordValue])) {
            throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                locationName,
                reason: "Delete location name record value not exist",
                function: "deleteRecord",
            });
        }
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
        const lnsRecordValue = transaction.asset.lnsRecordValue;
        const sourceChainMagic = lnsRecordValue.sourceChainMagic;
        const { name, operationType, addRecord, deleteRecord } = lnsRecordValue;
        // 校验当前域名是否存存在
        const memLocation = (await accountGetterHelper.getLocationName(sourceChainMagic, name.toLowerCase(), currentBlockHeight));
        if (!memLocation) {
            throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                locationName: name,
                errorId: core_model_1.NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
                ...Function_Exception_Detail,
            });
        }
        const { records, status } = memLocation;
        // 处于冻结状态的链域名不能设置解析值
        if (status === core_model_1.ASSET_STATUS.FROZEN) {
            throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                locationName: name,
                reason: "Frozen location name can not set record value",
                ...Function_Exception_Detail,
            });
        }
        // 只有域名的拥有者或者管理员可以设置域名的解析值
        const address = transaction.senderId;
        if (!(address === memLocation.possessorAddress || address === memLocation.manager)) {
            throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                locationName: name,
                reason: "Only the location name possessor or manager can set record value",
                ...Function_Exception_Detail,
            });
        }
        if (operationType === core_model_1.RECORD_OPERATION_TYPE.ADD) {
            if (!addRecord) {
                throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                    locationName: name,
                    reason: "New location name record value lose",
                    ...Function_Exception_Detail,
                });
            }
            this.addRecord(name, addRecord, records);
        }
        else if (operationType === core_model_1.RECORD_OPERATION_TYPE.DELETE) {
            if (!deleteRecord) {
                throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                    locationName: name,
                    reason: "Delete location name record value lose",
                    ...Function_Exception_Detail,
                });
            }
            this.deleteRecord(name, deleteRecord, records);
        }
        else if (operationType === core_model_1.RECORD_OPERATION_TYPE.UPDATE) {
            if (!(addRecord && deleteRecord)) {
                throw new ConsensusException(core_util_exception_1.SET_LOCATION_NAME_RECORD_VALUE_FIELD, {
                    locationName: name,
                    reason: "New location name record value and delete location name record value lose",
                    ...Function_Exception_Detail,
                });
            }
            this.deleteRecord(name, deleteRecord, records);
            this.addRecord(name, addRecord, records);
        }
        return true;
    }
};
SetLnsRecordValueLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], SetLnsRecordValueLogicVerifier);
exports.SetLnsRecordValueLogicVerifier = SetLnsRecordValueLogicVerifier;
//# sourceMappingURL=setLnsRecordValueLogicVerifier.js.map