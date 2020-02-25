export declare enum LOCATION_NAME_LEVEL {
    TOP_LEVEL = "TOP_LEVEL",
    MULTI_LEVEL = "MULTI_LEVEL"
}
export declare enum LOCATION_NAME_OPERATION_TYPE {
    REGISTRATION = 0,
    CANCELLATION = 1
}
export declare enum RECORD_TYPE {
    IPV4 = "A",
    IPV6 = "AAAA",
    LNG_LAT = "LNG_LAT",
    ADDRESSV1 = "BLOCK_CHAIN_ACCOUNT_ADDRESS"
}
export declare enum RECORD_OPERATION_TYPE {
    ADD = 0,
    DELETE = 1,
    UPDATE = 2
}
export declare enum ACCOUNT_STATUS {
    NORMAL = 0,
    FROZEN_IN = 1,
    FROZEN_OUT = 16,
    FROZEN_IN_AND_OUT = 17
}
export declare enum ASSET_STATUS {
    NORMAL = 0,
    FROZEN = 17
}
export declare enum DAPP_TYPE {
    PAID_APP = 0,
    FREE_APP = 1
}
export declare enum GIFT_DISTRIBUTION_RULE {
    AVERAGE = 0,
    RANDOM = 1,
    RECIPIENT_RANDOM = 2
}
export declare enum EXCHANGE_DIRECTION {
    ASSET_FROM_SENDER = 0,
    ASSET_FROM_RECIPIENT = 1
}
export declare enum SPECIAL_ASSET_TYPE {
    DAPP_ID = 0,
    LOCATION_NAME = 1
}
export declare enum RANGE_TYPE {
    EMPTY = 0,
    MULTI_ADDRESS = 1,
    MULTI_DAPPID = 2,
    MULTI_LOCATION_NAME = 4
}
