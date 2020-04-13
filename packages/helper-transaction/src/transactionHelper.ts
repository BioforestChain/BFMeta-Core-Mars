import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import {
  CoreExceptionGenerator,
  PROP_SHOULD_LTE_FIELD,
  NOT_EXIST,
} from "@bfchain/core-util-exception";
import { GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model-constants";
import {
  TRANSACTION_TYPES_MAP,
  TRANSACTION_TYPES_BASE,
  GiftAssetTransaction,
  GrabAssetModel,
  AccountSignatureModel,
  TemplateRemark,
} from "@bfchain/core-model-transaction";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { TRANSACTION_FILTER_SYMBOL } from "./const";
type Transaction = import("@bfchain/core-model-transaction").Transaction;

const {
  ArgumentFormatException,
  ArgumentIllegalException,
  NoFoundException,
} = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class TransactionHelper {
  constructor(
    public config: ConfigHelper,
    public baseHelper: BaseHelper,
    public jsbiHelper: JSBIHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("keypairHelper") public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
    private asymmetricHelper: AsymmetricHelper,
    private accountBaseHelper: AccountBaseHelper,
  ) {}
  get _ASSETTYPE() {
    return this.config.assetType;
  }
  get _CHAIN_NAME() {
    return this.config.chainName.toUpperCase();
  }
  parseType(type: string) {
    const assetType_index = type.indexOf("-");
    const chain_name_index = type.indexOf("-", assetType_index + 1);
    const type_val = type.substr(chain_name_index + 1);
    return {
      assetType: type.substr(0, assetType_index),
      chainName: type.substring(assetType_index + 1, chain_name_index),
      baseType: type_val as TRANSACTION_TYPES_BASE,
    }; // TRANSACTION_TYPES_MAP.VAL.get(type_val);
  }
  resolveType(arg: ReturnType<TransactionHelper["parseType"]>) {
    return `${arg.assetType}-${arg.chainName}-${arg.baseType}`;
  }
  getTypeName(type: string) {
    const { baseType } = this.parseType(type);
    return this.getTypeNameByBaseType(baseType);
  }
  getTypeNameByBaseType(baseType: TRANSACTION_TYPES_BASE) {
    return TRANSACTION_TYPES_MAP.VK.get(baseType);
  }
  getTransactionType(base_type: TRANSACTION_TYPES_BASE) {
    return `${this._ASSETTYPE}-${this._CHAIN_NAME}-${base_type}`;
  }
  /**
   * 交易类型是否合法
   *
   * @param type
   */
  isValidType(type: string) {
    return this.baseHelper.isValidTransactionType(type);
  }
  /**
   * 获取交易 signature
   *
   * @param trs
   */
  generateSignature(trs: Transaction) {
    return this.cryptoHelper
      .sha256()
      .update(trs.getBytes())
      .digest("hex");
  }
  /**是否是合法的交易 signature */
  isValidTransactionSignature(signature: string) {
    return this.baseHelper.isValidTransactionSignature(signature);
  }
  //#region 交易类型
  /** BSE: 基础交易 */
  /** SIGNATURE: “签名”交易 */
  get SIGNATURE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SIGNATURE);
  }
  /** DELEGATE: 注册为受托人 */
  get DELEGATE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DELEGATE);
  }
  /** VOTE: 投票 */
  get VOTE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.VOTE);
  }
  /** USERNAME: 注册用户别名地址 */
  get USERNAME() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.USERNAME);
  }
  /** ACCEPT_VOTE: 接收投票 */
  get ACCEPT_VOTE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.ACCEPT_VOTE);
  }
  /** REJECT_VOTE: 拒绝投票 */
  get REJECT_VOTE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.REJECT_VOTE);
  }
  // /** MULTI:注册多重签名帐号 */
  // get MULTI() {
  //   return this.getTransactionType(TRANSACTION_TYPES_BASE.MULTI);
  // }
  /** WOD: 拓展交易 */
  /** CUSTOM: 自定义交易 */
  get CUSTOM() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.CUSTOM);
  }
  /** DAPP: 侧链应用 */
  get DAPP() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DAPP);
  }
  /**DAPPPURCHASING 购买侧链应用 */
  get DAPP_PURCHASING() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DAPP_PURCHASING);
  }
  /** REGISTER_CHAIN: 注册链 */
  get REGISTER_CHAIN() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.REGISTER_CHAIN);
  }
  /** EXT: 存证交易 */
  get MARK() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.MARK);
  }
  /** SOC */
  /** AST: 数字资产交易 */
  /** ISSUE_ASSET: 发行数字资产 */
  get ISSUE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.ISSUE_ASSET);
  }
  /** DESTORY_ASSET: 销毁数字资产 */
  get DESTORY_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DESTORY_ASSET);
  }
  /** TRANSFER_ASSET: 数字资产转账 */
  get TRANSFER_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TRANSFER_ASSET);
  }
  /** TO_EXCHANGE_ASSET: 发起数字资产转换 */
  get TO_EXCHANGE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET);
  }
  /** BE_EXCHANGE_ASSET: 接收数字资产转换 */
  get BE_EXCHANGE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET);
  }
  /**GIFT_ASSET: 资产赠送 */
  get GIFT_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.GIFT_ASSET);
  }
  /**GRAB_ASSET: 抢资产(红包) */
  get GRAB_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.GRAB_ASSET);
  }
  /**TRUST_ASSET: 委托资产 */
  get TRUST_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TRUST_ASSET);
  }
  /**SIGN_FOR_ASSET: 签收资产 */
  get SIGN_FOR_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET);
  }
  /**EMIGRATE_ASSET: 资产迁出 */
  get EMIGRATE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.EMIGRATE_ASSET);
  }
  /**IMMIGRATE_ASSET: 资产迁出 */
  get IMMIGRATE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET);
  }
  /**TO_EXCHANGE_SPECIAL_ASSET: 特殊资产交换 */
  get TO_EXCHANGE_SPECIAL_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET);
  }
  /**BE_EXCHANGE_SPECIAL_ASSET: 特殊资产交换 */
  get BE_EXCHANGE_SPECIAL_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.BE_EXCHANGE_SPECIAL_ASSET);
  }
  /** LNS: 未知名称系统/Location Name System */
  /**
   * TOP_LEVEL_CHAIN: 一级链名(根：链名称)
   * ibt.bfchain(1 级)
   * app.ibt.bfchain(2 级)
   * ark.app.ibt.bfchain(3 级)
   */
  get LOCATION_NAME() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.LOCATION_NAME);
  }
  /** SET_RECORD_VALUE_LNS: 设置解析 */
  get SET_LNS_RECORD_VALUE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE);
  }
  /** SET_MANAGER_LNS: 设置管理员 */
  get SET_LNS_MANAGER() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SET_LNS_MANAGER);
  }

  ALL_TRANSACTION_TYPES = [
    this.SIGNATURE,
    this.DELEGATE,
    this.VOTE,
    this.USERNAME,
    this.ACCEPT_VOTE,
    this.REJECT_VOTE,
    this.CUSTOM,
    this.DAPP,
    this.DAPP_PURCHASING,
    this.REGISTER_CHAIN,
    this.MARK,
    this.ISSUE_ASSET,
    this.DESTORY_ASSET,
    this.TRANSFER_ASSET,
    this.TO_EXCHANGE_ASSET,
    this.BE_EXCHANGE_ASSET,
    this.GIFT_ASSET,
    this.GRAB_ASSET,
    this.TRUST_ASSET,
    this.SIGN_FOR_ASSET,
    this.EMIGRATE_ASSET,
    this.IMMIGRATE_ASSET,
    this.TO_EXCHANGE_SPECIAL_ASSET,
    this.BE_EXCHANGE_SPECIAL_ASSET,
    this.LOCATION_NAME,
    this.SET_LNS_RECORD_VALUE,
    this.SET_LNS_MANAGER,
  ];

  /**获取创世块里所有的受托人 */
  genesisDelegates(config = this.config) {
    const delegatesArr: string[] = [];
    const transactions = config.genesisBlock.transactions;
    for (const tr of transactions) {
      const { baseType } = this.parseType(tr.transaction.type);
      if (baseType === TRANSACTION_TYPES_BASE.DELEGATE) {
        delegatesArr.push(tr.transaction.senderId);
      }
    }
    return delegatesArr;
  }
  //#endregion
  /**
   * 校验交易的签名是否合法
   */
  async verifyTransactionSignature<SOME_TRS extends BFChainCore.Transaction>(
    transaction: SOME_TRS,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "Transaction";
    const { Buffer } = this;
    const {
      signSignatureBuffer,
      signatureBuffer,
      senderSecondPublicKeyBuffer,
      senderPublicKeyBuffer,
    } = transaction;
    const hash = await this.cryptoHelper
      .sha256()
      .update(transaction.getBytes(true, true))
      .digest();
    // 验证 signature 与 publicKey
    if (
      !this.keypairHelper.detached_verify(
        hash,
        Buffer.from(signatureBuffer),
        Buffer.from(senderPublicKeyBuffer),
      )
    ) {
      throw new ArgumentFormatException(`Invalid ${taskLabel} signature`);
    }

    // 验证 signSignature 与 secondPublicKey
    if (
      (senderSecondPublicKeyBuffer && senderSecondPublicKeyBuffer.length > 0) ||
      (signSignatureBuffer && signSignatureBuffer.length > 0)
    ) {
      if (senderSecondPublicKeyBuffer && signSignatureBuffer) {
        const shash = await this.cryptoHelper
          .sha256()
          .update(transaction.getBytes(false, true))
          .digest();
        if (
          !this.keypairHelper.detached_verify(
            shash,
            Buffer.from(signSignatureBuffer),
            Buffer.from(senderSecondPublicKeyBuffer),
          )
        ) {
          throw new ArgumentFormatException(`Invalid ${taskLabel} signSignature`);
        }
      } else {
        throw new ArgumentFormatException(
          `Invalid ${taskLabel} miss signSignature or senderSecondPublicKey`,
        );
      }
    }
  }
  /**
   * 校验交易的 remark 大小
   *
   * @param transaction
   */
  verifyTransactionRemarkSize<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS) {
    const templateRemark = TemplateRemark.fromObject({ remark: transaction.remark });
    const { maxBlockRemarkSize } = this.config;
    const remarkSize = this.Buffer.from(templateRemark.getBytes()).length;
    if (remarkSize > maxBlockRemarkSize) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: "remark",
        target: "block",
        field: maxBlockRemarkSize,
      });
    }
  }
  /**计算交易手续费 */
  calcTransactionFee(
    trs: Transaction,
    minTransactionFeePerByte = this.config.genesisBlock.remark.minTransactionFeePerByte,
  ) {
    let byte_num = trs.getBytes().length;
    let cur_fee = trs.fee;
    do {
      const min_fee = this.jsbiHelper
        .multiplyCeilFraction(byte_num, minTransactionFeePerByte)
        .toString();
      if (min_fee.length === cur_fee.length) {
        return min_fee;
      }
      byte_num += cur_fee.length - min_fee.length;
      cur_fee = min_fee;
    } while (true);
  }
  private _cache_of_diff_numerator_BI = new Map<number, bigint>();
  private _cache_of_diff_BI = {
    num: -1,
    participation: "",
    diff_BI: BigInt(0),
  };
  /**
   * 计算交易POW的难度
   */
  calcDiffOfTransactionProfOfWork(num: number, participation: string) {
    const { _cache_of_diff_BI } = this;
    let diff_BI: bigint;
    if (_cache_of_diff_BI.num === num && _cache_of_diff_BI.participation === participation) {
      diff_BI = _cache_of_diff_BI.diff_BI;
    } else {
      const {
        growthFactor,
        participationRatio,
      } = this.config.genesisBlock.remark.transactionPowOfWorkConfig;
      /**难度系数的分子，这个只与num有关系，所以可以进行缓存 */
      let diff_numerator_BI = this._cache_of_diff_numerator_BI.get(num);
      if (!diff_numerator_BI) {
        const num_BI = BigInt(num);
        const growthFactor_numerator_BI = BigInt(growthFactor.numerator);
        const growthFactor_denominator_BI = BigInt(growthFactor.denominator);
        /**(E ^ N) */
        const BI_1 = growthFactor_numerator_BI ** num_BI / growthFactor_denominator_BI ** num_BI;
        diff_numerator_BI = BI_1 * num_BI;
        this._cache_of_diff_numerator_BI.set(num, diff_numerator_BI);
      }

      const diff_denominator_numerator_BI =
        BigInt(participationRatio.numerator) * BigInt(participation);
      const diff_denominator_denominator_BI = BigInt(participationRatio.denominator);
      /**难度系数的分母，这与账户的上一轮参与度有关系 */
      const diff_denominator_BI =
        diff_denominator_numerator_BI / diff_denominator_denominator_BI + BigInt(1);
      /**计算出难度系数 */
      diff_BI = diff_numerator_BI / diff_denominator_BI;
      /// 如果难度系数是0，直接跳过后面的校验计算
      if (diff_BI === BigInt(0)) {
        return diff_BI;
      }
      _cache_of_diff_BI.num = num;
      _cache_of_diff_BI.participation = participation;
      _cache_of_diff_BI.diff_BI = diff_BI;
    }
    return diff_BI;
  }
  /**
   * 校验交易POW
   * DIFF = (E ^ N) * N / (1 + B + P * R)
   * @param transaction 交易体
   * @param num 在一个区块中用户的第N比交易
   */
  async checkTransactionProfOfWork(
    signatureBuffer: Uint8Array,
    num: number,
    participation: string,
    diff_BI?: bigint,
  ) {
    diff_BI || (diff_BI = this.calcDiffOfTransactionProfOfWork(num, participation));
    if (!diff_BI) {
      return true;
    }
    /// 根据交易信息校验是否符合难度
    const shaBuffer = await this.cryptoHelper
      .sha256()
      .update(signatureBuffer)
      .digest();

    /**得分应该读取多少位数，至少8位 */
    const X = Math.max(
      Math.min(Math.ceil(Math.log2(Number(diff_BI * (BigInt(1) + diff_BI)))), shaBuffer.length),
      8,
    );
    /**总共的分数 */
    const hit_numerator_BI = BigInt(2) << BigInt(X);
    /**将分数基于diff来细分成diff份，得分必须小于最小的一份 */
    const max_score_BI = hit_numerator_BI / diff_BI;
    /**读取出交易的得分 */
    const score_BI = this.baseHelper.getUintX(shaBuffer, X);
    return score_BI < max_score_BI;
  }
  /**交易的噪点生成器 */
  *nonceWriter<T extends Transaction>(trs: T) {
    /// 拷贝一份没有signature的trs
    trs = trs.$type.decode(trs.getBytes(true, true)) as T;

    /// 强制将nonce归零
    if (!trs.nonce) {
      trs.nonce = 0;
    }

    /// 获取最基础的交易体
    const buf_0 = new Uint8Array(trs.$type.encode(trs).finish());
    yield { uint8array: buf_0, nonce: 0 };

    /// 获取nonce为1的交易体
    trs.nonce = 1;
    const buf_1 = new Uint8Array(trs.$type.encode(trs).finish());
    yield { uint8array: buf_1, nonce: 1 };
    /// 获取nonce为2的交易体
    trs.nonce = 2;
    const buf_2 = new Uint8Array(trs.$type.encode(trs).finish());
    yield { uint8array: buf_2, nonce: 2 };
    /// 对比1与2交易体的差异位，从那一位起步就是nonce的未知
    let nonce_offset = 0;
    for (let i = 0; i < buf_1.length; i++) {
      if (buf_1[i] !== buf_2[i]) {
        nonce_offset = i;
        break;
      }
    }

    for (let nonce = 3; nonce < 4294967296; nonce++) {
      const with_nonce_length = buf_2.length;
      const with_nonce_arraybuffer = new ArrayBuffer(with_nonce_length);
      const with_nonce_uint8array = new Uint8Array(with_nonce_arraybuffer);
      with_nonce_uint8array.set(buf_2, 0);
      const with_nonce_dataview = new DataView(with_nonce_arraybuffer);
      with_nonce_dataview.setUint32(nonce_offset, nonce, true);
      yield { uint8array: with_nonce_uint8array, nonce, offset: nonce_offset };
    }
  }
  hashCode(str: string) {
    let hash = 0;
    let i = 0;
    const len = str.length;
    while (i < len) {
      hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return Math.abs(hash);
  }

  /**
   * 计算抢到的`Random`资产数量
   * @param grabId
   * @param blockSignatureBuffer
   * @param giftTransactionSignatureBuffer
   * @param gifterId
   * @param totalGiftAssetNumber
   * @param totalGrabableTimes
   */
  async calcGrabRandomGiftAssetNumber(
    grabId: string,
    blockSignatureBuffer: Uint8Array,
    giftTransactionSignatureBuffer: Uint8Array,
    gifterId: string,
    totalGiftAssetNumber: string,
    totalGrabableTimes: number,
  ) {
    const { jsbiHelper } = this;
    const miniUnit = BigInt(0);
    const jsbiTotalAsset = BigInt(totalGiftAssetNumber);
    // FIXME: 随机方式待优化
    const averageAsset = jsbiTotalAsset / BigInt(totalGrabableTimes);
    if (averageAsset === miniUnit) {
      return jsbiTotalAsset;
    }
    const grabAsset = BigInt(
      `0x${await this.cryptoHelper
        .md5()
        .update(grabId)
        .update(blockSignatureBuffer)
        .update(giftTransactionSignatureBuffer)
        .update(gifterId)
        .digest("hex")}`,
    );
    let amount = jsbiHelper.multiplyFloorFractionString(totalGiftAssetNumber, {
      numerator: grabAsset,
      denominator: BigInt(2) ** BigInt(128),
    });
    if (amount <= miniUnit) {
      amount = BigInt(this.config.miniUnit);
    }
    return amount;
  }

  /**
   * 计算抢到的`RecipientRandom`的资产数量
   * @param grabId
   * @param blockSignatureBuffer
   * @param giftTransactionSignatureBuffer
   * @param gifterId
   * @param giftTransactionRecipient
   * @param totalGiftAssetNumber
   * @param totalGrabableTimes
   */
  async calcGrabRecipientRandomGiftAssetNumber(
    grabId: string,
    blockSignatureBuffer: Uint8Array,
    giftTransactionSignatureBuffer: Uint8Array,
    gifterId: string,
    giftTransactionRecipient: string[],
    totalGiftAssetNumber: string,
  ) {
    const weightMap = new Map<string, bigint>();
    let totalWeight_BI = BigInt(0);
    for (const recipientId of giftTransactionRecipient) {
      const weight_BI = BigInt(
        `0x${(
          await this.cryptoHelper
            .md5()
            .update(blockSignatureBuffer)
            .update(giftTransactionSignatureBuffer)
            .update(gifterId)
            .update(recipientId)
            .digest("hex")
        ).substr(0, 16)}`, // uint64
      );
      totalWeight_BI = totalWeight_BI + weight_BI;
      weightMap.set(recipientId, weight_BI);
    }
    const grabWeight_BI = weightMap.get(grabId);
    if (!grabWeight_BI) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `grabId(${grabId})`,
        target: "giftTransactionRecipient",
        function: "calcGrabRecipientRandomGiftAssetNumber",
      });
    }

    return (grabWeight_BI * BigInt(totalGiftAssetNumber)) / totalWeight_BI;
  }
  /**
   * 计算抢到的`Average`的资产数量
   * @param totalGiftAssetNumber
   * @param totalGrabableTimes
   */
  calcGrabAverageGiftAssetNumber(totalGiftAssetNumber: string, totalGrabableTimes: number) {
    return BigInt(totalGiftAssetNumber) / BigInt(totalGrabableTimes);
  }
  /**
   * 通用的红包交易金额计算器
   * @param grabId
   * @param giftTransactionInBlock
   */
  calcGrabGiftAssetNumber(
    grabId: string,
    giftTransactionInBlock: BFChainCore.TransactionInBlock<GiftAssetTransaction>,
  ) {
    const giftTransaction = giftTransactionInBlock.transaction;
    const giftAsset = giftTransaction.asset.giftAsset;
    switch (giftAsset.giftDistributionRule) {
      case GIFT_DISTRIBUTION_RULE.AVERAGE:
        return this.calcGrabAverageGiftAssetNumber(giftAsset.amount, giftAsset.totalGrabableTimes);
      case GIFT_DISTRIBUTION_RULE.RANDOM:
        return this.calcGrabRandomGiftAssetNumber(
          grabId,
          giftTransactionInBlock.signatureBuffer,
          giftTransaction.signatureBuffer,
          giftTransaction.senderId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
      case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
        return this.calcGrabRecipientRandomGiftAssetNumber(
          grabId,
          giftTransactionInBlock.signatureBuffer,
          giftTransaction.signatureBuffer,
          giftTransaction.senderId,
          giftTransaction.range,
          giftAsset.amount,
        );
    }
  }

  /**基于gift交易以及要生成grab交易的账户信息，生成grabAsset */
  async generateGrabAsset(
    giftTransactionInBlock: BFChainCore.TransactionInBlock<GiftAssetTransaction>,
    opts: BFChainCore.TransactionHelper.GenerateGrabAssetOptions,
  ) {
    const grabKeypair = await this.accountBaseHelper.createSecretKeypair(opts.mainSecret);
    const giftTransaction = giftTransactionInBlock.transaction;
    const giftAsset = giftTransaction.asset.giftAsset;
    const {
      grabId = await this.accountBaseHelper.getAddressFromPublicKey(grabKeypair.publicKey),
      grabSecret,
    } = opts;
    const blockSignatureBuffer = giftTransactionInBlock.signatureBuffer;
    const giftTransactionSignatureBuffer = giftTransaction.signatureBuffer;

    let ciphertextSignature: AccountSignatureModel | undefined;
    if (grabSecret) {
      ciphertextSignature = AccountSignatureModel.fromObject({
        signatureBuffer: await this.getCiphertextSignature({
          secret: grabSecret,
          transactionSignatureBuffer: giftTransactionSignatureBuffer,
          senderId: grabId,
        }),
        publicKeyBuffer: grabKeypair.publicKey,
      });
    }

    const result = GrabAssetModel.fromObject({
      blockSignatureBuffer,
      giftTransactionSignatureBuffer,

      giftAsset,
      ciphertextSignature,

      transactionRangeType: giftTransaction.rangeType,
      transactionRange: giftTransaction.range,
      applyBlockHeight: giftTransaction.applyBlockHeight,
      beginUnfrozenBlockHeight: giftAsset.beginUnfrozenBlockHeight,
      effectiveBlockHeight: giftTransaction.effectiveBlockHeight,
    });

    // 根据共识规则计算出能抢到的金额数量
    result.amount = (await this.calcGrabGiftAssetNumber(grabId, giftTransactionInBlock)).toString();

    return result;
  }

  /**
   * 获取使用密文的交易的身份校验签名信息
   *
   * @param args `密文``gift 交易签名``发起账户地址`
   */
  async getCiphertextSignature(args: {
    secret: string;
    transactionSignatureBuffer: Uint8Array;
    senderId: string;
  }) {
    return this.asymmetricHelper.detachedSign(
      await this.cryptoHelper
        .sha256()
        .update(args.transactionSignatureBuffer)
        .update(args.senderId)
        .digest(),
      (await this.accountBaseHelper.createSecretKeypair(args.secret)).secretKey,
    );
  }
  /**
   * 校验使用密文的交易的身份校验签名信息
   *
   * @param args `密文公钥``密文签名``gift 交易签名``发起账户地址`
   */
  async verifyCiphertextSignature(args: {
    secretPublicKey: Uint8Array;
    ciphertextSignatureBuffer: Uint8Array;
    transactionSignatureBuffer: Uint8Array;
    senderId: string;
  }) {
    return this.asymmetricHelper.detachedVeriy(
      await this.cryptoHelper
        .sha256()
        .update(args.transactionSignatureBuffer)
        .update(args.senderId)
        .digest(),
      args.ciphertextSignatureBuffer,
      args.secretPublicKey,
    );
  }

  /**
   * 资产迁出交易创世账户签名
   *
   * @param args `所属链名称``网络标识符``资产名称``发起账户地址`
   */
  async getEmigrateAssetGenesisSignature(args: {
    secret: string;
    chainName: string;
    magic: string;
    assetType: string;
    senderId: string;
    genesisSignatureBuffer?: Uint8Array;
  }) {
    const secretKeyBuffer = (await this.accountBaseHelper.createSecretKeypair(args.secret))
      .secretKey;
    return this.emigrateAssetGenesisSignature({
      secretKeyBuffer,
      chainName: args.chainName,
      magic: args.magic,
      assetType: args.assetType,
      senderId: args.senderId,
      genesisSignatureBuffer: args.genesisSignatureBuffer,
    });
  }
  async emigrateAssetGenesisSignature(args: {
    secretKeyBuffer: Uint8Array;
    chainName: string;
    magic: string;
    assetType: string;
    senderId: string;
    genesisSignatureBuffer?: Uint8Array;
  }) {
    const hash = this.cryptoHelper
      .sha256()
      .update(args.chainName)
      .update(args.magic)
      .update(args.assetType)
      .update(args.senderId);
    if (args.genesisSignatureBuffer) {
      hash.update(args.genesisSignatureBuffer);
    }
    return this.asymmetricHelper.detachedSign(await hash.digest(), args.secretKeyBuffer);
  }
  /**
   * 资产迁出交易创世账户签名验证
   *
   * @param args `创世账户公钥``密文签名``所属链名称``网络标识符``资产名称``发起账户地址`
   */
  async verifyEmigrateAssetGenesisSignature(args: {
    secretPublicKey: Uint8Array;
    signatureBuffer: Uint8Array;
    chainName: string;
    magic: string;
    assetType: string;
    senderId: string;
    genesisSignatureBuffer?: Uint8Array;
  }) {
    const hash = this.cryptoHelper
      .sha256()
      .update(args.chainName)
      .update(args.magic)
      .update(args.assetType)
      .update(args.senderId);
    if (args.genesisSignatureBuffer) {
      hash.update(args.genesisSignatureBuffer);
    }
    return this.asymmetricHelper.detachedVeriy(
      await hash.digest(),
      args.signatureBuffer,
      args.secretPublicKey,
    );
  }

  /**
   * 资产迁入交易创世账户签名
   *
   * @param args `密文``to 交易签名`
   */
  async getImmigrateAssetGenesisSignature(args: {
    secret: string;
    transactionSignatureBuffer: Uint8Array;
    genesisSignatureBuffer?: Uint8Array;
  }) {
    const secretKeyBuffer = (await this.accountBaseHelper.createSecretKeypair(args.secret))
      .secretKey;
    return this.immigrateAssetGenesisSignature({
      secretKeyBuffer,
      transactionSignatureBuffer: args.transactionSignatureBuffer,
      genesisSignatureBuffer: args.genesisSignatureBuffer,
    });
  }
  async immigrateAssetGenesisSignature(args: {
    secretKeyBuffer: Uint8Array;
    transactionSignatureBuffer: Uint8Array;
    genesisSignatureBuffer?: Uint8Array;
  }) {
    const hash = this.cryptoHelper.sha256().update(args.transactionSignatureBuffer);
    if (args.genesisSignatureBuffer) {
      hash.update(args.genesisSignatureBuffer);
    }
    return this.asymmetricHelper.detachedSign(await hash.digest(), args.secretKeyBuffer);
  }
  /**
   * 资产迁入交易创世账户签名验证
   *
   * @param args `密文公钥``密文签名``交易签名``to 交易签名`
   */
  async verifyImmigrateAssetGenesisSignature(args: {
    secretPublicKey: Uint8Array;
    signatureBuffer: Uint8Array;
    transactionSignatureBuffer: Uint8Array;
    genesisSignatureBuffer?: Uint8Array;
  }) {
    const hash = this.cryptoHelper.sha256().update(args.transactionSignatureBuffer);
    if (args.genesisSignatureBuffer) {
      hash.update(args.genesisSignatureBuffer);
    }
    return this.asymmetricHelper.detachedVeriy(
      await hash.digest(),
      args.signatureBuffer,
      args.secretPublicKey,
    );
  }

  /**
   * 第三方签名
   *
   * @param args `密文``trust 交易签名``trust 交易 senderId``trust 交易 recipientId`
   */
  async getThirdPartySignature(args: {
    secret: string;
    transactionSignatureBuffer: Uint8Array;
    senderId: string;
    recipientId: string;
    thirdPartySignatureBuffer?: Uint8Array;
  }) {
    const secretKeyBuffer = (await this.accountBaseHelper.createSecretKeypair(args.secret))
      .secretKey;
    return this.thirdPartySignature({
      secretKeyBuffer,
      transactionSignatureBuffer: args.transactionSignatureBuffer,
      senderId: args.senderId,
      recipientId: args.recipientId,
      thirdPartySignatureBuffer: args.thirdPartySignatureBuffer,
    });
  }
  async thirdPartySignature(args: {
    secretKeyBuffer: Uint8Array;
    transactionSignatureBuffer: Uint8Array;
    senderId: string;
    recipientId: string;
    thirdPartySignatureBuffer?: Uint8Array;
  }) {
    const hash = this.cryptoHelper
      .sha256()
      .update(args.transactionSignatureBuffer)
      .update(args.senderId)
      .update(args.recipientId);
    if (args.thirdPartySignatureBuffer) {
      hash.update(args.thirdPartySignatureBuffer);
    }
    return this.asymmetricHelper.detachedSign(await hash.digest(), args.secretKeyBuffer);
  }
  /**
   * 第三方签名验证
   *
   * @param args `密文公钥``密文签名``trust 交易签名``trust 交易 senderId``trust 交易 recipientId`
   */
  async verifyThirdPartySignature(args: {
    secretPublicKey: Uint8Array;
    signatureBuffer: Uint8Array;
    transactionSignatureBuffer: Uint8Array;
    senderId: string;
    recipientId: string;
    thirdPartySignatureBuffer?: Uint8Array;
  }) {
    const hash = this.cryptoHelper
      .sha256()
      .update(args.transactionSignatureBuffer)
      .update(args.senderId)
      .update(args.recipientId);
    if (args.thirdPartySignatureBuffer) {
      hash.update(args.thirdPartySignatureBuffer);
    }
    return this.asymmetricHelper.detachedVeriy(
      await hash.digest(),
      args.signatureBuffer,
      args.secretPublicKey,
    );
  }

  /**
   * 获取交易的最大有效区块高度
   * @param transaction
   */
  getTransactionMaxEffectiveHeight(transaction: Transaction) {
    return transaction.effectiveBlockHeight;
  }

  /**
   * 获取交易的最小有效区块高度
   * @param transaction
   */
  getTransactionMinEffectiveHeight(transaction: Transaction) {
    let minEffectiveHeight = transaction.applyBlockHeight;
    if (transaction instanceof GiftAssetTransaction) {
      const beginUnfrozenBlockHeight = transaction.asset.giftAsset.beginUnfrozenBlockHeight;
      beginUnfrozenBlockHeight && (minEffectiveHeight = beginUnfrozenBlockHeight);
    }
    return minEffectiveHeight;
  }

  /**
   * 创建交易的类型过滤器
   * 如果没有这个过滤器，那么默认全部通过
   * 否则根据匹配规则进行匹配
   * 目前仅仅支持全量匹配
   * @TODO 支持通配符匹配
   */
  @Inject(TRANSACTION_FILTER_SYMBOL, { optional: true })
  transactionFilter?: string[];
  /**
   * 检查交易是否可以被创建
   * @param type
   */
  isTransactionInFilter(type: string) {
    if (this.transactionFilter) {
      if (!this.transactionFilter.includes(type)) {
        return false;
      }
    }
    return true;
  }
}
