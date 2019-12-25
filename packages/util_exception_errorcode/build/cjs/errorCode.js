"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ec = {
    start: 10000,
    errorCode: [],
    set next(v) {
        ec.errorCode.push([v, String(ec.start++)]);
    },
};
/**prop target function */
exports.PROP_IS_REQUIRE = (ec.next = "{prop} in {target} is required when {function}");
/**prop target function */
exports.PROP_IS_INVALID = (ec.next = "{prop} in {target} is invalid when {function}");
/**function param */
exports.PARAM_LOST = (ec.next = "{function} params {param} lost");
/**veriable  function */
exports.OUT_OF_RANGE = (ec.next = "{variable} out of range in {function}");
/** to_compare_prop be_compare_prop to_target be_target */
exports.NOT_MATCH = (ec.next =
    "{to_compare_prop} in {to_target} and {be_compare_prop} in {be_target} not match");
/**prop target field */
exports.PROP_SHOULD_GT_FIELD = (ec.next = "{prop} in {target} should greater than {field}");
/**prop target field */
exports.PROP_SHOULD_GTE_FIELD = (ec.next =
    "{prop} in {target} should greater than or equals to {field}");
/**prop target field */
exports.PROP_SHOULD_LT_FIELD = (ec.next = "{prop} in {target} should less than {field}");
/**prop target field */
exports.PROP_SHOULD_LTE_FIELD = (ec.next =
    "{prop} in {target} should less than or equals to {field}");
/**prop target field */
exports.PROP_SHOULD_EQ_FIELD = (ec.next = "{prop} in {target} should equals to {field}");
/**prop target field */
exports.PROP_LENGTH_SHOULD_LTE_FIELD = (ec.next =
    "{prop} length in {target} should less than or equals to {field}");
/**prop target field */
exports.PROP_LENGTH_SHOULD_GTE_FIELD = (ec.next =
    "{prop} length in {target} should greater than or equals to {field}");
/**prop target field */
exports.PROP_LENGTH_SHOULD_EQ_FIELD = (ec.next =
    "{prop} length in {target} should equals to {field}");
/**prop target field */
exports.PROP_LENGTH_SHOULD_NOT_EQ_FIELD = (ec.next =
    "{prop} length in {target} should not equals to {field}");
/**variable function */
exports.DUPLICATE = (ec.next = "{variable} duplicate in {function}");
/**prop target limit function */
exports.OVER_LENGTH = (ec.next = "{prop} in {target} is over length {limit} when {function}");
/**prop target limit function */
exports.TOO_SHORT = (ec.next = "{prop} in {target} is less than {limit} when {function}");
/**prop target min max function */
exports.NOT_IN_EXPECTED_RANGE = (ec.next =
    "{prop} in {target} not in [{min}, {max}] when {function}");
/**to_compare_prop be_compare_prop to_target be_target function */
exports.SHOULD_BE_DIFFERENT = (ec.next =
    "{to_compare_prop} in {to_target} and {be_compare_prop} in {be_target} should be differnet when {function}");
/**to_compare_prop to_target be_compare_prop function */
exports.SHOULD_NOT_BE = (ec.next =
    "{to_compare_prop} in {to_target} should not be {be_compare_prop} when {function}");
/**to_compare_prop to_target be_compare_prop function */
exports.SHOULD_BE = (ec.next =
    "{to_compare_prop} in {to_target} should be {be_compare_prop} when {function}");
/**prop target field function */
exports.SHOULD_NOT_START_WITH_OR_END_WITH = (ec.next =
    "{prop} in {target} should not start with or end with {field} when {function}");
/**prop target function */
exports.NOT_EXIST = (ec.next = "{prop} in {target} not exist when {function}");
/**prop target errorId function */
exports.ALREADY_EXIST = (ec.next =
    "{prop} in {target} already exist errorId {errorId} when {function}}");
/**prop target function */
exports.SHOULD_NOT_EXIST = (ec.next = "{prop} in {target} should not exist when {function}");
/**prop target value function */
exports.SHOULD_NOT_INCLUDE = (ec.next =
    "{prop} in {target} should not inclue {value} when {function}");
/**prop target function */
exports.SHOULD_NOT_DUPLICATE = (ec.next =
    "{prop} in {target} should not duplicate when {function}");
exports.INVALID_PARAMS = (ec.next = "Invalid {function} params");
exports.INVALID_PARAMS_FIELD = (ec.next = "Invalid {function} params field: {field}");
exports.INVALID_TRANSACTION_BASE_TYPE = (ec.next =
    "Invalid transaction base type: {base_type}");
exports.INVALID_BLOCK_CONSTRUCTOR = (ec.next = "Invalid block constructor: {name}");
exports.INVALID_BLOCK_TYPE = (ec.next = "Invalid block type: {type}");
exports.TRAN_POW_VERIFY_FAIL = (ec.next =
    "transaction's porf of work verify fail when {function}");
exports.CUSTOM_TRANS_VERIFY_FAIL = (ec.next = "custom transaction verify fail: {message}");
// #region logicVerify
/**prop function */
exports.NOT_FOUND = (ec.next = "{prop} not found when {function}");
/**prop target function */
exports.PROP_LOSE = (ec.next = "{prop} in {target} lose when {function}");
/**address function errorId */
exports.ACCOUNT_FROZEN = (ec.next =
    "Account with address {address} was frozen errorId {errorId} when {function}");
/**address reason errorId function */
exports.ACCOUNT_CAN_NOT_BE_FROZEN = (ec.next =
    "Account with address {address} can not be frozen, reason {reason} errorId {errorId} when {function}");
/**id senderId applyBlockHeight type function */
exports.TRANSACTION_SIGN_SIGNATURE_IS_REQUIRED = (ec.next =
    "Transaction signSignature is required, id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**id senderId applyBlockHeight type function */
exports.SECOND_PUBLICKEY_ALREADY_CHANGE = (ec.next =
    "Transaction sender second secret have already change, id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**id senderId applyBlockHeight type function */
exports.SHOULD_NOT_HAVE_SENDER_SECOND_PUBLICKEY = (ec.next =
    "Transaction should not have senderSecondPublicKey, id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**id senderId applyBlockHeight type function */
exports.TRANSACTION_SHOULD_NOT_HAVE_SIGN_SIGNATURE = (ec.next =
    "Transaction should not have signSignature, id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**reason function */
exports.INVALID_TRANSACTION_APPLY_BLOCK_HEIGHT = (ec.next =
    "Invalid transaction apply block height, reason {reason} when {function}");
/**reason id senderId applyBlockHeight type function */
exports.INVALID_TRANSACTION_FROM_MAGIC = (ec.next =
    "Invalid transaction from magic, reason {reason} id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**reason id senderId applyBlockHeight type function */
exports.INVALID_TRANSACTION_TO_MAGIC = (ec.next =
    "Invalid transaction to magic, reason {reason} id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**reason id senderId applyBlockHeight type function */
exports.INVALID_TRANSACTION_TIMESTAMP = (ec.next =
    "Invalid transaction timestamp, reason {reason} id {id} senderId {senderId} applyBlockHeight {applyBlockHeight} type {type} when {function}");
/**dappid function */
exports.DAPPID_IS_NOT_EXIST = (ec.next =
    "DAppid is not exist, dappid {dappid} when {function}");
/**dappid function */
exports.DAPPID_IS_ALREADY_EXIST = (ec.next =
    "DAppid is already exist, dappid {dappid} errorId {errorId} when {function}");
/**locationName function */
exports.LOCATION_NAME_IS_NOT_EXIST = (ec.next =
    "LocationName is not exist, locationName {locationName} errorId {errorId} when {function}");
/**locationName function */
exports.LOCATION_NAME_IS_ALREADY_EXIST = (ec.next =
    "LocationName is already exist, locationName {locationName} errorId {errorId} when {function}");
/**rangeType function */
exports.UNKNOWN_RANGE_TYPE = (ec.next =
    "Unknow range type, rangeType {rangeType} when {function}");
/**reason errorId function */
exports.ASSET_NOT_ENOUGH = (ec.next =
    "Asset not enough, reason {reason} errorId {errorId} when {function}");
/**reason errorId function */
exports.EQUITY_NOT_ENOUGH = (ec.next =
    "Equity not enough, reason {reason} errorId {errorId} when {function}");
/**reason function */
exports.INVALID_TRANSACTION_BYTE_LENGTH = (ec.next =
    "Invalid transaction byte length, reason {reason} when {function}");
/**dappid function */
exports.NEED_PURCHASE_DAPPID_BEFORE_USE = (ec.next =
    "Need purchase dappid before use, dappid {dappid} when {function}");
/**dappid function */
exports.NEED_VOTE_FOR_DAPPID_POSSESSOR_BFCORE_USE = (ec.next =
    "Need vote for dappid possessor before use, dappid {dappid} errorId {errorId} when {function}");
/**function */
exports.POSSESS_ASSET_EXCEPT_CHAIN_ASSET = (ec.next =
    "Account possess other asset expect chain asset when {function}");
/**address function */
exports.ACCOUNT_IS_NOT_AN_DELEGATE = (ec.next =
    "Account with address {address} is not an delegate when {function}");
/**address errorId function */
exports.ACCOUNT_IS_ALREADY_AN_DELEGATE = (ec.next =
    "Account with address {address} is already an delegate errorId {errorId} when {function}");
/**address function */
exports.DELEGATE_IS_ALREADY_ACCEPT_VOTE = (ec.next =
    "Delegate with address {address} is already accept vote when {function}");
/**address function */
exports.DELEGATE_IS_ALREADY_REJECT_VOTE = (ec.next =
    "Delegate with address {address} is already reject vote when {function}");
/**frozenId function */
exports.NOT_BEGIN_UNFROZEN_YET = (ec.next =
    "Frozen asset is not begin to unfrozen yet, frozenId {frozenId} when {function}");
/**frozenId function */
exports.FROZEN_ASSET_EXPIRATION = (ec.next =
    "Frozen asset is already expiration, frozenId {frozenId} when {function}");
/**address dappid function */
exports.ACCOUNT_NOT_DAPPID_POSSESSOR = (ec.next =
    "Account with address {address} not dappid {dappid} possessor when {function}");
/**address locationName function */
exports.ACCOUNT_NOT_LOCATION_NAME_POSSESSOR = (ec.next =
    "Account with address {address} not locationName {locationName} possessor errorId {errorId} when {function}");
/**dappid function */
exports.DAPPID_NOT_FROZEN = (ec.next = "DAppid not frozen, dappid {dappid} when {function}");
/**dappid function */
exports.DAPPID_ALREADY_FROZEN = (ec.next =
    "DAppid already frozen, dappid {dappid} when {function}");
/**locationName function */
exports.LOCATION_NAME_NOT_FROZEN = (ec.next =
    "LocationName not frozen, locationName {locationName} when {function}");
/**locationName function */
exports.LOCATION_NAME_ALREADY_FROZEN = (ec.next =
    "LocationName already frozen, locationName {locationName} when {function}");
/**type asset function */
exports.NO_NEED_TO_PURCHASE_SPECIAL_ASSET = (ec.next =
    "No need to purchase asset, type {type} asset {asset} when {function}");
/**magic assetType function */
exports.ASSET_NOT_EXIST = (ec.next =
    "Asset not exist, magic {magic} assetType {assetType} when {function}");
/**address alias function */
exports.INVALID_ACCOUNT_ALIAS = (ec.next =
    "Invalid account alias, address {address} alias {alias} {function}");
/**address function */
exports.SET_USERANME_AT_FIRST = (ec.next =
    "Please set username at first, address {address} when {function}");
/**address magic assetType reason function */
exports.CAN_NOT_DESTORY_ASSET = (ec.next =
    "Account with address {address} can not destory asset, magic {magic} assetType {assetType} reason {reason} when {function}");
/**address, function */
exports.NEED_EMIGRATE_TOTAL_ASSET = (ec.next =
    "Need emigrate total asset, address {address} when {function}");
/**frozenId function */
exports.GRABALE_TIME_USE_UP = (ec.next =
    "Gift asset grabale time use up, frozenId {frozenId} when {function}");
/**signature function */
exports.ASSET_IS_ALREADY_MIGRATION = (ec.next =
    "Asset is already migration, emigrate asset transaction signature {signature} when {function}");
/**reason function */
exports.TOO_MANY_EXPECTEDISSUEDASSETS = (ec.next =
    "Too many expectedIssuedAssets, reason {reason} when function");
/**genesisAddress senderAddress function */
exports.TRANSFER_TO_SENDER_BEFORE = (ec.next =
    "Genesis account {genesisAddress} must transfer to sender {senderAddress} before, when {function}");
/**magic function */
exports.SUBCHAIN_CAN_NOT_ISSUE_SUBCHAIN = (ec.next =
    "Subchain with magic {magic} can not issue another subchain when {function}");
/**prop reason errorId function */
exports.TOO_LARGE = (ec.next =
    "{prop} is too large reason {reason} errorId {errorId} when {function}");
/**locationName function */
exports.CAN_NOT_DELETE_LOCATION_NAME = (ec.next =
    "Can not delete locationName {locationName} reason {reason} when {function}");
/**locationName reason errorId function */
exports.SET_LOCATION_NAME_MANAGER_FIELD = (ec.next =
    "Set locationName {locationName} manager field reason {reason} errorId {errorId} when {function}");
/**locationName reason errorId function */
exports.SET_LOCATION_NAME_RECORD_VALUE_FIELD = (ec.next =
    "Set locationName {locationName} recordValue field reason {reason} errorId {errorId} when {function}");
/**function */
exports.CAN_NOT_CARRY_SECOND_PUBLICKEY = (ec.next =
    "Can not carry second publicKey when {function}");
/**function */
exports.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE = (ec.next =
    "Only top level location name can exchange when {function}");
/**errorId function */
exports.ACCOUNT_ALREADY_HAVE_USERNAME = (ec.next =
    "Account already has a username errorId {errorId} when {function}");
/**errorId function */
exports.USERNAME_ALREADY_EXIST = (ec.next =
    "Username already exist errorId {errorId} when {function}");
/**reason function */
exports.CAN_NOT_SECONDARY_TRANSACTION = (ec.next =
    "Can not secondary transaction, reason {reason} when {function}");
/**errorId minFee function */
exports.TRANSACTION_FEE_NOT_ENOUGH = (ec.next =
    "Transaction fee is not enough errorId {errorId} minFee {minFee} when {function}");
/**reason function */
exports.INVALID_BLOCK_GENERATOR = (ec.next =
    "Invalid block generator, reason {reason} when function");
/**height function */
exports.SHOULD_NOT_TICK = (ec.next =
    "Block with height {height} in {target} should not tick when {function}");
/**prop target function */
exports.FORBIDDEN = (ec.next = "{prop} in {target} is forbidden when {function}");
/**operationName function*/
exports.PERMISSION_DENIED = (ec.next =
    "Permission denied at operation {operationName} when {function}");
// #endregion
exports.errorCode = new Map(ec.errorCode.concat([
    /**最通用的外层错误 */
    ["unknown error", "7001"],
]));
//# sourceMappingURL=errorCode.js.map