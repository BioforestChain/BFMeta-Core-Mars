import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { GIFT_DISTRIBUTION_RULE, PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";
import {
  TRANSACTION_TYPES_MAP,
  TRANSACTION_TYPES_BASE,
  GiftAssetTransaction,
  GrabAssetModel,
  TransactionAssetChangeModel,
} from "@bfchain/core-model-transaction";
import { AccountSignatureModel } from "@bfchain/core-model-common";
import { TPOWHelper } from "@bfchain/core-helper-transaction-pow";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { Injectable, Inject } from "@bfchain/util-dep-inject";
import { decodeBinaryToHex } from "@bfchain/util-encoding-hex";
import { cacheGetter } from "@bfchain/util-decorator";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";

import { TRANSACTION_FILTER_SYMBOL, ABORT_FORBIDDEN_TRANSACTION_SYMBOL } from "./const";
type Transaction = import("@bfchain/core-model-transaction").Transaction;

const { ArgumentFormatException, ArgumentIllegalException, NoFoundException } =
  CoreExceptionGenerator("HELPER", "transactionHelper");

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
    private tpowHelper: TPOWHelper,
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
  async generateSignature(trs: Transaction) {
    return decodeBinaryToHex(await this.cryptoHelper.sha256(trs.getBytes(true, true)));
  }
  /**是否是合法的交易 signature */
  isValidTransactionSignature(signature: string) {
    return this.baseHelper.isValidTransactionSignature(signature);
  }
  //#region 交易类型
  /** BSE: 基础交易 */
  /** SIGNATURE: 二次密码 */
  get SIGNATURE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SIGNATURE);
  }
  /** DELEGATE: 注册锻造者 */
  get DELEGATE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DELEGATE);
  }
  /** VOTE: 治理投票 */
  get VOTE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.VOTE);
  }
  /** USERNAME: 设置用户名 */
  get USERNAME() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.USERNAME);
  }
  /** ACCEPT_VOTE: 开始收票 */
  get ACCEPT_VOTE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.ACCEPT_VOTE);
  }
  /** REJECT_VOTE: 停止收票 */
  get REJECT_VOTE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.REJECT_VOTE);
  }
  /** WOD: 拓展交易 */
  /** CUSTOM: 个性事件 */
  get CUSTOM() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.CUSTOM);
  }
  /** DAPP: 创建DAPPID */
  get DAPP() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DAPP);
  }
  /**DAPPPURCHASING *DAPPID付费 */
  get DAPP_PURCHASING() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DAPP_PURCHASING);
  }
  /** REGISTER_CHAIN: 注册新世界 */
  get REGISTER_CHAIN() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.REGISTER_CHAIN);
  }
  /** EXT: 数据存证 */
  get MARK() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.MARK);
  }
  /** SOC */
  /** AST: 权益 */
  /** ISSUE_ASSET: 创建权益 */
  get ISSUE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.ISSUE_ASSET);
  }
  /** DESTORY_ASSET: 销毁权益 */
  get DESTORY_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DESTORY_ASSET);
  }
  /** TRANSFER_ASSET: 权益转移 */
  get TRANSFER_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TRANSFER_ASSET);
  }
  /**GIFT_ASSET: 发起权益赠送 */
  get GIFT_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.GIFT_ASSET);
  }
  /**GRAB_ASSET: 接受权益赠送 */
  get GRAB_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.GRAB_ASSET);
  }
  /**TRUST_ASSET: 发起权益委托 */
  get TRUST_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TRUST_ASSET);
  }
  /**SIGN_FOR_ASSET: 签收权益委托 */
  get SIGN_FOR_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SIGN_FOR_ASSET);
  }
  /**EMIGRATE_ASSET: 权益迁出 */
  get EMIGRATE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.EMIGRATE_ASSET);
  }
  /**IMMIGRATE_ASSET: 权益迁入 */
  get IMMIGRATE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.IMMIGRATE_ASSET);
  }
  /** TO_EXCHANGE_ASSET: 发起权益交换 */
  get TO_EXCHANGE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TO_EXCHANGE_ASSET);
  }
  /** BE_EXCHANGE_ASSET: 接受权益交换 */
  get BE_EXCHANGE_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.BE_EXCHANGE_ASSET);
  }
  /**TO_EXCHANGE_SPECIAL_ASSET: 发起资产交换 */
  get TO_EXCHANGE_SPECIAL_ASSET() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TO_EXCHANGE_SPECIAL_ASSET);
  }
  /**BE_EXCHANGE_SPECIAL_ASSET: 接受资产交换 */
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
  /**LOCATION_NAME：注册/注销位名 */
  get LOCATION_NAME() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.LOCATION_NAME);
  }
  /** SET_LNS_RECORD_VALUE: 设置位名解析值 */
  get SET_LNS_RECORD_VALUE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE);
  }
  /** SET_LNS_MANAGER: 设置位名管理员 */
  get SET_LNS_MANAGER() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SET_LNS_MANAGER);
  }
  /** ETY: 非同质资产/entity */
  /** ISSUE_ENTITY_FACTORY: 发行非同质资产模板 */
  get ISSUE_ENTITY_FACTORY() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.ISSUE_ENTITY_FACTORY);
  }
  /** ISSUE_ENTITY: 发行非同质资产 */
  get ISSUE_ENTITY() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.ISSUE_ENTITY);
  }
  /** DESTORY_ENTITY: 销毁非同质资产 */
  get DESTORY_ENTITY() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.DESTORY_ENTITY);
  }

  /** ECA: 任意资产交换 */
  /** TO_EXCHANGE_ANY: 发起资产交换 */
  get TO_EXCHANGE_ANY() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.TO_EXCHANGE_ANY);
  }
  /** BE_EXCHANGE_ANY: 接受资产交换 */
  get BE_EXCHANGE_ANY() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.BE_EXCHANGE_ANY);
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
    this.ISSUE_ENTITY_FACTORY,
    this.ISSUE_ENTITY,
    this.DESTORY_ENTITY,
    this.TO_EXCHANGE_ANY,
    this.BE_EXCHANGE_ANY,
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
  async getGensisAcountAddress(config = this.config) {
    return this.accountBaseHelper.getAddressFromPublicKeyString(config.genesisAccountPublicKey);
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
    const hash = await this.cryptoHelper.sha256().update(transaction.getBytes(true, true)).digest();
    // 验证 signature 与 publicKey
    if (!(await this.keypairHelper.detached_verify(hash, signatureBuffer, senderPublicKeyBuffer))) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_SIGNATURE, { taskLabel });
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
          !(await this.keypairHelper.detached_verify(
            shash,
            signSignatureBuffer,
            senderSecondPublicKeyBuffer,
          ))
        ) {
          throw new ArgumentFormatException(ERROR_LIST.INVALID_SIGNSIGNATURE, { taskLabel });
        }
      } else {
        throw new ArgumentFormatException(
          `Invalid ${taskLabel} miss signSignature or senderSecondPublicKey`,
        );
      }
    }
  }
  /**
   * 校验交易的大小
   *
   * @param transaction
   */
  verifyTransactionSize<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS) {
    const { maxTransactionSize } = this.config;
    const trsSize = transaction.getBytes().length;
    if (trsSize > maxTransactionSize) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `transaction size ${trsSize}`,
        target: "transaction",
        field: maxTransactionSize,
      });
    }
  }
  private __calcStandardMinFee(customMinFeePerByte?: BFChainCore.FractionJSON) {
    const minTransactionFeePerByte = this.config.minTransactionFeePerByte;
    // 获取最小手续费
    return customMinFeePerByte
      ? this.jsbiHelper.compareFraction(minTransactionFeePerByte, customMinFeePerByte) >= 0
        ? minTransactionFeePerByte
        : customMinFeePerByte
      : minTransactionFeePerByte;
  }
  private __calcMinFeePerBytes(
    fee: string,
    bytesLength: number,
    minTransactionFeePerByte = this.config.minTransactionFeePerByte,
  ) {
    let byte_num = bytesLength;
    let cur_fee = fee;
    do {
      const min_fee = this.jsbiHelper
        .multiplyCeilFraction(byte_num, minTransactionFeePerByte)
        .toString();
      if (min_fee.length === cur_fee.length) {
        return min_fee;
      }
      byte_num += min_fee.length - cur_fee.length;
      cur_fee = min_fee;
    } while (true);
  }
  /**
   * 根据事件字节数计算事件最小手续费
   *
   * @param transaction 事件体
   * @param bytesLength 事件体字节数
   * @param customMinFeePerByte 自定义的最低手续费，如果比网络手续费小则自动采用网络手续费
   */
  calcTransactionMinFeeByBytes(
    transaction: Transaction,
    bytesLength?: number,
    customMinFeePerByte?: BFChainCore.FractionJSON,
  ) {
    return this.__calcMinFeePerBytes(
      transaction.fee,
      bytesLength || transaction.getBytes().length,
      this.__calcStandardMinFee(customMinFeePerByte),
    );
  }
  /**
   * 根据共识最大事件字节数计算事件最小手续费
   *
   * @param times 计费次数
   * @param customMinFeePerByte 自定义的最低手续费，如果比网络手续费小则自动采用网络手续费
   */
  calcTransactionMinFeeByMaxBytes(times: number, customMinFeePerByte?: BFChainCore.FractionJSON) {
    const bytesLength = this.config.maxTransactionSize * times;
    return this.jsbiHelper
      .multiplyCeilFraction(bytesLength, this.__calcStandardMinFee(customMinFeePerByte))
      .toString();
  }
  /**
   * 计算事件最小手续费
   *
   * @param transaction 事件体
   * @param bytesLength 事件体字节数
   * @param customMinFeePerByte 自定义的最低手续费，如果比网络手续费小则自动采用网络手续费
   */
  calcTransactionMinFee(
    transaction: Transaction,
    bytesLength?: number,
    customMinFeePerByte?: BFChainCore.FractionJSON,
  ) {
    // 红包事件按最大事件字节付费，并且给抢红包事件付费
    if (transaction.type === this.GIFT_ASSET) {
      return this.calcTransactionMinFeeByMaxBytes(
        (transaction as BFChainCore.Transaction<BFChainCore.GiftAssetAssetJSON>).asset.giftAsset
          .totalGrabableTimes + 1,
        customMinFeePerByte,
      );
    }
    // 见证事件按最大事件字节付费，并且给签收见证事件付费
    if (transaction.type === this.TRUST_ASSET) {
      return this.calcTransactionMinFeeByMaxBytes(
        (transaction as BFChainCore.Transaction<BFChainCore.TrustAssetAssetJSON>).asset.trustAsset
          .numberOfSignFor + 1,
        customMinFeePerByte,
      );
    }
    return this.calcTransactionMinFeeByBytes(transaction, bytesLength, customMinFeePerByte);
  }
  /**计算交易手续费 */
  calcTransactionFee(
    trs: Transaction,
    minTransactionFeePerByte = this.config.minTransactionFeePerByte,
  ) {
    return this.__calcMinFeePerBytes(trs.fee, trs.getBytes().length, minTransactionFeePerByte);
  }

  /**
   * 根据参与度计算一轮需要在线的时间
   * 0.2* Round ~ 1.3* Round
   */
  @cacheGetter
  get calcNeedOnlineTime() {
    return this.tpowHelper.calcNeedOnlineTime.bind(this.tpowHelper);
  }

  @cacheGetter
  get calcTpowParticipationBI() {
    return this.tpowHelper.calcTpowParticipationBI.bind(this.tpowHelper);
  }

  /**
   * 计算交易POW的难度
   */
  // @cacheGetter
  get calcDiffOfTransactionProfOfWork() {
    return this.tpowHelper.calcDiffOfTransactionProfOfWork.bind(this.tpowHelper);
  }

  /**
   * 校验交易POW
   * DIFF = (E ^ N) * N / (1 + B + P * R)
   * @param transaction 交易体
   * @param num 在一个区块中用户的第N比交易
   */
  @cacheGetter
  get checkTransactionProfOfWork() {
    return this.tpowHelper.checkTransactionProfOfWork.bind(this.tpowHelper);
  }

  /**交易的噪点生成器 */
  nonceWriter<T extends Transaction>(trs: T) {
    return this.tpowHelper.nonceWriter<T>(trs);
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
    const jsbiTotalAsset = BigInt(totalGiftAssetNumber);
    if (totalGrabableTimes === 1) {
      return jsbiTotalAsset;
    }
    const { jsbiHelper } = this;
    const miniUnit = BigInt(0);
    const minAssets = BigInt(this.config.miniUnit);
    const averageAssets = jsbiTotalAsset / BigInt(totalGrabableTimes);
    if (averageAssets === miniUnit) {
      return minAssets;
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
    const amount = jsbiHelper.multiplyFloorFractionString(totalGiftAssetNumber, {
      numerator: grabAsset,
      denominator: BigInt(2) ** BigInt(128),
    });
    // amount 小于最小流通单位，则直接返回最小流通单位
    if (amount < minAssets) {
      return minAssets;
    }
    const maxAssets = averageAssets * BigInt(2);
    // minAssets <= amount <= maxAssets，直接返回 amount
    if (amount <= maxAssets) {
      return amount;
    }
    // 计算 amount 取模 maxAssets
    let newAmount = amount % maxAssets;
    // amount > 2 倍 maxAssets 并且 取模结果 <= averageAssets，newAmount 修改为 newAmount + averageAssets
    if (amount > maxAssets * BigInt(2) && newAmount <= averageAssets) {
      newAmount += averageAssets;
    }
    return newAmount;
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
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `grabId(${grabId})`,
        target: "giftTransactionRecipient",
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
    const jsbiTotalAsset = BigInt(totalGiftAssetNumber);
    const minAssets = BigInt(this.config.miniUnit);
    if (totalGrabableTimes === 1) {
      return jsbiTotalAsset;
    }
    const miniUnit = BigInt(0);
    const averageAsset = jsbiTotalAsset / BigInt(totalGrabableTimes);
    if (averageAsset === miniUnit) {
      return minAssets;
    }

    return averageAsset;
  }
  /**
   * 通用的红包交易金额计算器
   * @param grabId
   * @param giftTransactionInBlock
   */
  calcGrabGiftAssetNumber(
    grabId: string,
    giftTransaction: GiftAssetTransaction,
    blockSignatureBuffer: Uint8Array,
  ) {
    const giftAsset = giftTransaction.asset.giftAsset;
    switch (giftAsset.giftDistributionRule) {
      case GIFT_DISTRIBUTION_RULE.AVERAGE:
        return this.calcGrabAverageGiftAssetNumber(giftAsset.amount, giftAsset.totalGrabableTimes);
      case GIFT_DISTRIBUTION_RULE.RANDOM:
        return this.calcGrabRandomGiftAssetNumber(
          grabId,
          blockSignatureBuffer,
          giftTransaction.signatureBuffer,
          giftTransaction.senderId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
      case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
        return this.calcGrabRandomGiftAssetNumber(
          grabId,
          blockSignatureBuffer,
          giftTransaction.signatureBuffer,
          giftTransaction.senderId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
    }
  }

  /**基于gift交易以及要生成grab交易的账户信息，生成grabAsset */
  async generateGrabAsset(
    giftTransaction: GiftAssetTransaction,
    blockSignatureBuffer: Uint8Array,
    opts: BFChainCore.TransactionHelper.GenerateGrabAssetOptions,
  ) {
    const grabKeypair = await this.accountBaseHelper.createSecretKeypair(opts.mainSecret);
    const giftAsset = giftTransaction.asset.giftAsset;
    const {
      grabId = await this.accountBaseHelper.getAddressFromPublicKey(grabKeypair.publicKey),
      grabSecret,
    } = opts;
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
    });

    // 根据共识规则计算出能抢到的金额数量
    result.amount = (
      await this.calcGrabGiftAssetNumber(grabId, giftTransaction, blockSignatureBuffer)
    ).toString();

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

  /**
   * 在遇到被禁止的交易是，是否要中断
   * 默认是严格模式
   */
  @Inject(ABORT_FORBIDDEN_TRANSACTION_SYMBOL, { dynamics: true })
  abortForbiddenTransaction = true;

  /**
   * 对 transactionAssetChanges 进行排序
   *
   * @param transactionAssetChanges
   */
  sortTransactionAssetChanges<
    T extends TransactionAssetChangeModel | BFChainCore.TransactionAssetChangeJSON,
  >(transactionAssetChanges: T[]) {
    return transactionAssetChanges.sort((a, b) => {
      return a.accountType === b.accountType
        ? a.assetTypes > b.assetTypes
          ? 1
          : -1
        : a.accountType > b.accountType
        ? 1
        : -1;
    });
  }

  /**
   * 计算事件的查询范围
   *
   * @param currentBlockHeight 当前区块高度
   * @param config 配置文件
   */
  calcTransactionQueryRange(currentBlockHeight: number, config = this.config) {
    const startHeight = currentBlockHeight - config.maxApplyAndConfirmedBlockHeightDiff;
    return {
      startHeight: startHeight <= 0 ? 1 : startHeight,
      endHeight: currentBlockHeight - 1,
    };
  }

  /**
   * 计算事件的查询范围
   *
   * @param applyBlockHeight 事件的发起高度
   * @param currentBlockHeight 当前区块高度
   */
  calcTransactionQueryRangeByApplyBlockHeight(
    applyBlockHeight: number,
    currentBlockHeight: number,
  ) {
    return {
      startHeight: applyBlockHeight,
      endHeight: currentBlockHeight - 1,
    };
  }

  /**
   * 根据 entityId 获取 factoryId
   *
   * @param entityId
   * @returns
   */
  getFactoryIdByEntityId(entityId: string) {
    return entityId.split("_")[0];
  }

  /**
   * 根据资产名获取资产所属类型
   *
   * @param assetType
   * @returns
   */
  getParentAssetType(assetType: string) {
    const baseHelper = this.baseHelper;
    if (baseHelper.isValidAssetType(assetType)) {
      return PARENT_ASSET_TYPE.ASSETS;
    }
    if (baseHelper.isValidDAppId(assetType)) {
      return PARENT_ASSET_TYPE.DAPP;
    }
    if (baseHelper.isValidLocationName(assetType)) {
      return PARENT_ASSET_TYPE.LOCATION_NAME;
    }
    if (baseHelper.isValidEntityId(assetType)) {
      return PARENT_ASSET_TYPE.ENTITY;
    }
    return PARENT_ASSET_TYPE.ASSETS;
  }
}
