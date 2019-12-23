"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var SomeTransactionModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const ATOM_TRS = __importStar(require("./atom_transaction"));
const core_helper_exception_1 = require("@bfchain/util-helper-exception");
const protobuf_1 = require("@bfchain/protobuf");
const { ArgumentFormatException } = core_helper_exception_1.CoreExceptionGenerator("MODEL", "transactionModel");
var TRANSACTION_TYPES_BASE;
(function (TRANSACTION_TYPES_BASE) {
    TRANSACTION_TYPES_BASE["SIGNATURE"] = "BSE-01";
    TRANSACTION_TYPES_BASE["DELEGATE"] = "BSE-02";
    TRANSACTION_TYPES_BASE["VOTE"] = "BSE-03";
    TRANSACTION_TYPES_BASE["USERNAME"] = "BSE-04";
    TRANSACTION_TYPES_BASE["ACCEPT_VOTE"] = "BSE-05";
    TRANSACTION_TYPES_BASE["REJECT_VOTE"] = "BSE-06";
    TRANSACTION_TYPES_BASE["DAPP"] = "WOD-00";
    TRANSACTION_TYPES_BASE["DAPP_PURCHASING"] = "WOD-01";
    TRANSACTION_TYPES_BASE["ISSUE_SUBCHAIN"] = "WOD-02";
    TRANSACTION_TYPES_BASE["MARK"] = "EXT-00";
    TRANSACTION_TYPES_BASE["ISSUE_ASSET"] = "AST-00";
    TRANSACTION_TYPES_BASE["TRANSFER_ASSET"] = "AST-01";
    TRANSACTION_TYPES_BASE["DESTORY_ASSET"] = "AST-02";
    TRANSACTION_TYPES_BASE["GIFT_ASSET"] = "AST-03";
    TRANSACTION_TYPES_BASE["GRAB_ASSET"] = "AST-04";
    TRANSACTION_TYPES_BASE["TRUST_ASSET"] = "AST-05";
    TRANSACTION_TYPES_BASE["SIGN_FOR_ASSET"] = "AST-06";
    TRANSACTION_TYPES_BASE["EMIGRATE_ASSET"] = "AST-07";
    TRANSACTION_TYPES_BASE["IMMIGRATE_ASSET"] = "AST-08";
    TRANSACTION_TYPES_BASE["TO_EXCHANGE_ASSET"] = "AST-09";
    TRANSACTION_TYPES_BASE["BE_EXCHANGE_ASSET"] = "AST-10";
    TRANSACTION_TYPES_BASE["TO_EXCHANGE_SPECIAL_ASSET"] = "AST-11";
    TRANSACTION_TYPES_BASE["BE_EXCHANGE_SPECIAL_ASSET"] = "AST-12";
    TRANSACTION_TYPES_BASE["LOCATION_NAME"] = "LNS-00";
    TRANSACTION_TYPES_BASE["SET_LNS_RECORD_VALUE"] = "LNS-01";
    TRANSACTION_TYPES_BASE["SET_LNS_MANAGER"] = "LNS-02";
    TRANSACTION_TYPES_BASE["CUSTOM"] = "CUS-00";
})(TRANSACTION_TYPES_BASE = exports.TRANSACTION_TYPES_BASE || (exports.TRANSACTION_TYPES_BASE = {}));
/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * M : TransactionModelConstructror
 * F : TransactionFactoryConstructror
 */
exports.TRANSACTION_TYPES_MAP = (() => {
    const V_K = new Map();
    const K_V = new Map();
    for (let tran_key in TRANSACTION_TYPES_BASE) {
        const val = TRANSACTION_TYPES_BASE[tran_key];
        K_V.set(tran_key, val);
        V_K.set(val, tran_key);
    }
    const BASE_MODEL = new Map();
    const MODEL_BASE = new Map();
    [
        [TRANSACTION_TYPES_BASE.USERNAME, ATOM_TRS.UsernameTransaction],
        [TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRS.SignatureTransaction],
        [TRANSACTION_TYPES_BASE.DELEGATE, ATOM_TRS.DelegateTransaction],
        [TRANSACTION_TYPES_BASE.VOTE, ATOM_TRS.VoteTransaction],
        [TRANSACTION_TYPES_BASE.ACCEPT_VOTE, ATOM_TRS.AcceptVoteTransaction],
        [TRANSACTION_TYPES_BASE.REJECT_VOTE, ATOM_TRS.RejectVoteTransaction],
        [TRANSACTION_TYPES_BASE.CUSTOM, ATOM_TRS.CustomTransaction],
        [TRANSACTION_TYPES_BASE.DAPP, ATOM_TRS.DAppTransaction],
        [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRS.DAppPurchasingTransaction],
        [TRANSACTION_TYPES_BASE.MARK, ATOM_TRS.MarkTransaction],
        // [TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, ATOM_TRS.IssueSubchainTransaction],
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
        [TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET, ATOM_TRS.ToExchangeSpecialAssetTransaction],
        [TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET, ATOM_TRS.BeExchangeSpecialAssetTransaction],
        [TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRS.LocationNameTransaction],
        [TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, ATOM_TRS.SetLnsRecordValueTransaction],
        [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRS.SetLnsManagerTransaction],
    ].forEach(([K, M]) => {
        BASE_MODEL.set(K, M);
        MODEL_BASE.set(M, K);
    });
    return {
        VK: V_K,
        KV: K_V,
        VM: BASE_MODEL,
        MV: MODEL_BASE,
        // VF: new Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionFactoryConstructor<any>>(),
        // FV: new Map<BFChainCore.TransactionFactoryConstructor<any>, TRANSACTION_TYPES_BASE>(),
        // VLV: new Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>>(),
        // LVV: new Map<BFChainCore.TransactionLogicVerifierConstructor<any>, TRANSACTION_TYPES_BASE>(),
        trsTypeToV(type) {
            const CHAIN_NAME_index = type.indexOf("-", 
            /**ASSETTYPE_index */
            type.indexOf("-") + 1);
            return type.substr(CHAIN_NAME_index + 1);
        },
    };
})();
const TRS_BYTE_WM = new WeakMap();
let SomeTransactionModel = SomeTransactionModel_1 = class SomeTransactionModel extends protobuf_1.Message {
    get transaction() {
        let trs = TRS_BYTE_WM.get(this._trs_bytes);
        if (!trs) {
            const Model = exports.TRANSACTION_TYPES_MAP.VM.get(this._trs_base_type);
            if (!Model) {
                throw new ArgumentFormatException(core_helper_exception_1.INVALID_TRANSACTION_BASE_TYPE, {
                    base_type: this._trs_base_type,
                });
            }
            trs = Model.decode(this._trs_bytes);
            // 冻结交易与二进制之间的联系
            TRS_BYTE_WM.set(this._trs_bytes, Object.freeze(trs));
        }
        return trs;
    }
    set transaction(trs) {
        const base_type = exports.TRANSACTION_TYPES_MAP.trsTypeToV(trs.type);
        if (!exports.TRANSACTION_TYPES_MAP.VK.has(base_type)) {
            throw new ArgumentFormatException(core_helper_exception_1.INVALID_TRANSACTION_BASE_TYPE, { base_type });
        }
        if (Object.isFrozen(this)) {
            debugger;
        }
        this._trs_base_type = base_type;
        this._trs_bytes = new Uint8Array(trs.constructor.encode(trs).finish());
        // 如果时冻结的对象，那么建立交易与二进制之间的联系
        if (Object.isFrozen(trs)) {
            TRS_BYTE_WM.set(this._trs_bytes, trs);
        }
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (object !== res) {
            const obj_transaction = object.transaction;
            if (obj_transaction) {
                if (!(obj_transaction instanceof protobuf_1.Message)) {
                    const type = obj_transaction.type;
                    if (type) {
                        const base_type = exports.TRANSACTION_TYPES_MAP.trsTypeToV(type);
                        const ModelCtor = exports.TRANSACTION_TYPES_MAP.VM.get(base_type);
                        if (!ModelCtor) {
                            throw new ArgumentFormatException(core_helper_exception_1.INVALID_TRANSACTION_BASE_TYPE, {
                                type_base: base_type,
                            });
                        }
                        res.transaction = ModelCtor.fromObject(obj_transaction);
                    }
                }
                else {
                    res.transaction = obj_transaction;
                }
            }
        }
        return res;
    }
    toJSON() {
        return {
            transaction: this.transaction.toJSON(),
        };
    }
};
SomeTransactionModel.INC = 1;
__decorate([
    protobuf_1.Field.d(SomeTransactionModel_1.INC++, "string"),
    __metadata("design:type", String)
], SomeTransactionModel.prototype, "_trs_base_type", void 0);
__decorate([
    protobuf_1.Field.d(SomeTransactionModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], SomeTransactionModel.prototype, "_trs_bytes", void 0);
SomeTransactionModel = SomeTransactionModel_1 = __decorate([
    protobuf_1.Type.d("SomeTransactionModel")
], SomeTransactionModel);
exports.SomeTransactionModel = SomeTransactionModel;
//# sourceMappingURL=someTransaction.js.map