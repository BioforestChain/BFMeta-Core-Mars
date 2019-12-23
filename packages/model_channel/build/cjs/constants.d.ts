/**响应结果类型 */
export declare enum RESPONSE_STATUS {
    error = 0,
    busy = 1,
    success = 2
}
/**区块链节点状态 */
export declare enum BLOCKCHAIN_STATUS {
    /**离线：不可用 */
    OFFLINE = 0,
    /**自由状态，有空闲资源可用 */
    FREE = 1,
    /**繁忙：重建区块链 */
    REBUIDING = 2,
    /**繁忙：节点共识 */
    PEER_SCANNING = 3,
    /**繁忙：重放区块
     * 下载区块并校验
     * download & verify
     */
    REPLAY_BLOCK = 4,
    /**繁忙：锻造区块 */
    GENERATING = 5,
    /**繁忙：回滚区块 */
    ROLLBACK = 6
}
/**接收新区块后，区块的所处位置判断 */
export declare enum NewTransactionStatus {
    /**拒绝接收，可能是队列已经满 */
    Refuse = 0,
    /**已经在区块中 */
    InBlock = 1,
    /**已经在未处理交易中 */
    InUnconfirmQuene = 2
}
/**接收到新交易时拒绝的理由 */
export declare enum NewTransactionRefuseReason {
    /**手续费低于网络手续费 */
    FEE_LESS_THAN_WEB_FEE = 0,
    /**交易过期 */
    TRS_EXPRIED = 1,
    /**交易已经在未处理交易进程 */
    TRANSACTION_IN_UNTREATEDTR = 2,
    /**交易已经在交易表中 */
    TRANSACTION_IN_TRS = 3,
    /**交易基础类型未找到 */
    TRANSACTION_BASE_TYPE_NOT_FOUND = 4,
    /**交易类型未找到 */
    TRANSACTION_BASE_NOT_FOUND = 5,
    /**链资产不足 */
    CHAIN_ASSET_NOT_ENOUGH = 6,
    /**资产不足 */
    ASSET_NOT_ENOUGH = 7,
    /**交易的发起账户资产冻结 */
    TRANSACTION_SENDER_ASSET_FROZEN = 8,
    /**交易的接收账户资产冻结 */
    TRANSACTION_RECIPIENT_ASSET_FROZEN = 9,
    /**交易的手续费不足 */
    TRANSACTION_FEE_NOT_ENOUGH = 10,
    /**必须给 dapp 的开发者投票 */
    MUSET_VOTE_FOR_DAPP_POSSESSOR = 11,
    /**交易资产负债 */
    TRANSACTION_ASSET_DEBT = 12,
    /**链域名不存在 */
    LOCATION_NAME_NOT_EXIST = 13,
    /**账户不是链域名的拥有者 */
    ACCOUNT_NOT_LNS_POSSESSOR = 14,
    /**dapp 已经存在 */
    DAPP_ALREADY_EXISTS = 15,
    /**账户已经是一个受托人 */
    ACCOUNT_ALREADY_DELEGATE = 16,
    /**DApp拥有者不能发行资产 */
    DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET = 17,
    /**DApp拥有者不能发行子链 */
    DAPP_POSSESSOR_CAN_NOT_ISSUE_SUBCHAIN = 18,
    /**链域名拥有者或管理员不能发行资产 */
    LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET = 19,
    /**链域名拥有者或管理员不能发行子链 */
    LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_SUBCHAIN = 20,
    /**缩写名已经存在 */
    ASSETTYPE_ALREADY_EXIST = 21,
    /**链名已经存在 */
    CHAINNAME_ALREADY_EXIST = 22,
    /**资产已经存在 */
    ASSET_ALREADY_EXIST = 23,
    /**链域名已经存在 */
    LOCATION_NAME_ALREADY_EXIST = 24,
    /**不能将冻结账户设置为管理员 */
    CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER = 25,
    /**不能将原来的管理员设置为管理员 */
    CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER = 26,
    /**没有设置链域名管理员的权限 */
    SET_LNS_MANAGER_PERMISSION_DENIED = 27,
    /**没有设置链域名管理员的权限 */
    SET_LNS_RECORD_VALUE_PERMISSION_DENIED = 28,
    /**账户已经设置了用户名 */
    ACCOUNT_ALREADY_HAVE_USERNAME = 29,
    /**用户名已经存在 */
    USERNAME_ALREADY_EXIST = 30,
    /**子链的每个区块最大交易量太大 */
    SUBCHAIN_MAXTPSPERBLOCK_TOO_BIG = 31,
    /**账户已经给受托人投票 */
    ACCOUNT_ALREADY_VOTED_FOR_DELEGATE = 32
}
export declare enum DUPLEX_API_CMD {
    RESPONSE = 1,
    QUERY_TRANSACTION = 2,
    NEW_TRANSACTION = 4,
    QUERY_BLOCK = 8,
    NEW_BLOCK = 16,
    GET_PEER_INFO = 32,
    /**
     * @TODO 使用这些RETURN替代单纯的RESPONSE，
     * 这样可以达成更细致的数据分流与简单的响应校验
     */
    QUERY_TRANSACTION_RETURN = 3,
    NEW_TRANSACTION_RETURN = 5,
    QUERY_BLOCK_RETURN = 9,
    NEW_BLOCK_RETURN = 17,
    GET_PEER_INFO_RETURN = 33
}
//# sourceMappingURL=constants.d.ts.map