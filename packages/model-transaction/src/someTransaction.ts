import type { Transaction } from "@bfchain/core-model-transaction-base";
import { Type, Field, Message } from "@bfchain/protobuf";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

import * as ATOM_TRS from "./atom_transaction";

const { ArgumentFormatException, error, IllegalStateException } = CoreExceptionGenerator(
  "MODEL",
  "transactionModel",
);

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
  DESTORY_ASSET = "AST-02",
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
  DESTORY_ENTITY = "ETY-02",

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

  /**个性事件 */
  CUSTOM = "CUS-00",

  /**组合事件 */
  MULTIPLE = "MTP-02",
}

/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * M : TransactionModelConstructror
 */
export const TRANSACTION_TYPES_MAP = (() => {
  const V_K = new Map<TRANSACTION_TYPES_BASE, string>();
  const K_V = new Map<string, TRANSACTION_TYPES_BASE>();
  for (const tran_key in TRANSACTION_TYPES_BASE) {
    const val = TRANSACTION_TYPES_BASE[tran_key as keyof typeof TRANSACTION_TYPES_BASE];
    K_V.set(tran_key, val);
    V_K.set(val, tran_key);
  }
  const BASE_MODEL = new Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionModelConstructor>();
  const MODEL_BASE = new Map<BFChainCore.TransactionModelConstructor, TRANSACTION_TYPES_BASE>();
  (
    [
      [TRANSACTION_TYPES_BASE.USERNAME, ATOM_TRS.UsernameTransaction],
      [TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRS.SignatureTransaction],
      [TRANSACTION_TYPES_BASE.DELEGATE, ATOM_TRS.DelegateTransaction],
      [TRANSACTION_TYPES_BASE.VOTE, ATOM_TRS.VoteTransaction],
      [TRANSACTION_TYPES_BASE.ACCEPT_VOTE, ATOM_TRS.AcceptVoteTransaction],
      [TRANSACTION_TYPES_BASE.REJECT_VOTE, ATOM_TRS.RejectVoteTransaction],
      [TRANSACTION_TYPES_BASE.DAPP, ATOM_TRS.DAppTransaction],
      [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRS.DAppPurchasingTransaction],
      [TRANSACTION_TYPES_BASE.MARK, ATOM_TRS.MarkTransaction],

      [TRANSACTION_TYPES_BASE.ISSUE_ASSET, ATOM_TRS.IssueAssetTransaction],
      [TRANSACTION_TYPES_BASE.DESTORY_ASSET, ATOM_TRS.DestoryAssetTransaction],
      [TRANSACTION_TYPES_BASE.TRANSFER_ASSET, ATOM_TRS.TransferAssetTransaction],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ATOM_TRS.ToExchangeAssetTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, ATOM_TRS.BeExchangeAssetTransaction],
      [TRANSACTION_TYPES_BASE.GIFT_ASSET, ATOM_TRS.GiftAssetTransaction],
      [TRANSACTION_TYPES_BASE.GRAB_ASSET, ATOM_TRS.GrabAssetTransaction],
      [TRANSACTION_TYPES_BASE.TRUST_ASSET, ATOM_TRS.TrustAssetTransaction],
      [TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, ATOM_TRS.SignForAssetTransaction],
      [TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, ATOM_TRS.EmigrateAssetTransaction],
      [TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ATOM_TRS.ImmigrateAssetTransaction],
      [
        TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET,
        ATOM_TRS.ToExchangeSpecialAssetTransaction,
      ],
      [
        TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET,
        ATOM_TRS.BeExchangeSpecialAssetTransaction,
      ],

      [TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRS.LocationNameTransaction],
      [TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, ATOM_TRS.SetLnsRecordValueTransaction],
      [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRS.SetLnsManagerTransaction],

      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY, ATOM_TRS.IssueEntityFactoryTransaction],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY_V1, ATOM_TRS.IssueEntityFactoryTransactionV1],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY, ATOM_TRS.IssueEntityTransactionV1],
      [TRANSACTION_TYPES_BASE.DESTORY_ENTITY, ATOM_TRS.DestoryEntityTransaction],

      [TRANSACTION_TYPES_BASE.TRANSFER_ANY, ATOM_TRS.TransferAnyTransaction],
      [TRANSACTION_TYPES_BASE.GIFT_ANY, ATOM_TRS.GiftAnyTransaction],
      [TRANSACTION_TYPES_BASE.GRAB_ANY, ATOM_TRS.GrabAnyTransaction],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY, ATOM_TRS.ToExchangeAnyTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY, ATOM_TRS.BeExchangeAnyTransaction],

      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_MULTI, ATOM_TRS.IssueEntityMultiTransactionV1],

      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI, ATOM_TRS.ToExchangeAnyMultiTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI, ATOM_TRS.BeExchangeAnyMultiTransaction],

      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI_ALL, ATOM_TRS.ToExchangeAnyMultiAllTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI_ALL, ATOM_TRS.BeExchangeAnyMultiAllTransaction],
    ] as [TRANSACTION_TYPES_BASE, typeof Transaction][]
  ).forEach(([K, M]) => {
    BASE_MODEL.set(K, M);
    MODEL_BASE.set(M, K);
  });

  return {
    VK: V_K,
    KV: K_V,
    VM: BASE_MODEL,
    MV: MODEL_BASE,
    // VLV: new Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>>(),
    // LVV: new Map<BFChainCore.TransactionLogicVerifierConstructor<any>, TRANSACTION_TYPES_BASE>(),
    trsTypeToV(type: string) {
      const CHAIN_NAME_index = type.indexOf(
        "-",
        /**ASSETTYPE_index */
        type.indexOf("-") + 1,
      );
      return type.substr(CHAIN_NAME_index + 1) as TRANSACTION_TYPES_BASE;
    },
  };
})();

const TRS_BYTE_WM = new WeakMap<Uint8Array, Readonly<Transaction>>();
@Type.d("SomeTransactionModel")
export class SomeTransactionModel<T extends BFChainCore.Transaction = BFChainCore.Transaction>
  extends Message<SomeTransactionModel<T>>
  implements BFChainCore.SomeTransactionJSON<T>
{
  static INC = 1;
  @Field.d(SomeTransactionModel.INC++, "string")
  protected _trs_base_type!: TRANSACTION_TYPES_BASE;
  @Field.d(SomeTransactionModel.INC++, "bytes")
  protected _trs_bytes!: Uint8Array;
  get transaction() {
    let trs = TRS_BYTE_WM.get(this._trs_bytes);
    if (!trs) {
      const Model = TRANSACTION_TYPES_MAP.VM.get(this._trs_base_type);
      if (!Model) {
        throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, {
          base_type: this._trs_base_type,
        });
      }
      trs = Model.decode(this._trs_bytes) as T;
      // 冻结交易与二进制之间的联系
      TRS_BYTE_WM.set(this._trs_bytes, Object.freeze(trs));
    }
    return trs as T;
  }
  set transaction(trs: T) {
    const base_type = TRANSACTION_TYPES_MAP.trsTypeToV(trs.type);
    if (!TRANSACTION_TYPES_MAP.VK.has(base_type)) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, { base_type });
    }
    if (Object.isFrozen(this)) {
      throw new IllegalStateException(ERROR_LIST.TRANSACTION_IS_IN_UNCHANGABLE_STATE);
    }
    this._trs_base_type = base_type;
    this._trs_bytes = new Uint8Array((trs.constructor as typeof Message).encode(trs).finish());
    // 如果时冻结的对象，那么建立交易与二进制之间的联系
    if (Object.isFrozen(trs)) {
      TRS_BYTE_WM.set(this._trs_bytes, trs);
    }
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<SomeTransactionModel>,
  ) {
    const res = super.fromObject(object) as SomeTransactionModel;
    if (object !== res) {
      const obj_transaction = object.transaction;
      if (obj_transaction) {
        if (!(obj_transaction instanceof Message)) {
          const type = obj_transaction.type;
          if (type) {
            const base_type = TRANSACTION_TYPES_MAP.trsTypeToV(type);
            const ModelCtor = TRANSACTION_TYPES_MAP.VM.get(base_type);
            if (!ModelCtor) {
              throw new ArgumentFormatException(ERROR_LIST.INVALID_TRANSACTION_BASE_TYPE, {
                type_base: base_type,
              });
            }
            res.transaction = ModelCtor.fromObject<Transaction>(obj_transaction);
          }
        } else {
          res.transaction = obj_transaction as Transaction;
        }
      }
    }
    return res as unknown as T;
  }
  toJSON() {
    return {
      transaction: this.transaction.toJSON() as BFChainUtil.ToJSONType<T>,
    };
  }
}
