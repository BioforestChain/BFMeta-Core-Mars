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
const { ConsensusException, NoFoundException } = core_util_exception_1.CoreExceptionGenerator("VERIFIER", "LocationNameLogicVerifier");
let LocationNameLogicVerifier = class LocationNameLogicVerifier extends _txbaseLogicVerifier_1.TransactionLogicVerifier {
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
        const locationName = transaction.asset.locationName;
        const { sourceChainMagic, name, operationType } = locationName;
        const names = name.split(".");
        // 校验当前域名是否存存在
        const memLocation = (await accountGetterHelper.getLocationName(sourceChainMagic, name, currentBlockHeight));
        if (operationType === core_model_1.LOCATION_NAME_OPERATION_TYPE.REGISTRATION) {
            // 已存在的域名不能重复添加
            if (memLocation) {
                throw new ConsensusException(core_util_exception_1.ALREADY_EXIST, {
                    prop: name,
                    target: "blockChain",
                    errorId: core_model_1.NewTransactionRefuseReason.LOCATION_NAME_ALREADY_EXIST,
                    ...Function_Exception_Detail,
                });
            }
            // 链域名是否被禁用
            const result = await accountGetterHelper.isLocationNameForbidden(name);
            if (result) {
                throw new ConsensusException(core_util_exception_1.FORBIDDEN, {
                    prop: `Location name ${name}`,
                    target: "blockChain",
                    ...Function_Exception_Detail,
                });
            }
            if (names.length > 2) {
                // 不能越级添加域名，即上级域名不存在则添加失败
                const index = name.indexOf(".") + 1;
                const lastLocationName = name.substr(index);
                const lastMemLocation = await accountGetterHelper.getLocationName(locationName.sourceChainMagic, lastLocationName, currentBlockHeight);
                if (!lastMemLocation) {
                    throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                        locationName: lastLocationName,
                        ...Function_Exception_Detail,
                    });
                }
            }
        }
        else if (operationType === core_model_1.LOCATION_NAME_OPERATION_TYPE.CANCELLATION) {
            // 顶级域名不能删除
            if (names.length === 2) {
                throw new ConsensusException(core_util_exception_1.CAN_NOT_DELETE_LOCATION_NAME, {
                    locationName: name,
                    reason: "Top level location name can not be delete",
                    ...Function_Exception_Detail,
                });
            }
            // 不存在的域名不能删除
            if (!memLocation) {
                throw new ConsensusException(core_util_exception_1.LOCATION_NAME_IS_NOT_EXIST, {
                    locationName: name,
                    errorId: core_model_1.NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
                    ...Function_Exception_Detail,
                });
            }
            // 冻结状态的域名不能删除
            if (memLocation.status === core_model_1.ASSET_STATUS.FROZEN) {
                throw new ConsensusException(core_util_exception_1.CAN_NOT_DELETE_LOCATION_NAME, {
                    locationName: name,
                    reason: "Frozen location name can not be delete",
                    ...Function_Exception_Detail,
                });
            }
            // 只有域名的拥有者才能删除域名
            if (memLocation.possessorAddress !== transaction.senderId) {
                throw new ConsensusException(core_util_exception_1.CAN_NOT_DELETE_LOCATION_NAME, {
                    locationName: name,
                    reason: "Only location name possessor can delete location name",
                    ...Function_Exception_Detail,
                });
            }
            // 不能越级删除域名，即有子域名的域名不能删除
            const exist = await accountGetterHelper.getLocationName(locationName.sourceChainMagic, name, currentBlockHeight, {
                endsWith: name,
            });
            if (exist) {
                throw new ConsensusException(core_util_exception_1.CAN_NOT_DELETE_LOCATION_NAME, {
                    locationName: name,
                    reason: "Location name have child location name, please delete it at first",
                    ...Function_Exception_Detail,
                });
            }
        }
        return true;
    }
};
LocationNameLogicVerifier = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [])
], LocationNameLogicVerifier);
exports.LocationNameLogicVerifier = LocationNameLogicVerifier;
//# sourceMappingURL=locationNameLogicVerifier.js.map