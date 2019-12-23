import {
  BlockHelper,
  AccountBaseHelper,
  ConfigHelper,
  TransactionHelper,
  AsymmetricHelper,
} from "@bfchain/core-helper";
import { Injectable, Inject, ModuleStroge, Resolve } from "@bfchain/util";
import { Transaction } from "../model/transaction";
import { TransactionFactory } from "./transaction/_txbase";
import { TransactionLogicVerifier } from "./transactionLogicVerifier/_txbaseLogicVerifier";
import { Reader } from "@bfchain/protobuf";
import { CoreExceptionGenerator } from "../../helper/src/exception";

const { ArgumentFormatException } = CoreExceptionGenerator("CONTROLLER", "transaction");

@Injectable("bfchain-core:TransactionCore")
export class TransactionCore {
  constructor(
    public transactionHelper: TransactionHelper,
    public accountHelper: AccountBaseHelper,
    public blockHelper: BlockHelper,
    public asymmetricHelper: AsymmetricHelper,
    @Inject("keypairHelper")
    public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
    public config: ConfigHelper,
    public moduleMap: ModuleStroge,
  ) {}
  // #region txFactory
  /**各种交易工厂的实例缓存 */
  private _txFactoryCache = new Map<
    BFChainCore.TransactionFactoryConstructor<any>,
    TransactionFactory<any>
  >();
  /**获取交易工厂 */
  getTransactionFactory<T extends Transaction>(
    TxFactory: BFChainCore.TransactionFactoryConstructor<T>,
  ) {
    let transactionFactory: TransactionFactory<T> | undefined = this._txFactoryCache.get(TxFactory);
    if (!transactionFactory) {
      transactionFactory = Resolve(TxFactory, this.moduleMap);
      this._txFactoryCache.set(TxFactory, transactionFactory);
    }
    return transactionFactory;
  }
  /**使用交易类型获取交易的工厂 */
  getTransactionFactoryFromType<T extends Transaction>(type: string) {
    const { baseType } = this.transactionHelper.parseType(type);
    return this.getTransactionFactoryFromBaseType<T>(baseType);
  }

  /**使用交易的基础类型获取交易的工厂 */
  getTransactionFactoryFromBaseType<T extends Transaction>(base_type: TRANSACTION_TYPES_BASE) {
    const TransactionFactory = TRANSACTION_TYPES_MAP.VF.get(base_type);
    if (!TransactionFactory) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getTransactionFactory<T>(TransactionFactory);
  }
  // #endregion

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
    let transactionLogicVerifier:
      | TransactionLogicVerifier<T>
      | undefined = this._txLogicVerifierCache.get(LogicVerifier);
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
    const TransactionLogicVerifier = TRANSACTION_TYPES_MAP.VLV.get(base_type);
    if (!TransactionLogicVerifier) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return this.getTransactionLogicVerifier<T>(TransactionLogicVerifier);
  }
  // #endregion

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
  createTransaction<T extends Transaction>(
    TxFactory: BFChainCore.TransactionFactoryConstructor<T>,
    body: BFChainCore.TxBodyJSON,
    asset: BFChainCore.GetTransactionAssetJSON<T>,
    keypair: BFChainCore.Keypair,
    secondKeypair?: BFChainCore.Keypair,
    config = this.config,
    pow?: BFChainCore.TransactonPoWOptions<T>,
  ) {
    const transactionFactory = this.getTransactionFactory(TxFactory);

    /// 校验主密码keypari与二次密码的keypair
    transactionFactory.verifyKeypair(keypair);
    if (secondKeypair) {
      transactionFactory.verifySecondKeypair(secondKeypair);
    }
    /// 校验生成交易的参数
    transactionFactory.verifyTransactionBody(body, asset, config);
    const txbody: BFChainCore.TxBodyJSON = {
      version: body.version,
      type: body.type || this.getTransactionTypeFromTransactionFactoryConstructor(TxFactory), // 交易类型
      senderId: body.senderId, // 发起者地址
      senderPublicKey: body.senderPublicKey, // 发起者公钥
      senderSecondPublicKey: body.senderSecondPublicKey, // 发起者二次公钥
      recipientId: body.recipientId,
      rangeType: body.rangeType, // 接收类型
      range: body.range, // 接收人地址,必须赋值
      timestamp: body.timestamp, // 生成交易时间戳
      fee: body.fee, // 交易手续费
      remark: body.remark, // 交易备注，任意信息
      dappid: body.dappid, // 交易所属的 dappid
      lns: body.lns, // 交易所属的 域
      sourceIP: body.sourceIP, // 交易来源 ip
      fromMagic: body.fromMagic, // 交易来源链的 magic
      toMagic: body.toMagic, // 交易去往链的 magic
      applyBlockHeight: body.applyBlockHeight, // 交易发起高度
      numberOfEffectiveBlocks: body.numberOfEffectiveBlocks, // 有效区块数量
      storage: body.storage, // 查询用的索引存储
      nonce: body.nonce,
    };
    // 生成交易体
    const trs: T = transactionFactory.init(txbody, asset);
    // 校验交易的 remark
    this.transactionHelper.verifyTransactionRemarkSize(trs);
    // 生成交易签名
    trs.signatureBuffer = this.asymmetricHelper.detachedSign(
      trs.getBytes(true, true),
      keypair.secretKey,
    );

    // 在异步中执行交易POW
    if (pow) {
      if (pow.calculator) {
        pow.calculator(trs, pow, keypair, secondKeypair);
      } else {
        // 放在异步执行
        this.transactionPowCalculator(trs, pow, keypair, secondKeypair);
      }
    } else {
      // 交易的 nonce 必须携带，默认为 0，并且加入签名
      trs.nonce = 0;
    }

    // 生成交易二次签名，支付密码只是为了安全，不应该影响到POW
    if (secondKeypair) {
      trs.signSignatureBuffer = this.asymmetricHelper.detachedSign(
        trs.getBytes(false, true),
        secondKeypair.secretKey,
      );
    }

    return trs;
  }
  /**通用的交易POW计算器 */
  async transactionPowCalculator<T extends Transaction>(
    trs: T,
    pow: BFChainCore.TransactonPoWOptions,
    keypair: BFChainCore.Keypair,
    secondKeypair?: BFChainCore.Keypair,
  ) {
    const event = pow.event;
    const done = async (break_off: boolean) => {
      const eventName = break_off ? "error" : "done";
      if (!break_off) {
        if (secondKeypair) {
          trs.signSignatureBuffer = this.asymmetricHelper.detachedSign(
            trs.getBytes(false, true),
            secondKeypair.secretKey,
          );
        }
      }
      event && (await event.emit(eventName, { transaction: trs }));
      return trs;
    };
    let diff_BI: bigint | undefined;
    let is_break = false;
    /// 校验交易POW，如果POW校验不通过，强制开始生成交易
    if (
      (diff_BI = this.transactionHelper.calcDiffOfTransactionProfOfWork(
        pow.count,
        pow.participation,
      ))
    ) {
      const res =
        event && (await event.emit("start", { diff: diff_BI.toString(), transaction: trs }));
      if (res && res.break) {
        is_break = res.break;
        return done(is_break);
      }
      for (const { uint8array: trsBytes, nonce } of this.transactionHelper.nonceWriter(trs)) {
        const signatureBuffer = this.asymmetricHelper.detachedSign(trsBytes, keypair.secretKey);
        const checked = this.transactionHelper.checkTransactionProfOfWork(
          signatureBuffer,
          pow.count,
          pow.participation,
          diff_BI,
        );
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
  recombineTransaction<T extends Transaction>(
    trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>,
  ) {
    return this.getTransactionFactoryFromType(trs.type).fromJSON(trs) as T;
  }
  fromJSON = this.recombineTransaction;
  recombineTransactionInBlock<T extends BFChainCore.TransactionInBlock>(
    trsInBlock: BFChainCore.TransactionInBlockJSON<BFChainCore.TransactionJSON<any>>,
  ) {
    const transactionInBlock = TransactionInBlock.fromObject(trsInBlock) as T;
    return transactionInBlock;
  }

  /**将二进制解析成交易 */
  parseBytesToTransaction(bytes: Uint8Array) {
    return Transaction.decode(bytes);
  }

  /**将二进制解析成完整交易 */
  parseBytesToSomeTransaction<T extends BFChainCore.Transaction = BFChainCore.Transaction>(
    bytes: Uint8Array,
  ) {
    const reader = new Reader(bytes);
    reader.uint32(); // 读取version的头部
    reader.uint32(); // 读取version的值
    reader.uint32(); // 读取type的头部
    const type = reader.string();
    const TransactionFactory = this.getTransactionModelConstructorFromType(type);
    return TransactionFactory.decode(bytes) as T;
  }

  /**使用交易类型获取交易构造函数 */
  getTransactionModelConstructorFromType(type: string) {
    const { baseType } = this.transactionHelper.parseType(type);
    return this.getTransactionModelConstructorFromBaseType(baseType);
  }

  /**使用交易的基础类型获取交易的构造函数 */
  getTransactionModelConstructorFromBaseType(base_type: TRANSACTION_TYPES_BASE) {
    const TransactionModelConstructor = TRANSACTION_TYPES_MAP.VM.get(base_type);
    if (!TransactionModelConstructor) {
      throw new ArgumentFormatException(`Invalid base type: ${base_type}`);
    }
    return TransactionModelConstructor;
  }
  /**根据构造函数获取交易类型 */
  getTransactionTypeFromTransactionFactoryConstructor(
    TxFactory: BFChainCore.TransactionFactoryConstructor<any>,
  ) {
    const trs_base = TRANSACTION_TYPES_MAP.FV.get(TxFactory);
    if (!trs_base) {
      throw new ArgumentFormatException(`Unregistered TransactionFactory: ${TxFactory.name}`);
    }
    const trs_key = TRANSACTION_TYPES_MAP.VK.get(trs_base);
    if (!trs_key) {
      throw new ArgumentFormatException(`Unregistered Transaction base type: ${trs_base}`);
    }
    const trs_type = (this.transactionHelper as any)[trs_key] as string;
    if (!trs_type) {
      throw new ArgumentFormatException(`Unregistered Transaction type: ${trs_key}`);
    }
    return trs_type;
  }
}

// TRAN_BASE_TYPE_FACTORY.set(TRANSACTION_TYPES_BASE.TRANSFER, TransferTransaction)
import {
  UsernameTransactionFactory,
  SignatureTransactionFactory,
  DelegateTransactionFactory,
  VoteTransactionFactory,
  AcceptVoteTransactionFactory,
  RejectVoteTransactionFactory,
  DAppTransactionFactory,
  DAppPurchasingTransactionFactory,
  MarkTransactionFactory,
  IssueSubchainTransactionFactory,
  IssueAssetTransactionFactory,
  TransferAssetTransactionFactory,
  DestoryAssetTransactionFactory,
  ToExchangeAssetTransactionFactory,
  BeExchangeAssetTransactionFactory,
  GiftAssetTransactionFactory,
  GrabAssetTransactionFactory,
  TrustAssetTransactionFactory,
  SignForAssetTransactionFactory,
  EmigrateAssetTransactionFactory,
  ImmigrateAssetTransactionFactory,
  ToExchangeSpecialAssetTransactionFactory,
  BeExchangeSpecialAssetTransactionFactory,
  LocationNameTransactionFactory,
  SetLnsManagerTransactionFactory,
  SetLnsRecordValueTransactionFactory,
  CustomTransactionFactory,
} from "./transaction/index";
import {
  TransactionInBlock,
  TRANSACTION_TYPES_BASE,
  TRANSACTION_TYPES_MAP,
} from "../model/transactionModel";

([
  [TRANSACTION_TYPES_BASE.USERNAME, UsernameTransactionFactory],
  [TRANSACTION_TYPES_BASE.SIGNATURE, SignatureTransactionFactory],
  [TRANSACTION_TYPES_BASE.DELEGATE, DelegateTransactionFactory],
  [TRANSACTION_TYPES_BASE.VOTE, VoteTransactionFactory],
  [TRANSACTION_TYPES_BASE.ACCEPT_VOTE, AcceptVoteTransactionFactory],
  [TRANSACTION_TYPES_BASE.REJECT_VOTE, RejectVoteTransactionFactory],
  [TRANSACTION_TYPES_BASE.DAPP, DAppTransactionFactory],
  [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, DAppPurchasingTransactionFactory],
  [TRANSACTION_TYPES_BASE.MARK, MarkTransactionFactory],
  [TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, IssueSubchainTransactionFactory],
  [TRANSACTION_TYPES_BASE.ISSUE_ASSET, IssueAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.TRANSFER_ASSET, TransferAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.DESTORY_ASSET, DestoryAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ToExchangeAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, BeExchangeAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.GIFT_ASSET, GiftAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.GRAB_ASSET, GrabAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.TRUST_ASSET, TrustAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, SignForAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, EmigrateAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ImmigrateAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET, ToExchangeSpecialAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET, BeExchangeSpecialAssetTransactionFactory],
  [TRANSACTION_TYPES_BASE.LOCATION_NAME, LocationNameTransactionFactory],
  [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, SetLnsManagerTransactionFactory],
  [TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, SetLnsRecordValueTransactionFactory],
  [TRANSACTION_TYPES_BASE.CUSTOM, CustomTransactionFactory],
] as [TRANSACTION_TYPES_BASE, BFChainCore.TransactionFactoryConstructor<any>][]).forEach(
  ([K, F]) => {
    TRANSACTION_TYPES_MAP.VF.set(K, F);
    TRANSACTION_TYPES_MAP.FV.set(F, K);
  },
);

import {
  UsernameLogicVerifier,
  SignatureLogicVerifier,
  DelegateLogicVerifier,
  AcceptVoteLogicVerifier,
  RejectVoteLogicVerifier,
  VoteLogicVerifier,
  DAppLogicVerifier,
  DAppPurchasingLogicVerifier,
  MarkLogicVerifier,
  IssueAssetLogicVerifier,
  TransferAssetLogicVerifier,
  DestoryAssetLogicVerifier,
  GiftAssetLogicVerifier,
  GrabAssetLogicVerifier,
  TrustAssetLogicVerifier,
  SignForAssetLogicVerifier,
  ToExchangeAssetLogicVerifier,
  BeExchangeAssetLogicVerifier,
  ToExchangeSpecialAssetLogicVerifier,
  BeExchangeSpecialAssetLogicVerifier,
  EmigrateAssetLogicVerifier,
  ImmigrateAssetLogicVerifier,
  LocationNameLogicVerifier,
  SetLnsManagerLogicVerifier,
  SetLnsRecordValueLogicVerifier,
  IssueSubchainLogicVerifier,
  CustomLogicVerifier,
} from "./transactionLogicVerifier";
([
  [TRANSACTION_TYPES_BASE.USERNAME, UsernameLogicVerifier],
  [TRANSACTION_TYPES_BASE.SIGNATURE, SignatureLogicVerifier],
  [TRANSACTION_TYPES_BASE.DELEGATE, DelegateLogicVerifier],
  [TRANSACTION_TYPES_BASE.VOTE, VoteLogicVerifier],
  [TRANSACTION_TYPES_BASE.ACCEPT_VOTE, AcceptVoteLogicVerifier],
  [TRANSACTION_TYPES_BASE.REJECT_VOTE, RejectVoteLogicVerifier],
  [TRANSACTION_TYPES_BASE.DAPP, DAppLogicVerifier],
  [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, DAppPurchasingLogicVerifier],
  [TRANSACTION_TYPES_BASE.MARK, MarkLogicVerifier],
  [TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, IssueSubchainLogicVerifier],
  [TRANSACTION_TYPES_BASE.ISSUE_ASSET, IssueAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.TRANSFER_ASSET, TransferAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.DESTORY_ASSET, DestoryAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ToExchangeAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, BeExchangeAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.GIFT_ASSET, GiftAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.GRAB_ASSET, GrabAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.TRUST_ASSET, TrustAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, SignForAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, EmigrateAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ImmigrateAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET, ToExchangeSpecialAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET, BeExchangeSpecialAssetLogicVerifier],
  [TRANSACTION_TYPES_BASE.LOCATION_NAME, LocationNameLogicVerifier],
  [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, SetLnsManagerLogicVerifier],
  [TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE, SetLnsRecordValueLogicVerifier],
  [TRANSACTION_TYPES_BASE.CUSTOM, CustomLogicVerifier],
  // [TRANSACTION_TYPES_BASE.CUSTOM, CustomTransactionFactory],
] as [TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>][]).forEach(
  ([K, F]) => {
    TRANSACTION_TYPES_MAP.VLV.set(K, F);
    TRANSACTION_TYPES_MAP.LVV.set(F, K);
  },
);
