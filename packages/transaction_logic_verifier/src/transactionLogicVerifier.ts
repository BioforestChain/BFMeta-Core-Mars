import * as ATOM_TRSLGCVFR from "./atom_transactionLogicVerifier";
import { TRANSACTION_TYPES_BASE, Transaction } from "@bfchain/core-model-transaction";
import {
  AccountBaseHelper,
  ConfigHelper,
  TransactionHelper,
  AsymmetricHelper,
} from "@bfchain/core-helper";
import { Injectable, Inject, ModuleStroge, Resolve } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import type { TransactionLogicVerifier } from "./atom_transactionLogicVerifier";

const { ArgumentFormatException } = CoreExceptionGenerator(
  "CONTROLLER",
  "TransactionLogicVerifierCore",
);

@Injectable("bfchain-core:TransactionLogicVerifierCore")
export class TransactionLogicVerifierCore {
  constructor(
    public transactionHelper: TransactionHelper,
    public accountBaseHelper: AccountBaseHelper,
    public asymmetricHelper: AsymmetricHelper,
    @Inject("keypairHelper")
    public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
    public config: ConfigHelper,
    public moduleMap: ModuleStroge,
  ) {}

  // #region txLogicVerifier
  /**各种交易逻辑校验器的实例缓存 */
  private _txLogicVerifierCache = new Map<
    BFChainCore.TransactionLogicVerifierConstructor<any>,
    TransactionLogicVerifier<any>
  >();
  /**获取交易逻辑校验器 */
  getTransactionLogicVerifier<T extends Transaction>(
    LogicVerifier: BFChainCore.TransactionLogicVerifierConstructor<T>,
  ) {
    let transactionLogicVerifier: TransactionLogicVerifier<T> | undefined =
      this._txLogicVerifierCache.get(LogicVerifier);
    if (!transactionLogicVerifier) {
      transactionLogicVerifier = Resolve(LogicVerifier, this.moduleMap);
      this._txLogicVerifierCache.set(LogicVerifier, transactionLogicVerifier);
    }
    return transactionLogicVerifier;
  }
  /**使用交易类型获取交易的逻辑校验器 */
  getTransactionLogicVerifierFromType<T extends Transaction>(type: string) {
    const { baseType } = this.transactionHelper.parseType(type);
    return this.getTransactionLogicVerifierFromBaseType<T>(baseType);
  }

  /**使用交易的基础类型获取交易的逻辑校验器 */
  getTransactionLogicVerifierFromBaseType<T extends Transaction>(
    base_type: TRANSACTION_TYPES_BASE,
  ) {
    const TransactionLogicVerifier = TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.get(base_type);
    if (!TransactionLogicVerifier) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_BASE_TYPE, { base_type });
    }
    return this.getTransactionLogicVerifier<T>(TransactionLogicVerifier);
  }
  // #endregion
}

/**
 * K : TRANSACTION_TYPES_BASE KEY
 * LV : LogicVerifierConstructror
 */
export const TRANSACTION_LOGIC_VERIFIER_TYPES_MAP = (() => {
  const BASE_LOGIC_VERIFIER = new Map<
    TRANSACTION_TYPES_BASE,
    BFChainCore.TransactionLogicVerifierConstructor<any>
  >();
  const LOGIC_VERIFIER_BASE = new Map<
    BFChainCore.TransactionLogicVerifierConstructor<any>,
    TRANSACTION_TYPES_BASE
  >();
  (
    [
      [TRANSACTION_TYPES_BASE.USERNAME, ATOM_TRSLGCVFR.UsernameLogicVerifier],
      [TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRSLGCVFR.SignatureLogicVerifier],
      [TRANSACTION_TYPES_BASE.DELEGATE, ATOM_TRSLGCVFR.DelegateLogicVerifier],
      [TRANSACTION_TYPES_BASE.VOTE, ATOM_TRSLGCVFR.VoteLogicVerifier],
      [TRANSACTION_TYPES_BASE.ACCEPT_VOTE, ATOM_TRSLGCVFR.AcceptVoteLogicVerifier],
      [TRANSACTION_TYPES_BASE.REJECT_VOTE, ATOM_TRSLGCVFR.RejectVoteLogicVerifier],
      [TRANSACTION_TYPES_BASE.DAPP, ATOM_TRSLGCVFR.DAppLogicVerifier],
      [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRSLGCVFR.DAppPurchasingLogicVerifier],
      [TRANSACTION_TYPES_BASE.MARK, ATOM_TRSLGCVFR.MarkLogicVerifier],

      [TRANSACTION_TYPES_BASE.ISSUE_ASSET, ATOM_TRSLGCVFR.IssueAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.DESTORY_ASSET, ATOM_TRSLGCVFR.DestoryAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.TRANSFER_ASSET, ATOM_TRSLGCVFR.TransferAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ATOM_TRSLGCVFR.ToExchangeAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, ATOM_TRSLGCVFR.BeExchangeAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.GIFT_ASSET, ATOM_TRSLGCVFR.GiftAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.GRAB_ASSET, ATOM_TRSLGCVFR.GrabAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.TRUST_ASSET, ATOM_TRSLGCVFR.TrustAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, ATOM_TRSLGCVFR.SignForAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, ATOM_TRSLGCVFR.EmigrateAssetLogicVerifier],
      [TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ATOM_TRSLGCVFR.ImmigrateAssetLogicVerifier],
      [
        TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET,
        ATOM_TRSLGCVFR.ToExchangeSpecialAssetLogicVerifier,
      ],
      [
        TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET,
        ATOM_TRSLGCVFR.BeExchangeSpecialAssetLogicVerifier,
      ],

      [TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRSLGCVFR.LocationNameLogicVerifier],
      [TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, ATOM_TRSLGCVFR.SetLnsRecordValueLogicVerifier],
      [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRSLGCVFR.SetLnsManagerLogicVerifier],

      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY, ATOM_TRSLGCVFR.IssueEntityFactoryLogicVerifier],
      [
        TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY_V1,
        ATOM_TRSLGCVFR.IssueEntityFactoryV1LogicVerifier,
      ],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY, ATOM_TRSLGCVFR.IssueEntityV1LogicVerifier],
      [TRANSACTION_TYPES_BASE.DESTORY_ENTITY, ATOM_TRSLGCVFR.DestoryEntityLogicVerifier],

      [TRANSACTION_TYPES_BASE.TRANSFER_ANY, ATOM_TRSLGCVFR.TransferAnyLogicVerifier],
      [TRANSACTION_TYPES_BASE.GIFT_ANY, ATOM_TRSLGCVFR.GiftAnyLogicVerifier],
      [TRANSACTION_TYPES_BASE.GRAB_ANY, ATOM_TRSLGCVFR.GrabAnyLogicVerifier],

      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY, ATOM_TRSLGCVFR.ToExchangeAnyLogicVerifier],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY, ATOM_TRSLGCVFR.BeExchangeAnyLogicVerifier],

      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_MULTI, ATOM_TRSLGCVFR.IssueEntityMultiV1LogicVerifier],

      [
        TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI,
        ATOM_TRSLGCVFR.ToExchangeAnyMultiLogicVerifier,
      ],
      [
        TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI,
        ATOM_TRSLGCVFR.BeExchangeAnyMultiLogicVerifier,
      ],

      [
        TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI_ALL,
        ATOM_TRSLGCVFR.ToExchangeAnyMultiAllLogicVerifier,
      ],
      [
        TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI_ALL,
        ATOM_TRSLGCVFR.BeExchangeAnyMultiAllLogicVerifier,
      ],
    ] as [TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>][]
  ).forEach(([K, LV]) => {
    BASE_LOGIC_VERIFIER.set(K, LV);
    LOGIC_VERIFIER_BASE.set(LV, K);
  });

  return {
    KLV: BASE_LOGIC_VERIFIER,
    LVK: LOGIC_VERIFIER_BASE,
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
