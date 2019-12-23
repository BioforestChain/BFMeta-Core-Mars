/**
 * 未知名称等级
 *
 */
export declare enum LOCATION_NAME_LEVEL {
    /**顶级(1 级) */
    TOP_LEVEL = "TOP_LEVEL",
    /**多级(2、3、4..... 级) */
    MULTI_LEVEL = "MULTI_LEVEL"
}
export declare enum LOCATION_NAME_OPERATION_TYPE {
    /**注册 lns */
    REGISTRATION = 0,
    /**注销 */
    CANCELLATION = 1
}
/**
 * lns 解析类型
 *
 */
export declare enum RECORD_TYPE {
    /**IPV4解析 */
    IPV4 = "A",
    /**IPV6解析 */
    IPV6 = "AAAA",
    /**经纬度解析 */
    LNG_LAT = "LNG_LAT",
    /**账户地址解析 */
    ADDRESSV1 = "BLOCK_CHAIN_ACCOUNT_ADDRESS"
}
/**
 * lns 解析值操作类型
 *
 */
export declare enum RECORD_OPERATION_TYPE {
    /**添加解析值 */
    ADD = 0,
    /**删除解析值 */
    DELETE = 1,
    /**更新解析值 */
    UPDATE = 2
}
/**账户状态 */
export declare enum ACCOUNT_STATUS {
    /**
     * NORMAL: 正常账户
     */
    NORMAL = 0,
    /**
     * FROZEN: 冻结转入
     */
    FROZEN_IN = 1,
    /**
     * FROZEN: 冻结转出
     */
    FROZEN_OUT = 16,
    /**
     * FROZEN: 冻结转入和转出
     */
    FROZEN_IN_AND_OUT = 17
}
/**资产状态 */
export declare enum ASSET_STATUS {
    /**
     * NORMAL: 正常资产
     */
    NORMAL = 0,
    /**
     * FROZEN: 冻结资产
     */
    FROZEN = 17
}
/**
 * DApp 类型
 *
 */
export declare enum DAPP_TYPE {
    /**付费应用 */
    PAID_APP = 0,
    /**免费应用 */
    FREE_APP = 1
}
/**礼物的分配规则 */
export declare enum GIFT_DISTRIBUTION_RULE {
    /**平均分配 */
    AVERAGE = 0,
    /**根据任意账户的地址的随机分配法 */
    RANDOM = 1,
    /**根据接收者列表中账户地址的随机分配法
     * 这种规则会确保赠送的资产尽可能的被分配完，并且确保每一个接收账户都有能得到的金额
     */
    RECIPIENT_RANDOM = 2
}
export declare enum EXCHANGE_DIRECTION {
    /**特殊资产来自 to 交易的发起账户，即出售 */
    ASSET_FROM_SENDER = 0,
    /**特殊资产来自 be 交易的发起账户，即求购 */
    ASSET_FROM_RECIPIENT = 1
}
export declare enum SPECIAL_ASSET_TYPE {
    /**特殊资产类型：dapp */
    DAPP_ID = 0,
    /**特殊资产类型：链域名 */
    LOCATION_NAME = 1
}
/**交易的接收范围 */
export declare enum RANGE_TYPE {
    /**不限定范围 */
    EMPTY = 0,
    /**多地址 */
    MULTI_ADDRESS = 1,
    /**DAppid范围 */
    MULTI_DAPPID = 2,
    /**链域名范围 */
    MULTI_LOCATION_NAME = 4
}
//# sourceMappingURL=transaction.constants.d.ts.map