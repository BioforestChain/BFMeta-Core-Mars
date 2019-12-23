"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**响应结果类型 */
var RESPONSE_STATUS;
(function (RESPONSE_STATUS) {
    RESPONSE_STATUS[RESPONSE_STATUS["error"] = 0] = "error";
    RESPONSE_STATUS[RESPONSE_STATUS["busy"] = 1] = "busy";
    RESPONSE_STATUS[RESPONSE_STATUS["success"] = 2] = "success";
})(RESPONSE_STATUS = exports.RESPONSE_STATUS || (exports.RESPONSE_STATUS = {}));
/**区块链节点状态 */
var BLOCKCHAIN_STATUS;
(function (BLOCKCHAIN_STATUS) {
    /**离线：不可用 */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["OFFLINE"] = 0] = "OFFLINE";
    /**自由状态，有空闲资源可用 */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["FREE"] = 1] = "FREE";
    /**繁忙：重建区块链 */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["REBUIDING"] = 2] = "REBUIDING";
    /**繁忙：节点共识 */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["PEER_SCANNING"] = 3] = "PEER_SCANNING";
    /**繁忙：重放区块
     * 下载区块并校验
     * download & verify
     */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["REPLAY_BLOCK"] = 4] = "REPLAY_BLOCK";
    /**繁忙：锻造区块 */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["GENERATING"] = 5] = "GENERATING";
    /**繁忙：回滚区块 */
    BLOCKCHAIN_STATUS[BLOCKCHAIN_STATUS["ROLLBACK"] = 6] = "ROLLBACK";
})(BLOCKCHAIN_STATUS = exports.BLOCKCHAIN_STATUS || (exports.BLOCKCHAIN_STATUS = {}));
/**接收新区块后，区块的所处位置判断 */
var NewTransactionStatus;
(function (NewTransactionStatus) {
    /**拒绝接收，可能是队列已经满 */
    NewTransactionStatus[NewTransactionStatus["Refuse"] = 0] = "Refuse";
    /**已经在区块中 */
    NewTransactionStatus[NewTransactionStatus["InBlock"] = 1] = "InBlock";
    /**已经在未处理交易中 */
    NewTransactionStatus[NewTransactionStatus["InUnconfirmQuene"] = 2] = "InUnconfirmQuene";
})(NewTransactionStatus = exports.NewTransactionStatus || (exports.NewTransactionStatus = {}));
/**接收到新交易时拒绝的理由 */
var NewTransactionRefuseReason;
(function (NewTransactionRefuseReason) {
    /**手续费低于网络手续费 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["FEE_LESS_THAN_WEB_FEE"] = 0] = "FEE_LESS_THAN_WEB_FEE";
    /**交易过期 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRS_EXPRIED"] = 1] = "TRS_EXPRIED";
    /**交易已经在未处理交易进程 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_IN_UNTREATEDTR"] = 2] = "TRANSACTION_IN_UNTREATEDTR";
    /**交易已经在交易表中 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_IN_TRS"] = 3] = "TRANSACTION_IN_TRS";
    /**交易基础类型未找到 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_BASE_TYPE_NOT_FOUND"] = 4] = "TRANSACTION_BASE_TYPE_NOT_FOUND";
    /**交易类型未找到 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_BASE_NOT_FOUND"] = 5] = "TRANSACTION_BASE_NOT_FOUND";
    /**链资产不足 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["CHAIN_ASSET_NOT_ENOUGH"] = 6] = "CHAIN_ASSET_NOT_ENOUGH";
    /**资产不足 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ASSET_NOT_ENOUGH"] = 7] = "ASSET_NOT_ENOUGH";
    /**交易的发起账户资产冻结 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_SENDER_ASSET_FROZEN"] = 8] = "TRANSACTION_SENDER_ASSET_FROZEN";
    /**交易的接收账户资产冻结 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_RECIPIENT_ASSET_FROZEN"] = 9] = "TRANSACTION_RECIPIENT_ASSET_FROZEN";
    /**交易的手续费不足 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_FEE_NOT_ENOUGH"] = 10] = "TRANSACTION_FEE_NOT_ENOUGH";
    /**必须给 dapp 的开发者投票 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["MUSET_VOTE_FOR_DAPP_POSSESSOR"] = 11] = "MUSET_VOTE_FOR_DAPP_POSSESSOR";
    /**交易资产负债 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["TRANSACTION_ASSET_DEBT"] = 12] = "TRANSACTION_ASSET_DEBT";
    /**链域名不存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["LOCATION_NAME_NOT_EXIST"] = 13] = "LOCATION_NAME_NOT_EXIST";
    /**账户不是链域名的拥有者 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ACCOUNT_NOT_LNS_POSSESSOR"] = 14] = "ACCOUNT_NOT_LNS_POSSESSOR";
    /**dapp 已经存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["DAPP_ALREADY_EXISTS"] = 15] = "DAPP_ALREADY_EXISTS";
    /**账户已经是一个受托人 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ACCOUNT_ALREADY_DELEGATE"] = 16] = "ACCOUNT_ALREADY_DELEGATE";
    /**DApp拥有者不能发行资产 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET"] = 17] = "DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET";
    /**DApp拥有者不能发行子链 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["DAPP_POSSESSOR_CAN_NOT_ISSUE_SUBCHAIN"] = 18] = "DAPP_POSSESSOR_CAN_NOT_ISSUE_SUBCHAIN";
    /**链域名拥有者或管理员不能发行资产 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET"] = 19] = "LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET";
    /**链域名拥有者或管理员不能发行子链 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_SUBCHAIN"] = 20] = "LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_SUBCHAIN";
    /**缩写名已经存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ASSETTYPE_ALREADY_EXIST"] = 21] = "ASSETTYPE_ALREADY_EXIST";
    /**链名已经存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["CHAINNAME_ALREADY_EXIST"] = 22] = "CHAINNAME_ALREADY_EXIST";
    /**资产已经存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ASSET_ALREADY_EXIST"] = 23] = "ASSET_ALREADY_EXIST";
    /**链域名已经存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["LOCATION_NAME_ALREADY_EXIST"] = 24] = "LOCATION_NAME_ALREADY_EXIST";
    /**不能将冻结账户设置为管理员 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER"] = 25] = "CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER";
    /**不能将原来的管理员设置为管理员 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER"] = 26] = "CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER";
    /**没有设置链域名管理员的权限 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["SET_LNS_MANAGER_PERMISSION_DENIED"] = 27] = "SET_LNS_MANAGER_PERMISSION_DENIED";
    /**没有设置链域名管理员的权限 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["SET_LNS_RECORD_VALUE_PERMISSION_DENIED"] = 28] = "SET_LNS_RECORD_VALUE_PERMISSION_DENIED";
    /**账户已经设置了用户名 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ACCOUNT_ALREADY_HAVE_USERNAME"] = 29] = "ACCOUNT_ALREADY_HAVE_USERNAME";
    /**用户名已经存在 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["USERNAME_ALREADY_EXIST"] = 30] = "USERNAME_ALREADY_EXIST";
    /**子链的每个区块最大交易量太大 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["SUBCHAIN_MAXTPSPERBLOCK_TOO_BIG"] = 31] = "SUBCHAIN_MAXTPSPERBLOCK_TOO_BIG";
    /**账户已经给受托人投票 */
    NewTransactionRefuseReason[NewTransactionRefuseReason["ACCOUNT_ALREADY_VOTED_FOR_DELEGATE"] = 32] = "ACCOUNT_ALREADY_VOTED_FOR_DELEGATE";
})(NewTransactionRefuseReason = exports.NewTransactionRefuseReason || (exports.NewTransactionRefuseReason = {}));
var DUPLEX_API_CMD;
(function (DUPLEX_API_CMD) {
    DUPLEX_API_CMD[DUPLEX_API_CMD["RESPONSE"] = 1] = "RESPONSE";
    DUPLEX_API_CMD[DUPLEX_API_CMD["QUERY_TRANSACTION"] = 2] = "QUERY_TRANSACTION";
    DUPLEX_API_CMD[DUPLEX_API_CMD["NEW_TRANSACTION"] = 4] = "NEW_TRANSACTION";
    DUPLEX_API_CMD[DUPLEX_API_CMD["QUERY_BLOCK"] = 8] = "QUERY_BLOCK";
    DUPLEX_API_CMD[DUPLEX_API_CMD["NEW_BLOCK"] = 16] = "NEW_BLOCK";
    DUPLEX_API_CMD[DUPLEX_API_CMD["GET_PEER_INFO"] = 32] = "GET_PEER_INFO";
    /**
     * @TODO 使用这些RETURN替代单纯的RESPONSE，
     * 这样可以达成更细致的数据分流与简单的响应校验
     */
    DUPLEX_API_CMD[DUPLEX_API_CMD["QUERY_TRANSACTION_RETURN"] = 3] = "QUERY_TRANSACTION_RETURN";
    DUPLEX_API_CMD[DUPLEX_API_CMD["NEW_TRANSACTION_RETURN"] = 5] = "NEW_TRANSACTION_RETURN";
    DUPLEX_API_CMD[DUPLEX_API_CMD["QUERY_BLOCK_RETURN"] = 9] = "QUERY_BLOCK_RETURN";
    DUPLEX_API_CMD[DUPLEX_API_CMD["NEW_BLOCK_RETURN"] = 17] = "NEW_BLOCK_RETURN";
    DUPLEX_API_CMD[DUPLEX_API_CMD["GET_PEER_INFO_RETURN"] = 33] = "GET_PEER_INFO_RETURN";
})(DUPLEX_API_CMD = exports.DUPLEX_API_CMD || (exports.DUPLEX_API_CMD = {}));
//# sourceMappingURL=constants.js.map