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
const { ArgumentIllegalException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "LocationNameTransactionFactory");
/**
 * locationName 交易工厂
 *
 */
let LocationNameTransactionFactory = class LocationNameTransactionFactory extends _txbase_1.TransactionFactory {
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
     * 要验证 locationName 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "name" value 值必须是设定的值
     * asset 是完整的 locationName
     * 必须携带合法的链域名：是一个字符串；长度要大于 2，最大不超过 1024；不能以 . 开头或结尾；一级域名只能是小写字母组成；
     * 多级域名首字母只能是大小写字母，其他部分可以是数字；每级域名的长度最大为 128，根域名只能是本链链名
     * 必须携带合法的所属链名,并且是本链
     * 必须携带合法的所属链网络标识符,并且是本链
     * 必须携带合法的链域名操作类型
     *
     * @param body
     * @param locationName
     */
    verifyTransactionBody(body, locationNameAsset, config = this.configHelper) {
        super.verifyTransactionBody(body, locationNameAsset, config);
        const Function_Exception_Detail = {
            target: "body",
            function: "verifyTransactionBody",
        };
        this.emptyRangeType(body, Function_Exception_Detail);
        const { baseHelper } = this;
        if (body.recipientId) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_EXIST, {
                prop: "recipientId",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.fromMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "fromMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (body.toMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "toMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (!body.storage) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "storage",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        const storage = body.storage;
        if (storage.key !== "name") {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "key",
                to_target: "storage",
                be_compare_prop: "name",
                ...Function_Exception_Detail,
            });
        }
        const locationName = locationNameAsset.locationName;
        if (!locationName) {
            throw new ArgumentIllegalException(core_util_exception_1.PARAM_LOST, {
                param: "locationName",
                function: "verifyTransactionBody",
            });
        }
        const LocationName_Exception_Detail = {
            ...Function_Exception_Detail,
            target: "locationName",
        };
        const operateLnsName = locationName.name;
        if (!operateLnsName) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_REQUIRE, {
                prop: "name",
                ...LocationName_Exception_Detail,
            });
        }
        if (!baseHelper.isString(operateLnsName)) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "name",
                type: "string",
                ...LocationName_Exception_Detail,
            });
        }
        const lenNameLength = operateLnsName.length;
        if (lenNameLength > 1024) {
            throw new ArgumentIllegalException(core_util_exception_1.OVER_LENGTH, {
                prop: "name",
                limit: 1024,
                ...LocationName_Exception_Detail,
            });
        }
        // 不能以 . 开头或结尾
        if (baseHelper.isStartWithOrEndWithPoint(operateLnsName)) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_NOT_START_WITH_OR_END_WITH, {
                prop: "name",
                field: ".",
                ...LocationName_Exception_Detail,
            });
        }
        const names = operateLnsName.split(".");
        const namesLength = names.length;
        if (namesLength < 2) {
            throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                prop: "name",
                ...LocationName_Exception_Detail,
            });
        }
        for (let i = 0; i < namesLength; i++) {
            const lnsName = names[i];
            if (lnsName.length > 128) {
                throw new ArgumentIllegalException(core_util_exception_1.OVER_LENGTH, {
                    prop: "name",
                    limit: 128,
                    ...LocationName_Exception_Detail,
                });
            }
            if (i === namesLength - 2) {
                // 顶级域名必须是小写字母
                if (!baseHelper.isLowerCaseLetters(lnsName)) {
                    throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                        prop: "name",
                        type: "lowercase",
                        ...LocationName_Exception_Detail,
                    });
                }
            }
            else if (i === namesLength - 1) {
                // 根域名必须是本链链名
                if (lnsName !== config.chainName) {
                    throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                        to_compare_prop: "root location name",
                        to_target: "name",
                        be_compare_prop: config.chainName,
                        ...LocationName_Exception_Detail,
                    });
                }
            }
            else {
                if (!baseHelper.isLowerCaseOrNumberOrUnderline(lnsName)) {
                    throw new ArgumentIllegalException(core_util_exception_1.PROP_IS_INVALID, {
                        prop: "name",
                        type: "lowercase number or underline",
                        ...LocationName_Exception_Detail,
                    });
                }
            }
        }
        if (storage.value !== operateLnsName) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "value",
                be_compare_prop: "name",
                to_target: "storage",
                be_target: "locationName",
                ...Function_Exception_Detail,
            });
        }
        const { sourceChainName, sourceChainMagic, operationType } = locationName;
        this.checkChainName(sourceChainName, "sourceChainName", LocationName_Exception_Detail);
        if (sourceChainName !== config.chainName) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainName",
                to_target: "body",
                be_compare_prop: "local chain name",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        this.checkChainMagic(sourceChainMagic, "sourceChainMagic", LocationName_Exception_Detail);
        if (sourceChainMagic !== config.magic) {
            throw new ArgumentIllegalException(core_util_exception_1.SHOULD_BE, {
                to_compare_prop: "sourceChainMagic",
                to_target: "body",
                be_compare_prop: "local chain magic",
                target: "body",
                ...Function_Exception_Detail,
            });
        }
        if (!core_model_1.LOCATION_NAME_OPERATION_TYPE[operationType]) {
            throw new ArgumentIllegalException(core_util_exception_1.NOT_MATCH, {
                to_compare_prop: "operationType",
                be_compare_prop: "locationNameType",
                to_target: "locationName",
                be_target: "LOCATION_NAME_OPERATION_TYPE",
                ...LocationName_Exception_Detail,
            });
        }
    }
    /**
     * 初始化 locationName 交易
     *
     * @param body
     * @param locationName
     */
    init(body, locationName) {
        const transaction = core_model_1.LocationNameTransaction.fromObject({
            ...body,
            asset: locationName,
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
        const { senderId } = transaction;
        const { name, sourceChainMagic, sourceChainName, operationType, } = transaction.asset.locationName;
        // 发行链域名
        if (operationType === core_model_1.LOCATION_NAME_OPERATION_TYPE.REGISTRATION) {
            tasks.next = eventEmitter.emit("registerLocationName", {
                type: "registerLocationName",
                transaction,
                applyInfo: {
                    address: senderId,
                    name,
                    sourceChainMagic,
                    sourceChainName,
                },
            });
        }
        else {
            tasks.next = eventEmitter.emit("cancelLocationName", {
                type: "cancelLocationName",
                transaction,
                applyInfo: {
                    address: senderId,
                    name,
                    sourceChainMagic,
                },
            });
        }
        return tasks.tryToPromise();
    }
};
LocationNameTransactionFactory = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BaseHelper,
        core_helper_1.ConfigHelper,
        core_helper_1.ChainAssetInfoHelper])
], LocationNameTransactionFactory);
exports.LocationNameTransactionFactory = LocationNameTransactionFactory;
//# sourceMappingURL=locationName.js.map