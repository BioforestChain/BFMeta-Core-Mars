declare namespace BFChainCore {
  type EXCHANGE_DIRECTION = import("./").EXCHANGE_DIRECTION;
  type SPECIAL_ASSET_TYPE = import("./").SPECIAL_ASSET_TYPE;
  type DAPP_TYPE = import("./").DAPP_TYPE;
  type LOCATION_NAME_OPERATION_TYPE = import("./").LOCATION_NAME_OPERATION_TYPE;
  type RECORD_TYPE = import("./").RECORD_TYPE;
  type RECORD_OPERATION_TYPE = import("./").RECORD_OPERATION_TYPE;
  type GIFT_DISTRIBUTION_RULE = import("./").GIFT_DISTRIBUTION_RULE;
  type RANGE_TYPE = import("./").RANGE_TYPE;
  type PARITY_BIT_MAPPING = keyof typeof import("./").PARITY_BIT_MAPPING;
  type TPOW_PARAMETER = import("./").TPOW_PARAMETER;
  type TPOW_OPERATOR = import("./").TPOW_OPERATOR;
  type TPOW_AUXILIARY_SYMBOL = import("./").TPOW_AUXILIARY_SYMBOL;
  type FORK_CAUSE = import("./").BLOCK_FORK_CAUSE;
}
