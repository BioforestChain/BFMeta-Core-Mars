"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATOM_TRSLGCVFR = __importStar(require("./atom_transactionLogicVerifier"));
const core_model_transaction_1 = require("@bfchain/core-model-transaction");
/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * F : LogicVerifierConstructror
 */
exports.TLogicVerifier_TYPES_MAP = (() => {
    const V_K = new Map();
    const K_V = new Map();
    for (let tran_key in core_model_transaction_1.TRANSACTION_TYPES_BASE) {
        const val = core_model_transaction_1.TRANSACTION_TYPES_BASE[tran_key];
        K_V.set(tran_key, val);
        V_K.set(val, tran_key);
    }
    const BASE_LOGIC_VERIFIER = new Map();
    const LOGIC_VERIFIER_BASE = new Map();
    [
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.USERNAME, ATOM_TRSLGCVFR.UsernameLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRSLGCVFR.SignatureLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DELEGATE, ATOM_TRSLGCVFR.DelegateLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.VOTE, ATOM_TRSLGCVFR.VoteLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.ACCEPT_VOTE, ATOM_TRSLGCVFR.AcceptVoteLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.REJECT_VOTE, ATOM_TRSLGCVFR.RejectVoteLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.CUSTOM, ATOM_TRSLGCVFR.CustomLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DAPP, ATOM_TRSLGCVFR.DAppLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRSLGCVFR.DAppPurchasingLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.MARK, ATOM_TRSLGCVFR.MarkLogicVerifier],
        // [TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, ATOM_TRS.IssueSubchainTransaction],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.ISSUE_ASSET, ATOM_TRSLGCVFR.IssueAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DESTORY_ASSET, ATOM_TRSLGCVFR.DestoryAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.TRANSFER_ASSET, ATOM_TRSLGCVFR.TransferAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ATOM_TRSLGCVFR.ToExchangeAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, ATOM_TRSLGCVFR.BeExchangeAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.GIFT_ASSET, ATOM_TRSLGCVFR.GiftAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.GRAB_ASSET, ATOM_TRSLGCVFR.GrabAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.TRUST_ASSET, ATOM_TRSLGCVFR.TrustAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, ATOM_TRSLGCVFR.SignForAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, ATOM_TRSLGCVFR.EmigrateAssetLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ATOM_TRSLGCVFR.ImmigrateAssetLogicVerifier],
        [
            core_model_transaction_1.TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET,
            ATOM_TRSLGCVFR.ToExchangeSpecialAssetLogicVerifier,
        ],
        [
            core_model_transaction_1.TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET,
            ATOM_TRSLGCVFR.BeExchangeSpecialAssetLogicVerifier,
        ],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRSLGCVFR.LocationNameLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, ATOM_TRSLGCVFR.SetLnsRecordValueLogicVerifier],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRSLGCVFR.SetLnsManagerLogicVerifier],
    ].forEach(([K, F]) => {
        BASE_LOGIC_VERIFIER.set(K, F);
        LOGIC_VERIFIER_BASE.set(F, K);
    });
    return {
        VK: V_K,
        KV: K_V,
        VF: BASE_LOGIC_VERIFIER,
        FV: LOGIC_VERIFIER_BASE,
        trsTypeToV(type) {
            const CHAIN_NAME_index = type.indexOf("-", 
            /**ASSETTYPE_index */
            type.indexOf("-") + 1);
            return type.substr(CHAIN_NAME_index + 1);
        },
    };
})();
//# sourceMappingURL=transactionLogicVerifier.js.map