const ec = {
  start: 10000,
  errorCode: [] as [string, string][],
  set next(v: string) {
    ec.errorCode.push([v, String(ec.start++)]);
  },
};
/**prop target function */
export const GENESIS_BLOCK_NO_EQUAL = (ec.next = "GenesisBlock maybe no equal");
/**prop target function */
export const PROP_IS_REQUIRE = (ec.next = "{prop} in {target} is required when {function}");
/**prop target function */
export const PROP_IS_INVALID = (ec.next = "{prop} in {target} is invalid when {function}");
/**function param */
export const PARAM_LOST = (ec.next = "{function} params {param} lost");
/**veriable  function */
export const OUT_OF_RANGE = (ec.next = "{variable} out of range in {function}");
/** to_compare_prop be_compare_prop to_target be_target */
export const NOT_MATCH = (ec.next =
  "{to_compare_prop} in {to_target} and {be_compare_prop} in {be_target} not match");
/**prop target field function*/
export const PROP_SHOULD_GT_FIELD = (ec.next =
  "{prop} in {target} should greater than {field} when {function}");
/**prop target field function*/
export const PROP_SHOULD_GTE_FIELD = (ec.next =
  "{prop} in {target} should greater than or equals to {field} when {function}");
/**prop target field function*/
export const PROP_SHOULD_LT_FIELD = (ec.next =
  "{prop} in {target} should less than {field} when {function}");
/**prop target field function*/
export const PROP_SHOULD_LTE_FIELD = (ec.next =
  "{prop} in {target} should less than or equals to {field} when {function}");
/**prop target field function*/
export const PROP_SHOULD_EQ_FIELD = (ec.next =
  "{prop} in {target} should equals to {field} when {function}");
/**prop target field function*/
export const PROP_LENGTH_SHOULD_LTE_FIELD = (ec.next =
  "{prop} length in {target} should less than or equals to {field} when {function}");
/**prop target field function*/
export const PROP_LENGTH_SHOULD_GTE_FIELD = (ec.next =
  "{prop} length in {target} should greater than or equals to {field} when {function}");
/**prop target field function*/
export const PROP_LENGTH_SHOULD_EQ_FIELD = (ec.next =
  "{prop} length in {target} should equals to {field} when {function}");
/**prop target field function*/
export const PROP_LENGTH_SHOULD_NOT_EQ_FIELD = (ec.next =
  "{prop} length in {target} should not equals to {field} when {function}");
/**variable function */
export const DUPLICATE = (ec.next = "{variable} duplicate in {function}");
/**prop target limit function */
export const OVER_LENGTH = (ec.next = "{prop} in {target} is over length {limit} when {function}");
/**prop target limit function */
export const TOO_SHORT = (ec.next = "{prop} in {target} is less than {limit} when {function}");
/**prop target min max function */
export const NOT_IN_EXPECTED_RANGE = (ec.next =
  "{prop} in {target} not in [{min}, {max}] when {function}");
/**to_compare_prop be_compare_prop to_target be_target function */
export const SHOULD_BE_DIFFERENT = (ec.next =
  "{to_compare_prop} in {to_target} and {be_compare_prop} in {be_target} should be differnet when {function}");
/**to_compare_prop to_target be_compare_prop function */
export const SHOULD_NOT_BE = (ec.next =
  "{to_compare_prop} in {to_target} should not be {be_compare_prop} when {function}");
/**to_compare_prop to_target be_compare_prop function */
export const SHOULD_BE = (ec.next =
  "{to_compare_prop} in {to_target} should be {be_compare_prop} when {function}");
/**prop target field function */
export const SHOULD_NOT_START_WITH_OR_END_WITH = (ec.next =
  "{prop} in {target} should not start with or end with {field} when {function}");
/**prop target function */
export const NOT_EXIST = (ec.next = "{prop} in {target} not exist when {function}");
/**prop target errorId function */
export const ALREADY_EXIST = (ec.next =
  "{prop} in {target} already exist errorId {errorId} when {function}");
/**prop target function */
export const SHOULD_NOT_EXIST = (ec.next = "{prop} in {target} should not exist when {function}");
/**prop target value function */
export const SHOULD_NOT_INCLUDE = (ec.next =
  "{prop} in {target} should not inclue {value} when {function}");
/**prop target function */
export const SHOULD_NOT_DUPLICATE = (ec.next =
  "{prop} in {target} should not duplicate when {function}");
export const INVALID_PARAMS = (ec.next = "Invalid {function} params");
export const INVALID_PARAMS_FIELD = (ec.next = "Invalid {function} params field: {field}");
export const INVALID_TRANSACTION_BASE_TYPE = (ec.next =
  "Invalid transaction base type: {base_type}");
export const INVALID_BLOCK_CONSTRUCTOR = (ec.next = "Invalid block constructor: {name}");
export const INVALID_BLOCK_TYPE = (ec.next = "Invalid block type: {type}");
export const TRAN_POW_VERIFY_FAIL = (ec.next =
  "transaction's porf of work verify fail when {function}");
export const CUSTOM_TRANS_VERIFY_FAIL = (ec.next = "custom transaction verify fail: {message}");
// #region logicVerify
/**prop function */
export const NOT_FOUND = (ec.next = "{prop} not found when {function}");
/**prop target function */
export const PROP_LOSE = (ec.next = "{prop} in {target} lose when {function}");
/**address errorId function */
export const ACCOUNT_FROZEN = (ec.next =
  "Account with address {address} was frozen errorId {errorId} when {function}");
/**address reason errorId function */
export const ACCOUNT_CAN_NOT_BE_FROZEN = (ec.next =
  "Account with address {address} can not be frozen, reason {reason} errorId {errorId} when {function}");
/**signature senderId applyBlockHeight type function */
export const TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED = (ec.next =
  "Transaction signSignature is required, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**signature generatorAddress height function */
export const BLOCK_SIGN_SIGNATURE_IS_REQUIRED = (ec.next =
  "Block signSignature is required, signature {signature} generatorAddress {generatorAddress} height {height} when {function}");
/**signature senderId applyBlockHeight type function */
export const TRANSACTION_SENDER_SECOND_PUBLICKEY_IS_REQUIRED = (ec.next =
  "Transaction senderSecondPublicKey is required, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**signature generatorAddress height function */
export const BLOCK_GENERATOR_SECOND_PUBLICKEY_IS_REQUIRED = (ec.next =
  "Block generatorSecondPublicKey is required, signature {signature} generatorAddress {generatorAddress} height {height} when {function}");
/**signature senderId applyBlockHeight type function */
export const TRANSACTION_SENDER_SECOND_PUBLICKEY_ALREADY_CHANGE = (ec.next =
  "Transaction sender second secret have already change, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**signature generatorAddress height function */
export const BLOCK_GENERATOR_SECOND_PUBLICKEY_ALREADY_CHANGE = (ec.next =
  "Block generator second secret have already change, signature {signature} generatorAddress {generatorAddress} height {height} when {function}");
/**signature senderId applyBlockHeight type function */
export const TRANSACTION_SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY = (ec.next =
  "Transaction should not have senderSecondPublicKey, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**signature generatorAddress height function */
export const BLOCK_SHOULD_NOT_HAVE_GENERATOR_SECOND_PUBLICKEY = (ec.next =
  "Block should not have generatorSecondPublicKey, signature {signature} generatorAddress {generatorAddress} height {height} when {function}");
/**signature senderId applyBlockHeight type function */
export const TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE = (ec.next =
  "Transaction should not have signSignature, signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**signature generatorAddress height function */
export const BLOCK_SHOULD_NOT_HAVE_SIGN_SIGNATURE = (ec.next =
  "Block should not have signSignature, signature {signature} generatorAddress {generatorAddress} height {height} when {function}");
/**reason function */
export const INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT = (ec.next =
  "Invalid transaction apply block height, reason {reason} when {function}");
/**reason function */
export const INVALID_TRANSACTION_EFFECTIVE_BLOCK_HEIGHT = (ec.next =
  "Invalid transaction effective block height, reason {reason} when {function}");
/**reason signature senderId applyBlockHeight type function */
export const INVALID_TRANSACTION_FROM_MAGIC = (ec.next =
  "Invalid transaction from magic, reason {reason} signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**reason signature senderId applyBlockHeight type function */
export const INVALID_TRANSACTION_TO_MAGIC = (ec.next =
  "Invalid transaction to magic, reason {reason} signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**reason signature senderId applyBlockHeight type function */
export const INVALID_TRANSACTION_TIMESTAMP = (ec.next =
  "Invalid transaction timestamp, reason {reason} signature {signature} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**reason signature height generatorPublicKey function */
export const INVALID_BLOCK_TIMESTAMP = (ec.next =
  "Invalid block timestamp, reason {reason} signature {signature} height {height} generatorPublicKey {generatorPublicKey} when {function}");
/**dappid function */
export const DAPPID_IS_NOT_EXIST = (ec.next =
  "DAppid is not exist, dappid {dappid} when {function}");
/**dappid function */
export const DAPPID_IS_ALREADY_EXIST = (ec.next =
  "DAppid is already exist, dappid {dappid} errorId {errorId} when {function}");
/**locationName function */
export const LOCATION_NAME_IS_NOT_EXIST = (ec.next =
  "LocationName is not exist, locationName {locationName} errorId {errorId} when {function}");
/**locationName function */
export const LOCATION_NAME_IS_ALREADY_EXIST = (ec.next =
  "LocationName is already exist, locationName {locationName} errorId {errorId} when {function}");
/**rangeType function */
export const UNKNOWN_RANGE_TYPE = (ec.next =
  "Unknow range type, rangeType {rangeType} when {function}");
/**reason errorId function */
export const ASSET_NOT_ENOUGH = (ec.next =
  "Asset not enough, reason {reason} errorId {errorId} when {function}");
/**reason errorId function */
export const ACCOUNT_REMAIN_EQUITY_NOT_ENOUGH = (ec.next =
  "Account remain equity not enough, reason {reason} errorId {errorId} when {function}");
/**reason function */
export const INVALID_TRANSACTION_BYTE_LENGTH = (ec.next =
  "Invalid transaction byte length, reason {reason} when {function}");
/**dappid function */
export const NEED_PURCHASE_DAPPID_BEFORE_USE = (ec.next =
  "Need purchase dappid before use, dappid {dappid} when {function}");
/**dappid function */
export const NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE = (ec.next =
  "Need vote for dappid possessor before use, dappid {dappid} errorId {errorId} when {function}");
/**function */
export const POSSESS_ASSET_EXCEPT_CHAIN_ASSET = (ec.next =
  "Account possess asset expect chain asset when {function}");
/**function */
export const POSSESS_FROZEN_ASSET_EXCEPT_CHAIN_ASSET = (ec.next =
  "Account possess frozen asset expect chain asset when {function}");
/**address function */
export const ACCOUNT_IS_NOT_AN_DELEGATE = (ec.next =
  "Account with address {address} is not an delegate errorId {errorId} when {function}");
/**address errorId function */
export const ACCOUNT_IS_ALREADY_AN_DELEGATE = (ec.next =
  "Account with address {address} is already an delegate errorId {errorId} when {function}");
/**address function */
export const DELEGATE_IS_ALREADY_ACCEPT_VOTE = (ec.next =
  "Delegate with address {address} is already accept vote when {function}");
/**address function */
export const DELEGATE_IS_ALREADY_REJECT_VOTE = (ec.next =
  "Delegate with address {address} is already reject vote errorId {errorId} when {function}");
/**frozenId function */
export const NOT_BEGIN_UNFROZEN_YET = (ec.next =
  "Frozen asset is not begin to unfrozen yet, frozenId {frozenId} when {function}");
/**frozenId function */
export const FROZEN_ASSET_EXPIRATION = (ec.next =
  "Frozen asset is already expiration, frozenId {frozenId} when {function}");
/**address dappid function */
export const ACCOUNT_NOT_DAPPID_POSSESSOR = (ec.next =
  "Account with address {address} not dappid {dappid} possessor when {function}");
/**address locationName function */
export const ACCOUNT_NOT_LOCATION_NAME_POSSESSOR = (ec.next =
  "Account with address {address} not locationName {locationName} possessor errorId {errorId} when {function}");
/**dappid function */
export const DAPPID_NOT_FROZEN = (ec.next = "DAppid not frozen, dappid {dappid} when {function}");
/**dappid function */
export const DAPPID_ALREADY_FROZEN = (ec.next =
  "DAppid already frozen, dappid {dappid} when {function}");
/**locationName function */
export const LOCATION_NAME_NOT_FROZEN = (ec.next =
  "LocationName not frozen, locationName {locationName} when {function}");
/**locationName function */
export const LOCATION_NAME_ALREADY_FROZEN = (ec.next =
  "LocationName already frozen, locationName {locationName} when {function}");
/**type asset function */
export const NO_NEED_TO_PURCHASE_SPECIAL_ASSET = (ec.next =
  "No need to purchase asset, type {type} asset {asset} when {function}");
/**magic assetType function */
export const ASSET_NOT_EXIST = (ec.next =
  "Asset not exist, magic {magic} assetType {assetType} when {function}");
/**address alias function */
export const INVALID_ACCOUNT_ALIAS = (ec.next =
  "Invalid account alias, address {address} alias {alias} {function}");
/**address function */
export const SET_USERANME_AT_FIRST = (ec.next =
  "Please set username at first, address {address} when {function}");
/**address, function */
export const NEED_EMIGRATE_TOTAL_ASSET = (ec.next =
  "Need emigrate total asset, address {address} when {function}");
/**frozenId function */
export const UNFROZEN_TIME_USE_UP = (ec.next =
  "Gift asset unfrozen time use up, frozenId {frozenId} when {function}");
/**frozenId function */
export const GRABALE_TIME_USE_UP = (ec.next =
  "Gift asset grabale time use up, frozenId {frozenId} when {function}");
/**migrateCertificateId function */
export const ASSET_IS_ALREADY_MIGRATION = (ec.next =
  "Asset is already migration, migrateCertificateId {migrateCertificateId} when {function}");
/**reason function */
export const TOO_MANY_EXPECTEDISSUEDASSETS = (ec.next =
  "Too many expectedIssuedAssets, reason {reason} when function");
/**genesisAddress senderAddress function */
export const TRANSFER_TO_SENDER_BEFORE = (ec.next =
  "Genesis account {genesisAddress} must transfer to sender {senderAddress} before, when {function}");
/**prop reason errorId function */
export const TOO_LARGE = (ec.next =
  "{prop} is too large reason {reason} errorId {errorId} when {function}");
/**locationName function */
export const CAN_NOT_DELETE_LOCATION_NAME = (ec.next =
  "Can not delete locationName {locationName} reason {reason} when {function}");
/**locationName reason errorId function */
export const SET_LOCATION_NAME_MANAGER_FIELD = (ec.next =
  "Set locationName {locationName} manager field reason {reason} errorId {errorId} when {function}");
/**locationName reason errorId function */
export const SET_LOCATION_NAME_RECORD_VALUE_FIELD = (ec.next =
  "Set locationName {locationName} recordValue field reason {reason} errorId {errorId} when {function}");
/**function */
export const CAN_NOT_CARRY_SECOND_PUBLICKEY = (ec.next =
  "Can not carry second publicKey when {function}");
/**function */
export const CAN_NOT_CARRY_SECOND_SIGNATURE = (ec.next =
  "Can not carry second signature when {function}");
/**function */
export const ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE = (ec.next =
  "Only top level location name can exchange when {function}");
/**errorId function */
export const ACCOUNT_ALREADY_HAVE_USERNAME = (ec.next =
  "Account already has a username errorId {errorId} when {function}");
/**errorId function */
export const USERNAME_ALREADY_EXIST = (ec.next =
  "Username already exist errorId {errorId} when {function}");
/**reason function */
export const CAN_NOT_SECONDARY_TRANSACTION = (ec.next =
  "Can not secondary transaction, reason {reason} when {function}");
/**errorId minFee function */
export const TRANSACTION_FEE_NOT_ENOUGH = (ec.next =
  "Transaction fee is not enough errorId {errorId} minFee {minFee} when {function}");
/**reason function */
export const INVALID_BLOCK_GENERATOR = (ec.next =
  "Invalid block generator, reason {reason} when function");
/**height function */
export const SHOULD_NOT_TICK = (ec.next =
  "Block with height {height} in {target} should not tick when {function}");
/**prop target function */
export const FORBIDDEN = (ec.next = "{prop} in {target} is forbidden when {function}");
/**operationName function*/
export const PERMISSION_DENIED = (ec.next =
  "Permission denied at operation {operationName} when {function}");
/**round function */
export const REGISTER_DELEGTE_QUOTA_FULL = (ec.next =
  "The register delegate quota is full in round {round} when {function}");
/**reason function */
export const REJECT_REGISTER_DELEGATE = (ec.next =
  "Reject register delegate with reason {reason} when {function}");
/**errorId reason function */
export const VERIFY_TRANSACTION_POW_OF_WORK_ERROR = (ec.next =
  "Verify transaction pow of work error, errorId {errorId} reason {reason} when {function}");
/**prop target value function */
export const SHOULD_INCLUDE = (ec.next =
  "{prop} in {target} should inclue {value} when {function}");
/**assetType mainAsset function */
export const TRUST_MAIN_ASSET_ONLY = (ec.next =
  "You can only trust main asset, {assetType} is not main asset {mainAsset}, when {function}");
/**assetType mainAsset function */
export const USE_MAIN_ASSET_PURCHASE_ONLY = (ec.next =
  "You can only use main asset to purchase, {assetType} is not main asset {mainAsset}, when {function}");
/**prop target function */
export const NOT_EXIST_OR_EXPIRED = (ec.next =
  "{prop} in {target} not exist or expired when {function}");
/**function */
export const VOTE_RECENTLY = (ec.next = "Account participate vote recently when {function}");
/**function */
export const POSSESS_FROZEN_ASSET = (ec.next = "Account possess frozen asset when {function}");
/**expected actual function */
export const GENESIS_DELEGATE_NOT_ENOUGH = (ec.next =
  "Genesis delegate not enough, at least {expected}, actual {actual} when {function}");
/**prop target function */
export const PROP_SHOULD_BE_ARRAY = (ec.next =
  "{prop} in {target} should be an array when {function}");
/**assetType mainAsset function */
export const MIGRATE_MAIN_ASSET_ONLY = (ec.next =
  "You can only migrate main asset, {assetType} is not main asset {mainAsset}, when {function}");
/**function */
export const DELEGATE_CAN_NOT_MIGRATE_ASSET = (ec.next =
  "Delegate can not migrate asset, when {function}");
/**signature function */
export const NOT_EXPECTED_RELATED_TRANSACTION = (ec.next =
  "Transaction with signature {signature} is not an expected related transaction, when {function}");
/**factoryId function */
export const ENTITY_FACTORY_IS_NOT_EXIST = (ec.next =
  "Entity factory is not exist, factoryId {factoryId} when {function}");
/**factoryId function */
export const ENTITY_FACTORY_IS_ALREADY_EXIST = (ec.next =
  "Entity factory is already exist, factoryId {factoryId} errorId {errorId} when {function}");
/**entityId function */
export const ENTITY_IS_NOT_EXIST = (ec.next =
  "Entity is not exist, entityId {entityId} when {function}");
/**entityId function */
export const ENTITY_IS_ALREADY_EXIST = (ec.next =
  "Entity is already exist, entityId {entityId} errorId {errorId} when {function}");
/**entityId function */
export const CAN_NOT_DESTORY_ENTITY = (ec.next =
  "Can not destory entityId {entityId} reason {reason} when {function}");
/**address entityId function */
export const ACCOUNT_NOT_ENTITY_POSSESSOR = (ec.next =
  "Account with address {address} not entityId {entityId} possessor errorId {errorId} when {function}");
/**entityId function */
export const ENTITY_NOT_FROZEN = (ec.next =
  "Entity not frozen, locationName {entityId} when {function}");
/**entityId function */
export const ENTITY_ALREADY_FROZEN = (ec.next =
  "Entity already frozen, entityId {entityId} when {function}");
/**entityId function */
export const ENTITY_ALREADY_DESTORY = (ec.next =
  "Entity already destory, entityId {entityId} when {function}");
// #endregion
export const errorCode = new Map(
  ec.errorCode.concat([
    /**最通用的外层错误 */
    ["unknown error", "7001"],
  ]),
);
