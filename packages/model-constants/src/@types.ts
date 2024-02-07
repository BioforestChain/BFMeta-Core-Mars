declare namespace BFChainCore {
  type BNID_TYPE = import("./").BNID_TYPE;
  type NETWORK_TYPE = import("./").NETWORK_TYPE;
  type DAPP_TYPE = import("./").DAPP_TYPE;
  type LOCATION_NAME_OPERATION_TYPE = import("./").LOCATION_NAME_OPERATION_TYPE;
  type RECORD_TYPE = import("./").RECORD_TYPE;
  type RECORD_OPERATION_TYPE = import("./").RECORD_OPERATION_TYPE;
  type GIFT_DISTRIBUTION_RULE = import("./").GIFT_DISTRIBUTION_RULE;
  type RANGE_TYPE = import("./").RANGE_TYPE;
  type PARITY_BIT_MAPPING = keyof typeof import("./").PARITY_BIT_MAPPING;
  type FORK_CAUSE = import("./").BLOCK_FORK_CAUSE;
  type PARENT_ASSET_TYPE = import("./").PARENT_ASSET_TYPE;
  type ASSET_STATUS = import("./").ASSET_STATUS;
  type CERTIFICATE_TYPE = import("./").CERTIFICATE_TYPE;
  type FROZEN_REASON = import("./").FROZEN_REASON;
}
