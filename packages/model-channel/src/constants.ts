/**响应结果类型 */
export enum RESPONSE_STATUS {
  error = 0,
  busy = 1,
  success = 2,
}
/**区块链节点状态 */
export enum BLOCKCHAIN_STATUS {
  /**离线：不可用 */
  OFFLINE,
  /**重启中 */
  RESTARTING,
  /**自由状态，有空闲资源可用 */
  FREE,
  /**繁忙：重建区块链 */
  REBUIDING,
  /**繁忙：节点共识 */
  PEER_SCANNING,
  /**繁忙：重放区块
   * 下载区块并校验
   * download & verify
   */
  REPLAY_BLOCK,
  /**繁忙：锻造区块 */
  GENERATING,
  /**繁忙：回滚区块 */
  ROLLBACK,
}
/**接收新区块后，区块的所处位置判断 */
export enum NewTransactionStatus {
  /**拒绝接收，可能是队列已经满 */
  Refuse = 0,
  /**已经在区块中 */
  InBlock = 1,
  /**已经在未处理交易中 */
  InUnconfirmQuene = 2,
}

/**接收到新交易时拒绝的理由 */
export enum NewTransactionRefuseReason {
  // /**缺省：未确定的异常 */
  // UNKNOWN,
  /**手续费低于网络手续费 */
  FEE_LESS_THAN_WEB_FEE,
  /**交易过期 */
  TRS_EXPRIED,
  /**交易已经在未处理交易进程 */
  TRANSACTION_IN_UNTREATEDTR,
  /**交易已经在交易表中 */
  TRANSACTION_IN_TRS,
  /**交易基础类型未找到 */
  TRANSACTION_BASE_TYPE_NOT_FOUND,
  /**交易类型未找到 */
  TRANSACTION_BASE_NOT_FOUND,
  /**链资产不足 */
  CHAIN_ASSET_NOT_ENOUGH,
  /**资产不足 */
  ASSET_NOT_ENOUGH,
  /**交易的发起账户资产冻结 */
  TRANSACTION_SENDER_ASSET_FROZEN,
  /**交易的接收账户资产冻结 */
  TRANSACTION_RECIPIENT_ASSET_FROZEN,
  /**交易的手续费不足 */
  TRANSACTION_FEE_NOT_ENOUGH,
  /**必须给 dapp 的开发者投票 */
  MUSET_VOTE_FOR_DAPP_POSSESSOR,
  /**交易资产负债 */
  TRANSACTION_ASSET_DEBT,
  /**链域名不存在 */
  LOCATION_NAME_NOT_EXIST,
  /**账户不是链域名的拥有者 */
  ACCOUNT_NOT_LNS_POSSESSOR,
  /**dapp 已经存在 */
  DAPP_ALREADY_EXISTS,
  /**账户已经是一个受托人 */
  ACCOUNT_ALREADY_DELEGATE,
  /**缩写名已经存在 */
  ASSETTYPE_ALREADY_EXIST,
  /**链名已经存在 */
  CHAINNAME_ALREADY_EXIST,
  /**资产已经存在 */
  ASSET_ALREADY_EXIST,
  /**链域名已经存在 */
  LOCATION_NAME_ALREADY_EXIST,
  /**不能将冻结账户设置为管理员 */
  CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER,
  /**不能将原来的管理员设置为管理员 */
  CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER,
  /**没有设置链域名管理员的权限 */
  SET_LNS_MANAGER_PERMISSION_DENIED,
  /**没有设置链域名管理员的权限 */
  SET_LNS_RECORD_VALUE_PERMISSION_DENIED,
  /**账户已经设置了用户名 */
  ACCOUNT_ALREADY_HAVE_USERNAME,
  /**用户名已经存在 */
  USERNAME_ALREADY_EXIST,
  /**账户已经给受托人投票 */
  ACCOUNT_ALREADY_VOTED_FOR_DELEGATE,
  /**交易来自未来 */
  TRS_IN_FEATURE,
  /**事件的 tpow 校验失败 */
  TRANSACTION_POW_CHECK_FIELD,
  /**只能见证主权益 */
  TRUST_MAIN_ASSET_ONLY,
  /**只能使用主权益购买 */
  USE_MAIN_ASSET_PURCHASE_ONLY,
  /**账户剩余权益不足 */
  ACCOUNT_REMAIN_EQUITY_NOT_ENOUGH,
  /**账户不是受托人 */
  ACCOUNT_IS_NOT_AN_DELEGATE,
  /**受托人拒绝收票 */
  DELEGATE_IS_ALREADY_REJECT_VOTE,
}

export enum DUPLEX_API_CMD {
  RESPONSE = 0b1, // 1 << _inc++, //= "RESPONSE",
  QUERY_TRANSACTION = 0b10, // 1 << _inc++, //= "/transaction/query",
  NEW_TRANSACTION = 0b100, // 1 << _inc++, //= "/transaction/broadcast",
  QUERY_BLOCK = 0b1000, // 1 << _inc++, //= "/block/query",
  NEW_BLOCK = 0b10000, // 1 << _inc++, //= "/block/broadcast",
  GET_PEER_INFO = 0b100000, // 1 << _inc++, //= "/peer/info",

  /**
   * @TODO 使用这些RETURN替代单纯的RESPONSE，
   * 这样可以达成更细致的数据分流与简单的响应校验
   */
  QUERY_TRANSACTION_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.QUERY_TRANSACTION,
  NEW_TRANSACTION_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.NEW_TRANSACTION,
  QUERY_BLOCK_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.QUERY_BLOCK,
  NEW_BLOCK_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.NEW_BLOCK,
  GET_PEER_INFO_RETURN = DUPLEX_API_CMD.RESPONSE | DUPLEX_API_CMD.GET_PEER_INFO,
}
