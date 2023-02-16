import { ErrorCode } from "@bfchain/util-exception-error-code";
/**
 *
 * ## core 错误码，大类 001
 *
 * ### 详细错误码
 *
 * - 00 通用校验错误
 * - 11 逻辑校验错误
 * - 22 channel
 * - 23 blob
 *
 */
export const ERROR_LIST = {
  // #region base
  PARAM_LOST: new ErrorCode("001-00001", "params {param} lost"),
  PROP_IS_REQUIRE: new ErrorCode("001-00002", "{prop} in {target} is required"),
  PROP_IS_INVALID: new ErrorCode("001-00003", "{prop} in {target} is invalid"),
  NOT_MATCH: new ErrorCode(
    "001-00004",
    "{to_compare_prop} in {to_target} and {be_compare_prop} in {be_target} not match",
  ),
  PROP_SHOULD_GT_FIELD: new ErrorCode(
    "001-00005",
    "{prop} in {target} should greater than {field}",
  ),
  PROP_SHOULD_GTE_FIELD: new ErrorCode(
    "001-00006",
    "{prop} in {target} should greater than or equals to {field}",
  ),
  PROP_SHOULD_LT_FIELD: new ErrorCode("001-00007", "{prop} in {target} should less than {field}"),
  PROP_SHOULD_LTE_FIELD: new ErrorCode(
    "001-00008",
    "{prop} in {target} should less than or equals to {field}",
  ),
  PROP_SHOULD_EQ_FIELD: new ErrorCode("001-00009", "{prop} in {target} should equals to {field}"),
  SHOULD_BE: new ErrorCode(
    "001-00010",
    "{to_compare_prop} in {to_target} should be {be_compare_prop}",
  ),
  SHOULD_NOT_BE: new ErrorCode(
    "001-00011",
    "{to_compare_prop} in {to_target} should not be {be_compare_prop}",
  ),
  NOT_EXIST: new ErrorCode("001-00012", "{prop} in {target} not exist"),
  SHOULD_NOT_EXIST: new ErrorCode("001-00013", "{prop} in {target} should not exist"),
  TRANSACTION_FEE_NOT_ENOUGH: new ErrorCode(
    "001-00014",
    "Transaction fee is not enough, errorId {errorId}, minFee {minFee}",
  ),
  NOT_IN_EXPECTED_RANGE: new ErrorCode("001-00015", "{prop} in {target} not in [{min}, {max}]"),
  OVER_LENGTH: new ErrorCode("001-00016", "{prop} in {target} is over length {limit}"),
  SHOULD_NOT_START_WITH_OR_END_WITH: new ErrorCode(
    "001-00017",
    "{prop} in {target} should not start with or end with {field}",
  ),
  NOT_A_STRING: new ErrorCode("001-00018", "{prop} in {target} not a string, value {value}"),
  NOT_A_IP: new ErrorCode("001-00019", "{prop} in {target} not a ip, value {value}"),
  NOT_A_IPV4: new ErrorCode("001-00020", "{prop} in {target} not a ipv4, value {value}"),
  NOT_A_IPV6: new ErrorCode("001-00021", "{prop} in {target} not a ipv6, value {value}"),
  NOT_A_LONGITUDE_LATITUDE: new ErrorCode(
    "001-00022",
    "{prop} in {target} not a longitude-latitude, value {value}",
  ),
  NOT_A_LONGITUDE: new ErrorCode("001-00023", "{prop} in {target} not a longitude, value {value}"),
  NOT_A_LATITUDE: new ErrorCode("001-00024", "{prop} in {target} not a latitude, value {value}"),
  NOT_A_ADDRESS: new ErrorCode("001-00025", "{prop} in {target} not a address, value {value}"),
  NOT_A_LOCATION_NAME: new ErrorCode(
    "001-00026",
    "{prop} in {target} not a locationName, value {value}",
  ),
  NOT_A_DNS: new ErrorCode("001-00027", "{prop} in {target} not a dns, value {value}"),
  NOT_A_EMAIL: new ErrorCode("001-00028", "{prop} in {target} not a email, value {value}"),
  NOT_A_URL: new ErrorCode("001-00029", "{prop} in {target} not a url, value {value}"),
  PERMISSION_DENIED: new ErrorCode("001-00030", "Permission denied at operation {operationName}"),
  SHOULD_NOT_INCLUDE: new ErrorCode("001-00031", "{prop} in {target} should not inclue {value}"),
  SHOULD_INCLUDE: new ErrorCode("001-00032", "{prop} in {target} should inclue {value}"),
  SHOULD_NOT_DUPLICATE: new ErrorCode("001-00033", "{prop} in {target} should not duplicate"),
  ALREADY_EXIST: new ErrorCode("001-00034", "{prop} in {target} already exist, errorId {errorId}"),
  GENESIS_DELEGATE_NOT_ENOUGH: new ErrorCode(
    "001-00035",
    "Genesis delegate not enough, at least {expected}, actual {actual}",
  ),
  PROP_SHOULD_BE_ARRAY: new ErrorCode("001-00036", "{prop} in {target} should be an array"),
  INVALID_BLOCK_GENERATOR: new ErrorCode("001-00037", "Invalid block generator, reason {reason}"),
  TRAN_POW_VERIFY_FAIL: new ErrorCode("001-00038", "Transaction's porf of work verify fail"),
  NOT_FOUND: new ErrorCode("001-00039", "{prop} not found"),
  TOO_LARGE: new ErrorCode("001-00040", "{prop} is too large, reason {reason}, errorId {errorId}"),
  PROP_LENGTH_SHOULD_LT_FIELD: new ErrorCode(
    "001-00041",
    "{prop} length in {target} should less than {field}",
  ),
  PROP_LENGTH_SHOULD_LTE_FIELD: new ErrorCode(
    "001-00042",
    "{prop} length in {target} should less than or equals to {field}",
  ),
  PROP_LENGTH_SHOULD_GT_FIELD: new ErrorCode(
    "001-00043",
    "{prop} length in {target} should greater than {field}",
  ),
  PROP_LENGTH_SHOULD_GTE_FIELD: new ErrorCode(
    "001-00044",
    "{prop} length in {target} should greater than or equals to {field}",
  ),
  PROP_LENGTH_SHOULD_EQ_FIELD: new ErrorCode(
    "001-00045",
    "{prop} length in {target} should equals to {field}",
  ),
  PROP_LENGTH_SHOULD_NOT_EQ_FIELD: new ErrorCode(
    "001-00046",
    "{prop} length in {target} should not equals to {field}",
  ),
  INVALID_TRANSACTION_BASE_TYPE: new ErrorCode(
    "001-00047",
    "Invalid transaction base type: {base_type}",
  ),
  INVALID_BLOCK_CONSTRUCTOR: new ErrorCode("001-00048", "Invalid block constructor: {name}"),
  INVALID_BLOCK_TYPE: new ErrorCode("001-00049", "Invalid block type: {type}"),
  CUSTOM_TRANS_VERIFY_FAIL: new ErrorCode("001-00050", "Custom transaction verify fail: {message}"),
  DISABLED_CREATE_TRANSACTION: new ErrorCode("001-00051", "Disabled create {trsName} Transaction"),
  DISABLED_INSERT_TRANSACTION: new ErrorCode("001-00052", "Disabled insert {trsName} Transaction"),
  TRANSACTION_IS_IN_UNCHANGABLE_STATE: new ErrorCode(
    "001-00053",
    "Transaction is in unchangable state",
  ),
  ASSETSTATISTIC_INDEX_ALREADY_IN_USE: new ErrorCode(
    "001-00054",
    "AssetStatistic index: {index} already in use",
  ),
  INVALID_SIGNATURE: new ErrorCode("001-00055", "Invalid {taskLabel} signature"),
  INVALID_SIGNSIGNATURE: new ErrorCode("001-00056", "Invalid {taskLabel} signSignature"),
  INVALID_BASE_TYPE: new ErrorCode("001-00057", "Invalid base type {base_type}"),

  UNREGISTERED_TRANSACTION_FACTORY: new ErrorCode(
    "001-00058",
    "Unregistered TransactionFactory {factoryName}",
  ),
  UNREGISTERED_TRANSACTION_BASE_TYPE: new ErrorCode(
    "001-00059",
    "Unregistered Transaction base type {trs_base}",
  ),
  UNREGISTERED_TRANSACTION_TYPE: new ErrorCode(
    "001-00060",
    "Unregistered Transaction type {trs_key}",
  ),
  INVALID_FROMAUTHSIGNATURE: new ErrorCode("001-00061", "Invalid {taskLabel} fromAuthSignature"),
  INVALID_FROMAUTHSIGNSIGNATURE: new ErrorCode(
    "001-00062",
    "Invalid {taskLabel} fromAuthSignSignature",
  ),
  INVALID_TOAUTHSIGNATURE: new ErrorCode("001-00063", "Invalid {taskLabel} toAuthSignature"),
  INVALID_TOAUTHSIGNSIGNATURE: new ErrorCode(
    "001-00064",
    "Invalid {taskLabel} toAuthSignSignature",
  ),
  // #endregion

  // #region logic
  PROP_LOSE: new ErrorCode("001-11001", "{prop} in {target} lose"),
  ACCOUNT_FROZEN: new ErrorCode(
    "001-11002",
    "Account with address {address} was frozen, status {status}, errorId {errorId}",
  ),
  TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED: new ErrorCode(
    "001-11003",
    "Transaction signSignature is required, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  TRANSACTION_SENDER_SECOND_PUBLICKEY_ALREADY_CHANGE: new ErrorCode(
    "001-11004",
    "Transaction sender second secret have already change, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  TRANSACTION_SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY: new ErrorCode(
    "001-11005",
    "Transaction should not have senderSecondPublicKey, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE: new ErrorCode(
    "001-11006",
    "Transaction should not have signSignature, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT: new ErrorCode(
    "001-11007",
    "Invalid transaction apply block height, reason {reason}",
  ),
  INVALID_TRANSACTION_EFFECTIVE_BLOCK_HEIGHT: new ErrorCode(
    "001-11008",
    "Invalid transaction effective block height, reason {reason}",
  ),
  INVALID_TRANSACTION_FROM_MAGIC: new ErrorCode(
    "001-11009",
    "Invalid transaction from magic, reason {reason} signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  INVALID_TRANSACTION_TO_MAGIC: new ErrorCode(
    "001-11010",
    "Invalid transaction to magic, reason {reason} signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  INVALID_TRANSACTION_TIMESTAMP: new ErrorCode(
    "001-11011",
    "Invalid transaction timestamp, reason {reason} signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type}",
  ),
  DAPPID_IS_NOT_EXIST: new ErrorCode("001-11012", "DAppid is not exist, dappid {dappid}"),
  DAPPID_IS_ALREADY_EXIST: new ErrorCode(
    "001-11013",
    "DAppid is already exist, dappid {dappid}, errorId {errorId}",
  ),
  LOCATION_NAME_IS_NOT_EXIST: new ErrorCode(
    "001-11014",
    "LocationName is not exist, locationName {locationName}, errorId {errorId}",
  ),
  LOCATION_NAME_IS_ALREADY_EXIST: new ErrorCode(
    "001-11015",
    "LocationName is already exist, locationName {locationName}, errorId {errorId}",
  ),
  ENTITY_FACTORY_IS_NOT_EXIST: new ErrorCode(
    "001-11016",
    "Entity factory is not exist, factoryId {factoryId}",
  ),
  ENTITY_FACTORY_IS_ALREADY_EXIST: new ErrorCode(
    "001-11017",
    "Entity factory is already exist, factoryId {factoryId}, errorId {errorId}",
  ),
  ENTITY_IS_NOT_EXIST: new ErrorCode("001-11018", "Entity is not exist, entityId {entityId}"),
  ENTITY_IS_ALREADY_EXIST: new ErrorCode(
    "001-11019",
    "Entity is already exist, entityId {entityId}, errorId {errorId}",
  ),
  UNKNOWN_RANGE_TYPE: new ErrorCode("001-11020", "Unknow rangeType, rangeType {rangeType}"),
  INVALID_TRANSACTION_BYTE_LENGTH: new ErrorCode(
    "001-11021",
    "Invalid transaction byte length, reason {reason}",
  ),
  NEED_PURCHASE_DAPPID_BEFORE_USE: new ErrorCode(
    "001-11022",
    "Need purchase dappid before use, dappid {dappid}",
  ),
  NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE: new ErrorCode(
    "001-11023",
    "Need vote for dappid possessor before use, dappid {dappid}, errorId {errorId}",
  ),
  VERIFY_TRANSACTION_POW_OF_WORK_ERROR: new ErrorCode(
    "001-11024",
    "Verify transaction pow of work error, errorId {errorId}, reason {reason}",
  ),
  CAN_NOT_DELETE_LOCATION_NAME: new ErrorCode(
    "001-11025",
    "Can not delete locationName {locationName}, reason {reason}",
  ),
  SET_LOCATION_NAME_MANAGER_FIELD: new ErrorCode(
    "001-11026",
    "Set locationName {locationName} manager field, reason {reason}, errorId {errorId}",
  ),
  SET_LOCATION_NAME_RECORD_VALUE_FIELD: new ErrorCode(
    "001-11027",
    "Set locationName {locationName} recordValue field, reason {reason}, errorId {errorId}",
  ),
  ASSET_NOT_ENOUGH: new ErrorCode(
    "001-11028",
    "Asset not enough, reason {reason}, errorId {errorId}",
  ),
  ACCOUNT_REMAIN_EQUITY_NOT_ENOUGH: new ErrorCode(
    "001-11029",
    "Account remain equity not enough, reason {reason}, errorId {errorId}",
  ),
  NOT_BEGIN_UNFROZEN_YET: new ErrorCode(
    "001-11030",
    "Frozen asset is not begin to unfrozen yet, frozenId {frozenId}",
  ),
  FROZEN_ASSET_EXPIRATION: new ErrorCode(
    "001-11031",
    "Frozen asset is already expiration, frozenId {frozenId}",
  ),
  UNFROZEN_TIME_USE_UP: new ErrorCode(
    "001-11032",
    "Gift asset unfrozen time use up, frozenId {frozenId}",
  ),
  USERNAME_ALREADY_EXIST: new ErrorCode("001-11033", "Username already exist, errorId {errorId}"),
  ACCOUNT_IS_ALREADY_AN_DELEGATE: new ErrorCode(
    "001-11034",
    "Account with address {address} is already an delegate, errorId {errorId}",
  ),
  ACCOUNT_IS_NOT_AN_DELEGATE: new ErrorCode(
    "001-11035",
    "Account with address {address} is not an delegate, errorId {errorId}",
  ),
  DELEGATE_IS_ALREADY_ACCEPT_VOTE: new ErrorCode(
    "001-11036",
    "Delegate with address {address} is already accept vote",
  ),
  DELEGATE_IS_ALREADY_REJECT_VOTE: new ErrorCode(
    "001-11037",
    "Delegate with address {address} is already reject vote, errorId {errorId}",
  ),
  FORBIDDEN: new ErrorCode("001-11038", "{prop} in {target} is forbidden"),
  ASSET_NOT_EXIST: new ErrorCode(
    "001-11039",
    "Asset not exist, magic {magic} assetType {assetType}",
  ),
  ACCOUNT_NOT_DAPPID_POSSESSOR: new ErrorCode(
    "001-11040",
    "Account with address {address} not dappid {dappid} possessor, errorId {errorId}",
  ),
  ACCOUNT_NOT_LOCATION_NAME_POSSESSOR: new ErrorCode(
    "001-11041",
    "Account with address {address} not locationName {locationName} possessor, errorId {errorId}",
  ),
  ACCOUNT_NOT_ENTITY_POSSESSOR: new ErrorCode(
    "001-11042",
    "Account with address {address} not entityId {entityId} possessor, errorId {errorId}",
  ),
  DAPPID_NOT_FROZEN: new ErrorCode("001-11043", "DAppid not frozen, dappid {dappid}"),
  DAPPID_ALREADY_FROZEN: new ErrorCode("001-11044", "DAppid already frozen, dappid {dappid}"),
  LOCATION_NAME_NOT_FROZEN: new ErrorCode(
    "001-11045",
    "LocationName not frozen, locationName {locationName}",
  ),
  LOCATION_NAME_ALREADY_FROZEN: new ErrorCode(
    "001-11046",
    "LocationName already frozen, locationName {locationName}",
  ),
  ENTITY_NOT_FROZEN: new ErrorCode("001-11047", "Entity not frozen, entityId {entityId}"),
  ENTITY_ALREADY_FROZEN: new ErrorCode("001-11048", "Entity already frozen, entityId {entityId}"),
  NO_NEED_TO_PURCHASE_SPECIAL_ASSET: new ErrorCode(
    "001-11049",
    "No need to purchase asset, type {type} asset {asset}",
  ),
  ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE: new ErrorCode(
    "001-11050",
    "Only top level location name can exchange",
  ),
  CAN_NOT_DESTORY_ENTITY: new ErrorCode(
    "001-11051",
    "Can not destory entityId {entityId}, reason {reason}",
  ),
  ENTITY_ALREADY_DESTORY: new ErrorCode("001-11052", "Entity already destory, entityId {entityId}"),
  ASSET_IS_ALREADY_MIGRATION: new ErrorCode(
    "001-11053",
    "Asset is already migration, migrateCertificateId {migrateCertificateId}",
  ),
  NOT_EXIST_OR_EXPIRED: new ErrorCode("001-11054", "{prop} in {target} not exist or expired"),
  NOT_EXPECTED_RELATED_TRANSACTION: new ErrorCode(
    "001-11055",
    "Transaction with signature {signature} is not an expected related transaction",
  ),
  CAN_NOT_SECONDARY_TRANSACTION: new ErrorCode(
    "001-11056",
    "Can not secondary transaction, reason {reason}",
  ),
  REGISTER_DELEGTE_QUOTA_FULL: new ErrorCode(
    "001-11057",
    "The register delegate quota is full in round {round}",
  ),
  DELEGATE_CAN_NOT_MIGRATE_ASSET: new ErrorCode("001-11058", "Delegate can not migrate asset"),
  MIGRATE_MAIN_ASSET_ONLY: new ErrorCode(
    "001-11059",
    "You can only migrate main asset, {assetType} is not main asset {mainAsset}",
  ),
  CAN_NOT_CARRY_SECOND_PUBLICKEY: new ErrorCode("001-11060", "Can not carry second publicKey"),
  CAN_NOT_CARRY_SECOND_SIGNATURE: new ErrorCode("001-11061", "Can not carry second signature"),
  VOTE_RECENTLY: new ErrorCode("001-11062", "Account participate vote recently"),
  POSSESS_FROZEN_ASSET: new ErrorCode("001-11063", "Account possess frozen asset"),
  NEED_EMIGRATE_TOTAL_ASSET: new ErrorCode(
    "001-11064",
    "Need emigrate total asset, address {address}",
  ),
  POSSESS_ASSET_EXCEPT_CHAIN_ASSET: new ErrorCode(
    "001-11065",
    "Account possess asset expect chain asset",
  ),
  POSSESS_FROZEN_ASSET_EXCEPT_CHAIN_ASSET: new ErrorCode(
    "001-11066",
    "Account possess frozen asset expect chain asset",
  ),
  ACCOUNT_CAN_NOT_BE_FROZEN: new ErrorCode(
    "001-11067",
    "Account with address {address} can not be frozen, reason {reason}, errorId {errorId}",
  ),
  TRUST_MAIN_ASSET_ONLY: new ErrorCode(
    "001-11068",
    "You can only trust main asset, {assetType} is not main asset {mainAsset}",
  ),
  ACCOUNT_ALREADY_HAVE_USERNAME: new ErrorCode(
    "001-11069",
    "Account already has a username, errorId {errorId}",
  ),
  ISSUE_ENTITY_TIMES_USE_UP: new ErrorCode(
    "001-11070",
    "Issue entity times use up, entityFactory {entityFactory}",
  ),
  ASSET_ALREADY_EXIST: new ErrorCode(
    "001-11071",
    "Asset already exist, magic {magic} assetType {assetType}",
  ),
  FROZEN_ASSET_NOT_EXIST_OR_EXPIRED: new ErrorCode(
    "001-11072",
    "Frozen asset with frozenAddress {frozenAddress} signature {signature} assetType {assetType} in blockChain not exist or expired",
  ),
  NOT_ENOUGH_ISSUE_ENTITY_TIMES: new ErrorCode(
    "001-11073",
    "Not enough issue entity times, entityFactory {entityFactory}",
  ),

  // block logic
  BLOCK_SIGN_SIGNATURE_IS_REQUIRED: new ErrorCode(
    "001-12001",
    "Block signSignature is required, signature {signature} generatorAddress {generatorAddress} height {height}",
  ),
  BLOCK_GENERATOR_SECOND_PUBLICKEY_ALREADY_CHANGE: new ErrorCode(
    "001-12002",
    "Block generator second secret have already change, signature {signature} generatorAddress {generatorAddress} height {height}",
  ),
  BLOCK_SHOULD_NOT_HAVE_GENERATOR_SECOND_PUBLICKEY: new ErrorCode(
    "001-12003",
    "Block should not have generatorSecondPublicKey, signature {signature} generatorAddress {generatorAddress} height {height}",
  ),
  BLOCK_SHOULD_NOT_HAVE_SIGN_SIGNATURE: new ErrorCode(
    "001-12004",
    "Block should not have signSignature, signature {signature} generatorAddress {generatorAddress} height {height}",
  ),
  OUT_OF_RANGE: new ErrorCode("001-12005", "{variable} out of range"),
  FAILED_TO_FIND_NEAREST_SAME_BLOCK_IN_ONE_ROUND: new ErrorCode(
    "001-12006",
    "Failed to find nearest same block in one round, should not happen",
  ),
  GENESIS_BLOCK_NOT_MATCH: new ErrorCode(
    "001-12007",
    "GenesisBlock not match, the signature of genesisBlock and synchronized peer's genesisBlock's signature not equal",
  ),
  FAILED_TO_GET_BLOCKS_BY_RANGE: new ErrorCode(
    "000-12008",
    "Falied to get blocks by range({minHeight}~{maxHeight})",
  ),
  // #endregion

  // #region channel
  INVALID_PARAMS: new ErrorCode("001-22001", "Invalid params: {params}"),
  INVALID_PARAMS_FIELD: new ErrorCode("001-22002", "Invalid params field: {field}"),
  GENESIS_BLOCK_MAYBE_NO_EQUAL: new ErrorCode("001-22003", "GenesisBlock maybe no equal"),
  INVALID_QUERYBLOCKARG_QUERY_PARAMS: new ErrorCode(
    "001-22004",
    "Invalid QueryBlockArg query params, no query conditions",
  ),
  QUERY_BLOCK_FROM_PEER_TIMEOUT: new ErrorCode(
    "001-22005",
    "QueryBlock ({query}) from peer({peerId}) timeout",
  ),
  REQID_REUSE: new ErrorCode("001-22006", "ReqId reuse"),
  CHAINCHANNEL_CLOSED: new ErrorCode("001-22007", "chainChannel closed"),
  REFUSE_RESPONSE_QUERY_TRANSACTION: new ErrorCode(
    "001-22008",
    "Refuse response query transaction",
  ),
  REFUSE_RESPONSE_INDEX_TRANSACTION: new ErrorCode(
    "001-22009",
    "Refuse response index transaction",
  ),
  REFUSE_RESPONSE_DOWNLOAD_TRANSACTION: new ErrorCode(
    "001-22010",
    "Refuse response download transaction",
  ),
  REFUSE_RESPONSE_BROADCAST_TRANSACTION: new ErrorCode(
    "001-22011",
    "Refuse response broadcast transaction",
  ),
  REFUSE_RESPONSE_QUERY_BLOCK: new ErrorCode("001-22012", "Refuse response query block"),
  REFUSE_RESPONSE_BROADCAST_BLOCK: new ErrorCode("001-22013", "Refuse response broadcast block"),
  MESSAGE_TYPE_ERROR: new ErrorCode("001-22014", "Message type error"),
  ONMESSAGE_GET_INVALID_REQ_ID: new ErrorCode(
    "001-22015",
    "OnMessage get invalid req_id: {req_id}",
  ),
  REQUEST_LIMIT: new ErrorCode("001-22016", "Request limit"),
  INVALID_MESSAGE_CMD: new ErrorCode("001-22017", "Invalid message cmd"),
  CHAINCHANNEL_TIMEOUT: new ErrorCode("001-22018", "ChainChannel Timeout, cmd {cmd}"),
  TASK_ABORT: new ErrorCode(
    "001-22019",
    "Task {task_id} abort because the free chainChannel size is zero",
  ),

  REFUSE_RESPONSE_OPEN_BLOB: new ErrorCode("001-22020", "Refuse response open blob"),
  REFUSE_RESPONSE_READ_BLOB: new ErrorCode("001-22021", "Refuse response read blob"),
  REFUSE_RESPONSE_CLOSE_BLOB: new ErrorCode("001-22022", "Refuse response close blob"),
  // #endregion

  // #region blob
  OPEN_BLOB_NOFOUND: new ErrorCode("001-23001", "Not found blob by hash: {hash}"),
  OPEN_BLOB_INVALID_HASH: new ErrorCode("001-23002", "Could not open blob by hash: {hash}"),
  READ_BLOB_INVALID_DESCRIPTOR: new ErrorCode(
    "001-23003",
    "Could not read blob by descriptor: {descriptor}",
  ),
  CLOSE_BLOB_INVALID_DESCRIPTOR: new ErrorCode(
    "001-23004",
    "Could not close blob by descriptor: {descriptor}",
  ),
  REFUSE_REQUEST_BLOB_STORAGE: new ErrorCode(
    "001-23005",
    "Could not request storage for write blob with size: {size}",
  ),
  FAIL_TO_STORE_BLOB_CHUNK: new ErrorCode(
    "001-23006",
    "Could not save chunk for blob pointer {pointer} index {index}",
  ),
  FAIL_TO_GENERATE_BLOB: new ErrorCode("001-23007", "Fail to generate blob pointer: {pointer}"),
  FAIL_TO_CHANGE_BLOB_STRATEGY: new ErrorCode(
    "001-23008",
    "Fail to change blob({hash}) strategy({strategy})",
  ),
  FAIL_TO_DOWNLOAD_BLOB: new ErrorCode(
    "001-23009",
    "Fail to download blob({hash}) strategy({strategy})",
  ),
  // #endregion
};
// #endregion
export const errorCode = new Map();
