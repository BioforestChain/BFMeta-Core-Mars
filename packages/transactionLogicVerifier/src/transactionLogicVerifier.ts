import * as ATOM_TRSLGCVFR from "./atom_transactionLogicVerifier";
import { TransactionLogicVerifier } from "./atom_transactionLogicVerifier";
import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";

/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * F : LogicVerifierConstructror
 */
export const TLogicVerifier_TYPES_MAP = (() => {
  const V_K = new Map<TRANSACTION_TYPES_BASE, string>();
  const K_V = new Map<string, TRANSACTION_TYPES_BASE>();
  for (let tran_key in TRANSACTION_TYPES_BASE) {
    const val = TRANSACTION_TYPES_BASE[tran_key as keyof typeof TRANSACTION_TYPES_BASE];
    K_V.set(tran_key, val);
    V_K.set(val, tran_key);
  }
  const BASE_LOGIC_VERIFIER = new Map<
    TRANSACTION_TYPES_BASE,
    BFChainCore.TransactionLogicVerifierConstructor<any>
  >();
  const LOGIC_VERIFIER_BASE = new Map<
    BFChainCore.TransactionLogicVerifierConstructor<any>,
    TRANSACTION_TYPES_BASE
  >();
  ([
    [TRANSACTION_TYPES_BASE.USERNAME, ATOM_TRSLGCVFR.UsernameLogicVerifier],
    [TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRSLGCVFR.SignatureLogicVerifier],
    [TRANSACTION_TYPES_BASE.DELEGATE, ATOM_TRSLGCVFR.DelegateLogicVerifier],
    [TRANSACTION_TYPES_BASE.VOTE, ATOM_TRSLGCVFR.VoteLogicVerifier],
    [TRANSACTION_TYPES_BASE.ACCEPT_VOTE, ATOM_TRSLGCVFR.AcceptVoteLogicVerifier],
    [TRANSACTION_TYPES_BASE.REJECT_VOTE, ATOM_TRSLGCVFR.RejectVoteLogicVerifier],
    [TRANSACTION_TYPES_BASE.CUSTOM, ATOM_TRSLGCVFR.CustomLogicVerifier],
    [TRANSACTION_TYPES_BASE.DAPP, ATOM_TRSLGCVFR.DAppLogicVerifier],
    [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRSLGCVFR.DAppPurchasingLogicVerifier],
    [TRANSACTION_TYPES_BASE.MARK, ATOM_TRSLGCVFR.MarkLogicVerifier],
    // [TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, ATOM_TRS.IssueSubchainTransaction],

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
  ] as [TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>][]).forEach(
    ([K, F]) => {
      BASE_LOGIC_VERIFIER.set(K, F);
      LOGIC_VERIFIER_BASE.set(F, K);
    },
  );

  return {
    VK: V_K,
    KV: K_V,
    VF: BASE_LOGIC_VERIFIER,
    FV: LOGIC_VERIFIER_BASE,
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
