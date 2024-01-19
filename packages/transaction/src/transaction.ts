import * as ATOM_TRSFAC from "./atom_transaction";
import {
  AccountBaseHelper,
  ConfigHelper,
  TransactionHelper,
  AsymmetricHelper,
} from "@bfchain/core-helper";
import { Injectable, Inject, ModuleStroge, Resolve } from "@bfchain/util";
import { Transaction } from "@bfchain/core-model";
import type { TransactionFactory } from "./atom_transaction/_txbase";
import {
  TransactionInBlock,
  TRANSACTION_TYPES_BASE,
  TRANSACTION_TYPES_MAP,
} from "@bfchain/core-model-transaction";
import { Reader } from "@bfchain/protobuf";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ArgumentFormatException, OutOfRangeException, ConsensusException, warn } =
  CoreExceptionGenerator("CONTROLLER", "transaction");

@Injectable("bfchain-core:TransactionCore")
export class TransactionCore {
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
    const TransactionFactory = TRANSACTION_FACTORY_TYPES_MAP.VF.get(base_type);
    if (!TransactionFactory) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_BASE_TYPE, { base_type });
    }
    return this.getTransactionFactory<T>(TransactionFactory);
  }
  // #endregion
  /**
   * 检查交易是否可以被创建
   * @param type
   */
  canCreateTransaction(type: string) {
    return this.transactionHelper.isTransactionInFilter(type);
  }

  /**
   * 在遇到被禁止的交易是，是否要中断
   */
  get abortForbiddenTransaction() {
    return this.transactionHelper.abortForbiddenTransaction;
  }

  async createTransactionWithoutSignature<T extends Transaction>(
    TxFactory: BFChainCore.TransactionFactoryConstructor<T>,
    body: BFChainCore.TxBodyJSON,
    asset: BFChainCore.GetTransactionAssetJSON<T>,
    config = this.config,
  ) {
    const trsType =
      body.type || this.getTransactionTypeFromTransactionFactoryConstructor(TxFactory);
    if (!this.canCreateTransaction(trsType)) {
      const trsName = TRANSACTION_TYPES_MAP.VK.get(TRANSACTION_TYPES_MAP.trsTypeToV(trsType));
      const exp = new ConsensusException(ERROR_LIST.DISABLED_CREATE_TRANSACTION, { trsName });
      if (this.abortForbiddenTransaction) {
        throw exp;
      }
      warn(exp);
    }
    const transactionFactory = this.getTransactionFactory(TxFactory);
    /// 校验生成交易的参数
    await transactionFactory.verifyTransactionBody(body, asset, config);
    const txbody: BFChainCore.TxBodyJSON = {
      version: body.version,
      type: body.type || this.getTransactionTypeFromTransactionFactoryConstructor(TxFactory), // 交易类型
      senderId: body.senderId, // 发起者地址
      senderPublicKey: body.senderPublicKey, // 发起者公钥
      senderSecondPublicKey: body.senderSecondPublicKey, // 发起者二次公钥
      recipientId: body.recipientId || undefined,
      rangeType: body.rangeType, // 接收类型
      range: body.range, // 接收人地址,必须赋值
      timestamp: body.timestamp, // 生成交易时间戳
      fee: body.fee, // 交易手续费
      remark: body.remark, // 交易备注，任意信息
      dappid: body.dappid || undefined, // 交易所属的 dappid
      lns: body.lns || undefined, // 交易所属的 域
      sourceIP: body.sourceIP || undefined, // 交易来源 ip
      fromMagic: body.fromMagic, // 交易来源链的 magic
      toMagic: body.toMagic, // 交易去往链的 magic
      applyBlockHeight: body.applyBlockHeight, // 交易发起高度
      effectiveBlockHeight: body.effectiveBlockHeight, // 有效区块数量
      storage: body.storage, // 查询用的索引存储
    };
    // 生成交易体
    const trs: T = transactionFactory.init(txbody, asset);
    return trs;
  }

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
  async createTransaction<T extends Transaction>(
    TxFactory: BFChainCore.TransactionFactoryConstructor<T>,
    body: BFChainCore.TxBodyJSON,
    asset: BFChainCore.GetTransactionAssetJSON<T>,
    keypair: BFChainCore.Keypair,
    secondKeypair?: BFChainCore.Keypair,
    config = this.config,
  ) {
    const trsType =
      body.type || this.getTransactionTypeFromTransactionFactoryConstructor(TxFactory);
    if (!this.canCreateTransaction(trsType)) {
      const trsName = TRANSACTION_TYPES_MAP.VK.get(TRANSACTION_TYPES_MAP.trsTypeToV(trsType));
      const exp = new ConsensusException(ERROR_LIST.DISABLED_CREATE_TRANSACTION, { trsName });
      if (this.abortForbiddenTransaction) {
        throw exp;
      }
      warn(exp);
    }
    const transactionFactory = this.getTransactionFactory(TxFactory);

    /// 校验主密码keypari与二次密码的keypair
    transactionFactory.verifyKeypair(keypair);
    if (secondKeypair) {
      transactionFactory.verifySecondKeypair(secondKeypair);
    }
    /// 校验生成交易的参数
    await transactionFactory.verifyTransactionBody(body, asset, config);
    const txbody: BFChainCore.TxBodyJSON = {
      version: body.version,
      type: body.type || this.getTransactionTypeFromTransactionFactoryConstructor(TxFactory), // 交易类型
      senderId: body.senderId, // 发起者地址
      senderPublicKey: body.senderPublicKey, // 发起者公钥
      senderSecondPublicKey: body.senderSecondPublicKey, // 发起者二次公钥
      recipientId: body.recipientId || undefined,
      rangeType: body.rangeType, // 接收类型
      range: body.range, // 接收人地址,必须赋值
      timestamp: body.timestamp, // 生成交易时间戳
      fee: body.fee, // 交易手续费
      remark: body.remark, // 交易备注，任意信息
      dappid: body.dappid || undefined, // 交易所属的 dappid
      lns: body.lns || undefined, // 交易所属的 域
      sourceIP: body.sourceIP || undefined, // 交易来源 ip
      fromMagic: body.fromMagic, // 交易来源链的 magic
      toMagic: body.toMagic, // 交易去往链的 magic
      applyBlockHeight: body.applyBlockHeight, // 交易发起高度
      effectiveBlockHeight: body.effectiveBlockHeight, // 有效区块数量
      storage: body.storage, // 查询用的索引存储
    };
    // 生成交易体
    const trs: T = transactionFactory.init(txbody, asset);
    // 生成交易签名
    trs.signatureBuffer = await this.asymmetricHelper.detachedSign(
      trs.getBytes(true, true),
      keypair.secretKey,
    );
    if (secondKeypair) {
      trs.signSignatureBuffer = await this.asymmetricHelper.detachedSign(
        trs.getBytes(false, true),
        secondKeypair.secretKey,
      );
    }

    // 校验交易的大小
    this.transactionHelper.verifyTransactionSize(trs);
    // 校验交易携带的 blob 大小
    this.transactionHelper.verifyTransactionBlobSize(trs);

    return trs;
  }

  /**
   * transactionJson => transactionModel
   *
   * @param trs
   */
  async recombineTransaction<T extends Transaction>(
    trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>,
  ) {
    return (await this.getTransactionFactoryFromType(trs.type).fromJSON(trs)) as T;
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
      throw new ArgumentFormatException(ERROR_LIST.INVALID_BASE_TYPE, { base_type });
    }
    return TransactionModelConstructor;
  }
  /**根据构造函数获取交易类型 */
  getTransactionTypeFromTransactionFactoryConstructor(
    TxFactory: BFChainCore.TransactionFactoryConstructor<any>,
  ) {
    const trs_base = TRANSACTION_FACTORY_TYPES_MAP.FV.get(TxFactory);
    if (!trs_base) {
      throw new ArgumentFormatException(ERROR_LIST.UNREGISTERED_TRANSACTION_FACTORY, {
        factoryName: TxFactory.name,
      });
    }
    const trs_key = TRANSACTION_FACTORY_TYPES_MAP.VK.get(trs_base);
    if (!trs_key) {
      throw new ArgumentFormatException(ERROR_LIST.UNREGISTERED_TRANSACTION_BASE_TYPE, {
        trs_base,
      });
    }
    const trs_type = (this.transactionHelper as any)[trs_key] as string;
    if (!trs_type) {
      throw new ArgumentFormatException(ERROR_LIST.UNREGISTERED_TRANSACTION_TYPE, { trs_key });
    }
    return trs_type;
  }

  /**
   * 获取变动的权益数
   *
   * @param transaction
   * @param argv
   * @returns
   */
  getMoveAmount<T extends Transaction>(
    transaction: T,
    argv = {
      magic: this.config.magic,
      assetType: this.config.assetType,
    },
  ) {
    return this.getTransactionFactoryFromType(transaction.type).getMoveAmount(transaction, argv);
  }
}

/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * F : TransactionFactoryConstructror
 */
export const TRANSACTION_FACTORY_TYPES_MAP = (() => {
  const V_K = new Map<TRANSACTION_TYPES_BASE, string>();
  const K_V = new Map<string, TRANSACTION_TYPES_BASE>();
  for (const tran_key in TRANSACTION_TYPES_BASE) {
    const val = TRANSACTION_TYPES_BASE[tran_key as keyof typeof TRANSACTION_TYPES_BASE];
    K_V.set(tran_key, val);
    V_K.set(val, tran_key);
  }
  const BASE_FACTORY = new Map<
    TRANSACTION_TYPES_BASE,
    BFChainCore.TransactionFactoryConstructor<any>
  >();
  const FACTORY_BASE = new Map<
    BFChainCore.TransactionFactoryConstructor<any>,
    TRANSACTION_TYPES_BASE
  >();
  (
    [
      [TRANSACTION_TYPES_BASE.SIGNATURE, ATOM_TRSFAC.SignatureTransactionFactory],
      [TRANSACTION_TYPES_BASE.DAPP, ATOM_TRSFAC.DAppTransactionFactory],
      [TRANSACTION_TYPES_BASE.DAPP_PURCHASING, ATOM_TRSFAC.DAppPurchasingTransactionFactory],
      [TRANSACTION_TYPES_BASE.MARK, ATOM_TRSFAC.MarkTransactionFactory],

      [TRANSACTION_TYPES_BASE.ISSUE_ASSET, ATOM_TRSFAC.IssueAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.DESTROY_ASSET, ATOM_TRSFAC.DestroyAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.TRANSFER_ASSET, ATOM_TRSFAC.TransferAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET, ATOM_TRSFAC.ToExchangeAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET, ATOM_TRSFAC.BeExchangeAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.GIFT_ASSET, ATOM_TRSFAC.GiftAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.GRAB_ASSET, ATOM_TRSFAC.GrabAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.TRUST_ASSET, ATOM_TRSFAC.TrustAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET, ATOM_TRSFAC.SignForAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.EMIGRATE_ASSET, ATOM_TRSFAC.EmigrateAssetTransactionFactory],
      [TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET, ATOM_TRSFAC.ImmigrateAssetTransactionFactory],

      [TRANSACTION_TYPES_BASE.LOCATION_NAME, ATOM_TRSFAC.LocationNameTransactionFactory],
      [
        TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE,
        ATOM_TRSFAC.SetLnsRecordValueTransactionFactory,
      ],
      [TRANSACTION_TYPES_BASE.SET_LNS_MANAGER, ATOM_TRSFAC.SetLnsManagerTransactionFactory],

      [
        TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY,
        ATOM_TRSFAC.IssueEntityFactoryTransactionFactory,
      ],
      [
        TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY_V1,
        ATOM_TRSFAC.IssueEntityFactoryTransactionFactoryV1,
      ],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY, ATOM_TRSFAC.IssueEntityTransactionFactoryV1],
      [TRANSACTION_TYPES_BASE.DESTROY_ENTITY, ATOM_TRSFAC.DestroyEntityTransactionFactory],
      [TRANSACTION_TYPES_BASE.ISSUE_ENTITY_MULTI, ATOM_TRSFAC.IssueEntityMultiTransactionFactoryV1],

      [TRANSACTION_TYPES_BASE.TRANSFER_ANY, ATOM_TRSFAC.TransferAnyTransactionFactory],
      [TRANSACTION_TYPES_BASE.GIFT_ANY, ATOM_TRSFAC.GiftAnyTransactionFactory],
      [TRANSACTION_TYPES_BASE.GRAB_ANY, ATOM_TRSFAC.GrabAnyTransactionFactory],
      [TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY, ATOM_TRSFAC.ToExchangeAnyTransactionFactory],
      [TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY, ATOM_TRSFAC.BeExchangeAnyTransactionFactory],
      [
        TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI,
        ATOM_TRSFAC.ToExchangeAnyMultiTransactionFactory,
      ],
      [
        TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI,
        ATOM_TRSFAC.BeExchangeAnyMultiTransactionFactory,
      ],
      [
        TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY_MULTI_ALL,
        ATOM_TRSFAC.ToExchangeAnyMultiAllTransactionFactory,
      ],
      [
        TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY_MULTI_ALL,
        ATOM_TRSFAC.BeExchangeAnyMultiAllTransactionFactory,
      ],

      [TRANSACTION_TYPES_BASE.ISSUE_CERTIFICATE, ATOM_TRSFAC.IssueCertificateTransactionFactory],
      [
        TRANSACTION_TYPES_BASE.DESTROY_CERTIFICATE,
        ATOM_TRSFAC.DestroyCertificateTransactionFactory,
      ],
    ] as [TRANSACTION_TYPES_BASE, BFChainCore.TransactionFactoryConstructor<any>][]
  ).forEach(([K, F]) => {
    BASE_FACTORY.set(K, F);
    FACTORY_BASE.set(F, K);
  });

  return {
    VK: V_K,
    KV: K_V,
    VF: BASE_FACTORY,
    FV: FACTORY_BASE,
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
