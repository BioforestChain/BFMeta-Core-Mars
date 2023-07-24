import type { Transaction } from "@bfchain/core-model-transaction-base";

export enum TRANSACTION_TYPES_BASE {
  /**设置安全密码 */
  SIGNATURE = "BSE-01",
  /**注册锻造者 */
  DELEGATE = "BSE-02",
  /**治理投票 */
  VOTE = "BSE-03",
  /**设置用户名 */
  USERNAME = "BSE-04",
  /**开启收票 */
  ACCEPT_VOTE = "BSE-05",
  /**关闭收票 */
  REJECT_VOTE = "BSE-06",
  /**创建DAPPID */
  DAPP = "WOD-00",
  /**DAPPID付费 */
  DAPP_PURCHASING = "WOD-01",
  /**注册新世界 */
  REGISTER_CHAIN = "WOD-02",
  /**数据存证 */
  MARK = "EXT-00",
  /**创建权益 */
  ISSUE_ASSET = "AST-00",
  /**权益转移 */
  TRANSFER_ASSET = "AST-01",
  /**权益销毁 */
  DESTROY_ASSET = "AST-02",
  /**发起权益赠送 */
  GIFT_ASSET = "AST-03",
  /**接受权益赠送 */
  GRAB_ASSET = "AST-04",
  /**发起权益委托 */
  TRUST_ASSET = "AST-05",
  /**签收权益委托 */
  SIGN_FOR_ASSET = "AST-06",
  /**权益迁出 */
  EMIGRATE_ASSET = "AST-07",
  /**权益迁入 */
  IMMIGRATE_ASSET = "AST-08",
  /**发起权益交换 */
  TO_EXCHANGE_ASSET = "AST-09",
  /**接受权益交换 */
  BE_EXCHANGE_ASSET = "AST-10",
  /**发起资产交换 */
  TO_EXCHANGE_SPECIAL_ASSET = "AST-11",
  /**接受资产交换 */
  BE_EXCHANGE_SPECIAL_ASSET = "AST-12",
  /**注册/注销位名 */
  LOCATION_NAME = "LNS-00",
  /**设置位名解析值 */
  SET_LNS_RECORD_VALUE = "LNS-01",
  /**设置位名管理员 */
  SET_LNS_MANAGER = "LNS-02",
  /**创建非同质资产模板 - V0 版，冻结发行 */
  ISSUE_ENTITY_FACTORY = "ETY-00",
  /**创建非同质资产 */
  ISSUE_ENTITY = "ETY-01",
  /**销毁非同质资产 */
  DESTROY_ENTITY = "ETY-02",

  /**创建非同质资产模板 - V1 版，销毁发行 */
  ISSUE_ENTITY_FACTORY_V1 = "ETY-03",
  /**批量创建非同质资产 */
  ISSUE_ENTITY_MULTI = "ETY-04",

  /**任意资产转移 */
  TRANSFER_ANY = "AST-13",
  /**发起任意资产赠送 */
  GIFT_ANY = "AST-14",
  /**接受任意资产赠送 */
  GRAB_ANY = "AST-15",
  /**发起任意资产交换 */
  TO_EXCHANGE_ANY = "ECA-00",
  /**接受任意资产交换 */
  BE_EXCHANGE_ANY = "ECA-01",

  /**发起批量任意资产交换 */
  TO_EXCHANGE_ANY_MULTI = "ECA-02",
  /**接受批量任意资产交换 */
  BE_EXCHANGE_ANY_MULTI = "ECA-03",

  /**发起批量任意资产全量交换 */
  TO_EXCHANGE_ANY_MULTI_ALL = "ECA-04",
  /**接受批量任意资产全量交换 */
  BE_EXCHANGE_ANY_MULTI_ALL = "ECA-05",

  /**创建凭证 */
  ISSUE_CERTIFICATE = "CRT-00",
  /**销毁凭证 */
  DESTROY_CERTIFICATE = "CRT-01",

  /**个性事件 */
  CUSTOM = "CUS-00",

  /**组合事件 */
  MULTIPLE = "MTP-00",

  /**承诺事件 */
  PROMISE = "PMS-00",
  /**承诺兑现事件 */
  PROMISE_RESOLVE = "PMS-01",

  /**宏事件 */
  MACRO = "MAC-00",
  /**宏调用事件 */
  MACRO_CALL = "MAC-01",
}

/**
 * K : TRANSACTION_TYPES_BASE KEY
 *
 * V : TRANSACTION_TYPES_BASE VALUE
 *
 * M : TransactionModelConstructror
 */
export const TRANSACTION_TYPES_MAP: {
  VK: Map<TRANSACTION_TYPES_BASE, string>;
  KV: Map<string, TRANSACTION_TYPES_BASE>;
  VM: Map<TRANSACTION_TYPES_BASE, typeof Transaction>;
  MV: Map<typeof Transaction, TRANSACTION_TYPES_BASE>;
  trsTypeToV(type: string): TRANSACTION_TYPES_BASE;
} = {
  VK: new Map<TRANSACTION_TYPES_BASE, string>(),
  KV: new Map<string, TRANSACTION_TYPES_BASE>(),
  VM: new Map<TRANSACTION_TYPES_BASE, typeof Transaction>(),
  MV: new Map<typeof Transaction, TRANSACTION_TYPES_BASE>(),
  trsTypeToV(type: string) {
    const CHAIN_NAME_index = type.indexOf(
      "-",
      /**ASSETTYPE_index */
      type.indexOf("-") + 1,
    );
    return type.substr(CHAIN_NAME_index + 1) as TRANSACTION_TYPES_BASE;
  },
};
