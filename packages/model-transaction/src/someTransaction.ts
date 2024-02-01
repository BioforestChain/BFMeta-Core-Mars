import type { Transaction } from "@bfchain/core-model-transaction-base";
import { Type, Field, Message } from "@bfchain/protobuf";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TRANSACTION_TYPES_BASE, TRANSACTION_TYPES_MAP } from "./constants";

import * as ATOM_TRS from "./atom_transaction";

const { ArgumentFormatException, error, IllegalStateException } = CoreExceptionGenerator(
  "MODEL",
  "transactionModel",
);

(() => {
  const V_K = new Map<TRANSACTION_TYPES_BASE, string>();
  const K_V = new Map<string, TRANSACTION_TYPES_BASE>();
  for (const tran_key in TRANSACTION_TYPES_BASE) {
    const val = TRANSACTION_TYPES_BASE[tran_key as keyof typeof TRANSACTION_TYPES_BASE];
    K_V.set(tran_key, val);
    V_K.set(val, tran_key);
  }
  const BASE_MODEL = new Map<TRANSACTION_TYPES_BASE, typeof Transaction>();
  const MODEL_BASE = new Map<typeof Transaction, TRANSACTION_TYPES_BASE>();
  (
    [
      [TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRS.SignatureTransaction],

      [TRANSACTION_TYPES_BASE.DAPP, ATOM_TRS.DAppTransaction],
      [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRS.DAppPurchasingTransaction],
      [TRANSACTION_TYPES_BASE.MARK, ATOM_TRS.MarkTransaction],

      [TRANSACTION_TYPES_BASE.ISSUE_ASSET, ATOM_TRS.IssueAssetTransaction],
      [TRANSACTION_TYPES_BASE.INCREASE_ASSET, ATOM_TRS.IncreaseAssetTransaction],
      [TRANSACTION_TYPES_BASE.DESTROY_ASSET, ATOM_TRS.DestroyAssetTransaction],
      [TRANSACTION_TYPES_BASE.TRANSFER_ASSET, ATOM_TRS.TransferAssetTransaction],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ATOM_TRS.ToExchangeAssetTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, ATOM_TRS.BeExchangeAssetTransaction],
      [TRANSACTION_TYPES_BASE.GIFT_ASSET, ATOM_TRS.GiftAssetTransaction],
      [TRANSACTION_TYPES_BASE.GRAB_ASSET, ATOM_TRS.GrabAssetTransaction],
      [TRANSACTION_TYPES_BASE.TRUST_ASSET, ATOM_TRS.TrustAssetTransaction],
      [TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, ATOM_TRS.SignForAssetTransaction],
      [TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, ATOM_TRS.EmigrateAssetTransaction],
      [TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ATOM_TRS.ImmigrateAssetTransaction],

      [TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRS.LocationNameTransaction],
      [TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, ATOM_TRS.SetLnsRecordValueTransaction],
      [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRS.SetLnsManagerTransaction],

      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY, ATOM_TRS.IssueEntityFactoryTransaction],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY_V1, ATOM_TRS.IssueEntityFactoryTransactionV1],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY, ATOM_TRS.IssueEntityTransaction],
      [TRANSACTION_TYPES_BASE.DESTROY_ENTITY, ATOM_TRS.DestroyEntityTransaction],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_MULTI, ATOM_TRS.IssueEntityMultiTransaction],

      [TRANSACTION_TYPES_BASE.TRANSFER_ANY, ATOM_TRS.TransferAnyTransaction],
      [TRANSACTION_TYPES_BASE.GIFT_ANY, ATOM_TRS.GiftAnyTransaction],
      [TRANSACTION_TYPES_BASE.GRAB_ANY, ATOM_TRS.GrabAnyTransaction],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY, ATOM_TRS.ToExchangeAnyTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY, ATOM_TRS.BeExchangeAnyTransaction],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI, ATOM_TRS.ToExchangeAnyMultiTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI, ATOM_TRS.BeExchangeAnyMultiTransaction],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI_ALL, ATOM_TRS.ToExchangeAnyMultiAllTransaction],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI_ALL, ATOM_TRS.BeExchangeAnyMultiAllTransaction],

      [TRANSACTION_TYPES_BASE.ISSUE_CERTIFICATE, ATOM_TRS.IssueCertificateTransaction],
      [TRANSACTION_TYPES_BASE.DESTROY_CERTIFICATE, ATOM_TRS.DestroyCertificateTransaction],
    ] as [TRANSACTION_TYPES_BASE, typeof Transaction][]
  ).forEach(([K, M]) => {
    BASE_MODEL.set(K, M);
    MODEL_BASE.set(M, K);
  });

  TRANSACTION_TYPES_MAP.VK = V_K;
  TRANSACTION_TYPES_MAP.KV = K_V;
  TRANSACTION_TYPES_MAP.VM = BASE_MODEL;
  TRANSACTION_TYPES_MAP.MV = MODEL_BASE;
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
