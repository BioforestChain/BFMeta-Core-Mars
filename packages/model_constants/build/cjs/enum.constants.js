"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// #region locationName
/**
 * 未知名称等级
 *
 */
var LOCATION_NAME_LEVEL;
(function (LOCATION_NAME_LEVEL) {
    /**顶级(1 级) */
    LOCATION_NAME_LEVEL["TOP_LEVEL"] = "TOP_LEVEL";
    /**多级(2、3、4..... 级) */
    LOCATION_NAME_LEVEL["MULTI_LEVEL"] = "MULTI_LEVEL";
})(LOCATION_NAME_LEVEL = exports.LOCATION_NAME_LEVEL || (exports.LOCATION_NAME_LEVEL = {}));
var LOCATION_NAME_OPERATION_TYPE;
(function (LOCATION_NAME_OPERATION_TYPE) {
    /**注册 lns */
    LOCATION_NAME_OPERATION_TYPE[LOCATION_NAME_OPERATION_TYPE["REGISTRATION"] = 0] = "REGISTRATION";
    /**注销 */
    LOCATION_NAME_OPERATION_TYPE[LOCATION_NAME_OPERATION_TYPE["CANCELLATION"] = 1] = "CANCELLATION";
})(LOCATION_NAME_OPERATION_TYPE = exports.LOCATION_NAME_OPERATION_TYPE || (exports.LOCATION_NAME_OPERATION_TYPE = {}));
/**
 * lns 解析类型
 *
 */
var RECORD_TYPE;
(function (RECORD_TYPE) {
    /**IPV4解析 */
    RECORD_TYPE["IPV4"] = "A";
    /**IPV6解析 */
    RECORD_TYPE["IPV6"] = "AAAA";
    /**经纬度解析 */
    RECORD_TYPE["LNG_LAT"] = "LNG_LAT";
    /**账户地址解析 */
    RECORD_TYPE["ADDRESSV1"] = "BLOCK_CHAIN_ACCOUNT_ADDRESS";
})(RECORD_TYPE = exports.RECORD_TYPE || (exports.RECORD_TYPE = {}));
/**
 * lns 解析值操作类型
 *
 */
var RECORD_OPERATION_TYPE;
(function (RECORD_OPERATION_TYPE) {
    /**添加解析值 */
    RECORD_OPERATION_TYPE[RECORD_OPERATION_TYPE["ADD"] = 0] = "ADD";
    /**删除解析值 */
    RECORD_OPERATION_TYPE[RECORD_OPERATION_TYPE["DELETE"] = 1] = "DELETE";
    /**更新解析值 */
    RECORD_OPERATION_TYPE[RECORD_OPERATION_TYPE["UPDATE"] = 2] = "UPDATE";
})(RECORD_OPERATION_TYPE = exports.RECORD_OPERATION_TYPE || (exports.RECORD_OPERATION_TYPE = {}));
// #endregion
// #region account
/**账户状态 */
var ACCOUNT_STATUS;
(function (ACCOUNT_STATUS) {
    /**
     * NORMAL: 正常账户
     */
    ACCOUNT_STATUS[ACCOUNT_STATUS["NORMAL"] = 0] = "NORMAL";
    /**
     * FROZEN: 冻结转入
     */
    ACCOUNT_STATUS[ACCOUNT_STATUS["FROZEN_IN"] = 1] = "FROZEN_IN";
    /**
     * FROZEN: 冻结转出
     */
    ACCOUNT_STATUS[ACCOUNT_STATUS["FROZEN_OUT"] = 16] = "FROZEN_OUT";
    /**
     * FROZEN: 冻结转入和转出
     */
    ACCOUNT_STATUS[ACCOUNT_STATUS["FROZEN_IN_AND_OUT"] = 17] = "FROZEN_IN_AND_OUT";
})(ACCOUNT_STATUS = exports.ACCOUNT_STATUS || (exports.ACCOUNT_STATUS = {}));
// #endregion
// #region asset
/**资产状态 */
var ASSET_STATUS;
(function (ASSET_STATUS) {
    /**
     * NORMAL: 正常资产
     */
    ASSET_STATUS[ASSET_STATUS["NORMAL"] = 0] = "NORMAL";
    /**
     * FROZEN: 冻结资产
     */
    ASSET_STATUS[ASSET_STATUS["FROZEN"] = 17] = "FROZEN";
})(ASSET_STATUS = exports.ASSET_STATUS || (exports.ASSET_STATUS = {}));
// #endregion
// #region DApp
/**
 * DApp 类型
 *
 */
var DAPP_TYPE;
(function (DAPP_TYPE) {
    /**付费应用 */
    DAPP_TYPE[DAPP_TYPE["PAID_APP"] = 0] = "PAID_APP";
    /**免费应用 */
    DAPP_TYPE[DAPP_TYPE["FREE_APP"] = 1] = "FREE_APP";
})(DAPP_TYPE = exports.DAPP_TYPE || (exports.DAPP_TYPE = {}));
// #endregion
// #region gift
/**礼物的分配规则 */
var GIFT_DISTRIBUTION_RULE;
(function (GIFT_DISTRIBUTION_RULE) {
    /**平均分配 */
    GIFT_DISTRIBUTION_RULE[GIFT_DISTRIBUTION_RULE["AVERAGE"] = 0] = "AVERAGE";
    /**根据任意账户的地址的随机分配法 */
    GIFT_DISTRIBUTION_RULE[GIFT_DISTRIBUTION_RULE["RANDOM"] = 1] = "RANDOM";
    /**根据接收者列表中账户地址的随机分配法
     * 这种规则会确保赠送的资产尽可能的被分配完，并且确保每一个接收账户都有能得到的金额
     */
    GIFT_DISTRIBUTION_RULE[GIFT_DISTRIBUTION_RULE["RECIPIENT_RANDOM"] = 2] = "RECIPIENT_RANDOM";
})(GIFT_DISTRIBUTION_RULE = exports.GIFT_DISTRIBUTION_RULE || (exports.GIFT_DISTRIBUTION_RULE = {}));
// #endregion
// #region exchange asset
var EXCHANGE_DIRECTION;
(function (EXCHANGE_DIRECTION) {
    /**特殊资产来自 to 交易的发起账户，即出售 */
    EXCHANGE_DIRECTION[EXCHANGE_DIRECTION["ASSET_FROM_SENDER"] = 0] = "ASSET_FROM_SENDER";
    /**特殊资产来自 be 交易的发起账户，即求购 */
    EXCHANGE_DIRECTION[EXCHANGE_DIRECTION["ASSET_FROM_RECIPIENT"] = 1] = "ASSET_FROM_RECIPIENT";
})(EXCHANGE_DIRECTION = exports.EXCHANGE_DIRECTION || (exports.EXCHANGE_DIRECTION = {}));
var SPECIAL_ASSET_TYPE;
(function (SPECIAL_ASSET_TYPE) {
    /**特殊资产类型：dapp */
    SPECIAL_ASSET_TYPE[SPECIAL_ASSET_TYPE["DAPP_ID"] = 0] = "DAPP_ID";
    /**特殊资产类型：链域名 */
    SPECIAL_ASSET_TYPE[SPECIAL_ASSET_TYPE["LOCATION_NAME"] = 1] = "LOCATION_NAME";
})(SPECIAL_ASSET_TYPE = exports.SPECIAL_ASSET_TYPE || (exports.SPECIAL_ASSET_TYPE = {}));
// #endregion
/**交易的接收范围 */
var RANGE_TYPE;
(function (RANGE_TYPE) {
    /**不限定范围 */
    RANGE_TYPE[RANGE_TYPE["EMPTY"] = 0] = "EMPTY";
    /**多地址 */
    RANGE_TYPE[RANGE_TYPE["MULTI_ADDRESS"] = 1] = "MULTI_ADDRESS";
    /**DAppid范围 */
    RANGE_TYPE[RANGE_TYPE["MULTI_DAPPID"] = 2] = "MULTI_DAPPID";
    /**链域名范围 */
    RANGE_TYPE[RANGE_TYPE["MULTI_LOCATION_NAME"] = 4] = "MULTI_LOCATION_NAME";
})(RANGE_TYPE = exports.RANGE_TYPE || (exports.RANGE_TYPE = {}));
//# sourceMappingURL=enum.constants.js.map