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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATOM_TRSFAC = __importStar(require("./atom_transaction"));
const core_helper_1 = require("@bfchain/core-helper");
const util_1 = require("@bfchain/util");
const core_model_1 = require("@bfchain/core-model");
const core_model_transaction_1 = require("@bfchain/core-model-transaction");
const protobuf_1 = require("@bfchain/protobuf");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const { ArgumentFormatException } = core_util_exception_1.CoreExceptionGenerator("CONTROLLER", "transaction");
let TransactionCore = class TransactionCore {
    constructor(transactionHelper, accountHelper, asymmetricHelper, keypairHelper, Buffer, config, moduleMap) {
        this.transactionHelper = transactionHelper;
        this.accountHelper = accountHelper;
        this.asymmetricHelper = asymmetricHelper;
        this.keypairHelper = keypairHelper;
        this.Buffer = Buffer;
        this.config = config;
        this.moduleMap = moduleMap;
        // #region txFactory
        /**各种交易工厂的实例缓存 */
        this._txFactoryCache = new Map();
        this.fromJSON = this.recombineTransaction;
    }
    /**获取交易工厂 */
    getTransactionFactory(TxFactory) {
        let transactionFactory = this._txFactoryCache.get(TxFactory);
        if (!transactionFactory) {
            transactionFactory = util_1.Resolve(TxFactory, this.moduleMap);
            this._txFactoryCache.set(TxFactory, transactionFactory);
        }
        return transactionFactory;
    }
    /**使用交易类型获取交易的工厂 */
    getTransactionFactoryFromType(type) {
        const { baseType } = this.transactionHelper.parseType(type);
        return this.getTransactionFactoryFromBaseType(baseType);
    }
    /**使用交易的基础类型获取交易的工厂 */
    getTransactionFactoryFromBaseType(base_type) {
        const TransactionFactory = exports.TRANSACTION_FACTORY_TYPES_MAP.VF.get(base_type);
        if (!TransactionFactory) {
            throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
        }
        return this.getTransactionFactory(TransactionFactory);
    }
    // #endregion
    // // #region txLogicVerifier
    // /**各种交易逻辑校验器的实例缓存 */
    // private _txLogicVerifierCache = new Map<
    //   BFChainCore.TransactionLogicVerifierConstructor<any>,
    //   TransactionLogicVerifier<any>
    // >();
    // /**获取交易逻辑校验器 */
    // getTransactionLogicVerifier<T extends Transaction>(
    //   LogicVerifier: BFChainCore.TransactionLogicVerifierConstructor<T>,
    // ) {
    //   let transactionLogicVerifier:
    //     | TransactionLogicVerifier<T>
    //     | undefined = this._txLogicVerifierCache.get(LogicVerifier);
    //   if (!transactionLogicVerifier) {
    //     transactionLogicVerifier = Resolve(LogicVerifier, this.moduleMap);
    //     this._txLogicVerifierCache.set(LogicVerifier, transactionLogicVerifier);
    //   }
    //   return transactionLogicVerifier;
    // }
    // /**使用交易类型获取交易的逻辑校验器 */
    // getTransactionLogicVerifierFromType<T extends Transaction>(type: string) {
    //   const { baseType } = this.transactionHelper.parseType(type);
    //   return this.getTransactionLogicVerifierFromBaseType<T>(baseType);
    // }
    // /**使用交易的基础类型获取交易的逻辑校验器 */
    // getTransactionLogicVerifierFromBaseType<T extends Transaction>(
    //   base_type: TRANSACTION_TYPES_BASE,
    // ) {
    //   const TransactionLogicVerifier = TRANSACTION_TYPES_MAP.VLV.get(base_type);
    //   if (!TransactionLogicVerifier) {
    //     throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    //   }
    //   return this.getTransactionLogicVerifier<T>(TransactionLogicVerifier);
    // }
    // // #endregion
    /**
     * 创建交易
     *
     * 校验主密码生成的密钥对是否完整
     * 如果需要二次签名，校验二次密码生成的密钥对是否完整
     * 校验用于生成交易的数据是否完整
     * 生成交易主体
     * 生成交易id
     * 校验生成的交易是否合法
     * 生成交易签名
     * 如果需要二次签名，生成二次签名
     *
     * @param TxFactory
     * @param body
     * @param asset
     * @param keypair
     * @param secondKeypair
     */
    createTransaction(TxFactory, body, asset, keypair, secondKeypair, config = this.config, pow) {
        const transactionFactory = this.getTransactionFactory(TxFactory);
        /// 校验主密码keypari与二次密码的keypair
        transactionFactory.verifyKeypair(keypair);
        if (secondKeypair) {
            transactionFactory.verifySecondKeypair(secondKeypair);
        }
        /// 校验生成交易的参数
        transactionFactory.verifyTransactionBody(body, asset, config);
        const txbody = {
            version: body.version,
            type: body.type || this.getTransactionTypeFromTransactionFactoryConstructor(TxFactory),
            senderId: body.senderId,
            senderPublicKey: body.senderPublicKey,
            senderSecondPublicKey: body.senderSecondPublicKey,
            recipientId: body.recipientId,
            rangeType: body.rangeType,
            range: body.range,
            timestamp: body.timestamp,
            fee: body.fee,
            remark: body.remark,
            dappid: body.dappid,
            lns: body.lns,
            sourceIP: body.sourceIP,
            fromMagic: body.fromMagic,
            toMagic: body.toMagic,
            applyBlockHeight: body.applyBlockHeight,
            numberOfEffectiveBlocks: body.numberOfEffectiveBlocks,
            storage: body.storage,
            nonce: body.nonce,
        };
        // 生成交易体
        const trs = transactionFactory.init(txbody, asset);
        // 校验交易的 remark
        this.transactionHelper.verifyTransactionRemarkSize(trs);
        // 生成交易签名
        trs.signatureBuffer = this.asymmetricHelper.detachedSign(trs.getBytes(true, true), keypair.secretKey);
        // 在异步中执行交易POW
        if (pow) {
            if (pow.calculator) {
                pow.calculator(trs, pow, keypair, secondKeypair);
            }
            else {
                // 放在异步执行
                this.transactionPowCalculator(trs, pow, keypair, secondKeypair);
            }
        }
        else {
            // 交易的 nonce 必须携带，默认为 0，并且加入签名
            trs.nonce = 0;
        }
        // 生成交易二次签名，支付密码只是为了安全，不应该影响到POW
        if (secondKeypair) {
            trs.signSignatureBuffer = this.asymmetricHelper.detachedSign(trs.getBytes(false, true), secondKeypair.secretKey);
        }
        return trs;
    }
    /**通用的交易POW计算器 */
    async transactionPowCalculator(trs, pow, keypair, secondKeypair) {
        const event = pow.event;
        const done = async (break_off) => {
            const eventName = break_off ? "error" : "done";
            if (!break_off) {
                if (secondKeypair) {
                    trs.signSignatureBuffer = this.asymmetricHelper.detachedSign(trs.getBytes(false, true), secondKeypair.secretKey);
                }
            }
            event && (await event.emit(eventName, { transaction: trs }));
            return trs;
        };
        let diff_BI;
        let is_break = false;
        /// 校验交易POW，如果POW校验不通过，强制开始生成交易
        if ((diff_BI = this.transactionHelper.calcDiffOfTransactionProfOfWork(pow.count, pow.participation))) {
            const res = event && (await event.emit("start", { diff: diff_BI.toString(), transaction: trs }));
            if (res && res.break) {
                is_break = res.break;
                return done(is_break);
            }
            for (const { uint8array: trsBytes, nonce } of this.transactionHelper.nonceWriter(trs)) {
                const signatureBuffer = this.asymmetricHelper.detachedSign(trsBytes, keypair.secretKey);
                const checked = this.transactionHelper.checkTransactionProfOfWork(signatureBuffer, pow.count, pow.participation, diff_BI);
                const res = event && (await event.emit("work", { nonce, transaction: trs }));
                if (res && res.break) {
                    trs.nonce = nonce;
                    trs.signatureBuffer = signatureBuffer;
                    is_break = res.break;
                    break;
                }
                if (checked) {
                    trs.nonce = nonce;
                    {
                        const trs_hex = this.Buffer.from(trs.getBytes(true, true)).toString("hex");
                        const bytes_hex = this.Buffer.from(trsBytes).toString("hex");
                        if (trs_hex !== bytes_hex) {
                            debugger;
                            console.error("nonceWriter bytes error, nonce:", nonce);
                            console.error("trs_hex:\t\t", trs_hex);
                            console.error("bytes_hex:\t\t", bytes_hex);
                        }
                    }
                    trs.signatureBuffer = signatureBuffer;
                    break;
                }
            }
        }
        return done(is_break);
    }
    /**
     * transactionJson => transactionModel
     *
     * @param trs
     */
    recombineTransaction(trs) {
        return this.getTransactionFactoryFromType(trs.type).fromJSON(trs);
    }
    recombineTransactionInBlock(trsInBlock) {
        const transactionInBlock = core_model_transaction_1.TransactionInBlock.fromObject(trsInBlock);
        return transactionInBlock;
    }
    /**将二进制解析成交易 */
    parseBytesToTransaction(bytes) {
        return core_model_1.Transaction.decode(bytes);
    }
    /**将二进制解析成完整交易 */
    parseBytesToSomeTransaction(bytes) {
        const reader = new protobuf_1.Reader(bytes);
        reader.uint32(); // 读取version的头部
        reader.uint32(); // 读取version的值
        reader.uint32(); // 读取type的头部
        const type = reader.string();
        const TransactionFactory = this.getTransactionModelConstructorFromType(type);
        return TransactionFactory.decode(bytes);
    }
    /**使用交易类型获取交易构造函数 */
    getTransactionModelConstructorFromType(type) {
        const { baseType } = this.transactionHelper.parseType(type);
        return this.getTransactionModelConstructorFromBaseType(baseType);
    }
    /**使用交易的基础类型获取交易的构造函数 */
    getTransactionModelConstructorFromBaseType(base_type) {
        const TransactionModelConstructor = core_model_transaction_1.TRANSACTION_TYPES_MAP.VM.get(base_type);
        if (!TransactionModelConstructor) {
            throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
        }
        return TransactionModelConstructor;
    }
    /**根据构造函数获取交易类型 */
    getTransactionTypeFromTransactionFactoryConstructor(TxFactory) {
        const trs_base = exports.TRANSACTION_FACTORY_TYPES_MAP.FV.get(TxFactory);
        if (!trs_base) {
            throw new ArgumentFormatException(`Unregistered TransactionFactory: ${TxFactory.name}`);
        }
        const trs_key = exports.TRANSACTION_FACTORY_TYPES_MAP.VK.get(trs_base);
        if (!trs_key) {
            throw new ArgumentFormatException(`Unregistered Transaction base type: ${trs_base}`);
        }
        const trs_type = this.transactionHelper[trs_key];
        if (!trs_type) {
            throw new ArgumentFormatException(`Unregistered Transaction type: ${trs_key}`);
        }
        return trs_type;
    }
};
TransactionCore = __decorate([
    util_1.Injectable("bfchain-core:TransactionCore"),
    __param(3, util_1.Inject("keypairHelper")),
    __param(4, util_1.Inject("Buffer")),
    __metadata("design:paramtypes", [core_helper_1.TransactionHelper,
        core_helper_1.AccountBaseHelper,
        core_helper_1.AsymmetricHelper, Object, Object, core_helper_1.ConfigHelper,
        util_1.ModuleStroge])
], TransactionCore);
exports.TransactionCore = TransactionCore;
/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * F : TransactionFactoryConstructror
 */
exports.TRANSACTION_FACTORY_TYPES_MAP = (() => {
    const V_K = new Map();
    const K_V = new Map();
    for (let tran_key in core_model_transaction_1.TRANSACTION_TYPES_BASE) {
        const val = core_model_transaction_1.TRANSACTION_TYPES_BASE[tran_key];
        K_V.set(tran_key, val);
        V_K.set(val, tran_key);
    }
    const BASE_FACTORY = new Map();
    const FACTORY_BASE = new Map();
    [
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.USERNAME, ATOM_TRSFAC.UsernameTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRSFAC.SignatureTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DELEGATE, ATOM_TRSFAC.DelegateTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.VOTE, ATOM_TRSFAC.VoteTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.ACCEPT_VOTE, ATOM_TRSFAC.AcceptVoteTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.REJECT_VOTE, ATOM_TRSFAC.RejectVoteTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.CUSTOM, ATOM_TRSFAC.CustomTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DAPP, ATOM_TRSFAC.DAppTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRSFAC.DAppPurchasingTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.MARK, ATOM_TRSFAC.MarkTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.ISSUE_ASSET, ATOM_TRSFAC.IssueAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.DESTORY_ASSET, ATOM_TRSFAC.DestoryAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.TRANSFER_ASSET, ATOM_TRSFAC.TransferAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ATOM_TRSFAC.ToExchangeAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, ATOM_TRSFAC.BeExchangeAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.GIFT_ASSET, ATOM_TRSFAC.GiftAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.GRAB_ASSET, ATOM_TRSFAC.GrabAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.TRUST_ASSET, ATOM_TRSFAC.TrustAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, ATOM_TRSFAC.SignForAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, ATOM_TRSFAC.EmigrateAssetTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ATOM_TRSFAC.ImmigrateAssetTransactionFactory],
        [
            core_model_transaction_1.TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET,
            ATOM_TRSFAC.ToExchangeSpecialAssetTransactionFactory,
        ],
        [
            core_model_transaction_1.TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET,
            ATOM_TRSFAC.BeExchangeSpecialAssetTransactionFactory,
        ],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRSFAC.LocationNameTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, ATOM_TRSFAC.SetLnsRecordValueTransactionFactory],
        [core_model_transaction_1.TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRSFAC.SetLnsManagerTransactionFactory],
    ].forEach(([K, F]) => {
        BASE_FACTORY.set(K, F);
        FACTORY_BASE.set(F, K);
    });
    return {
        VK: V_K,
        KV: K_V,
        VF: BASE_FACTORY,
        FV: FACTORY_BASE,
        trsTypeToV(type) {
            const CHAIN_NAME_index = type.indexOf("-", 
            /**ASSETTYPE_index */
            type.indexOf("-") + 1);
            return type.substr(CHAIN_NAME_index + 1);
        },
    };
})();
//# sourceMappingURL=transaction.js.map