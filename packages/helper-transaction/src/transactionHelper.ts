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
import { Injectable, Inject } from "@bfchain/util-dep-inject";
import { decodeBinaryToHex } from "@bfchain/util-encoding-hex";
import { cacheGetter } from "@bfchain/util-decorator";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { TRANSACTION_FILTER_SYMBOL, ABORT_FORBIDDEN_TRANSACTION_SYMBOL } from "./const";
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
  /**SIGN_FOR_ASSET: 签收资产委托 */
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
  /**LOCATION_NAME：注册/注销链域名 */
  get LOCATION_NAME() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.LOCATION_NAME);
  }
  /** SET_LNS_RECORD_VALUE: 设置链域名解析值 */
  get SET_LNS_RECORD_VALUE() {
    return this.getTransactionType(TRANSACTION_TYPES_BASE.SET_LNS_RECORD_VALUE);
  }
  /** SET_LNS_MANAGER: 设置链域名管理员 */
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
    const hash = await this.cryptoHelper.sha256().update(transaction.getBytes(true, true)).digest();
    // 验证 signature 与 publicKey
    if (!(await this.keypairHelper.detached_verify(hash, signatureBuffer, senderPublicKeyBuffer))) {
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
          !(await this.keypairHelper.detached_verify(
            shash,
            signSignatureBuffer,
            senderSecondPublicKeyBuffer,
          ))
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
    const remarkSize = templateRemark.getBytes().length;
    if (remarkSize > maxBlockRemarkSize) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: `remarkSize ${remarkSize}`,
        target: "transaction",
        field: maxBlockRemarkSize,
      });
    }
  }
  /**
   * 校验交易的 remark 大小
   *
   * @param transaction
   */
  verifyTransactionSize<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS) {
    const { maxTransactionSize } = this.config;
    const trsSize = transaction.getBytes().length;
    if (trsSize > maxTransactionSize) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: `transactionSize ${trsSize}`,
        target: "transaction",
        field: maxTransactionSize,
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
      byte_num += min_fee.length - cur_fee.length;
      cur_fee = min_fee;
    } while (true);
  }
  private _cache_of_diff_numerator_BI = new Map<number, bigint>();
  private _cache_of_diff_BI = {
    num: -1,
    participation: "",
    diff_BI: BigInt(0),
  };

  @cacheGetter
  private get growthFactorBI(): BFChainCore.FractionJSON<bigint> {
    const { growthFactor } = this.config.genesisBlock.remark.transactionPowOfWorkConfig;
    return {
      numerator: BigInt(growthFactor.numerator),
      denominator: BigInt(growthFactor.denominator),
    };
  }
  @cacheGetter
  private get participationRatioBI(): BFChainCore.FractionJSON<bigint> {
    const { participationRatio } = this.config.genesisBlock.remark.transactionPowOfWorkConfig;
    return {
      numerator: BigInt(participationRatio.numerator),
      denominator: BigInt(participationRatio.denominator),
    };
  }
  @cacheGetter
  private get generateTotalAmountBI() {
    const { generateTotalAmount } = this.config.genesisBlock.remark;
    return BigInt(generateTotalAmount);
  }
  @cacheGetter
  private get MAX_SAFE_INTEGER_BI() {
    return BigInt(Number.MAX_SAFE_INTEGER);
  }
  @cacheGetter
  private get logGenerateTotalAmount() {
    return this.logBI(this.generateTotalAmountBI + BigInt(1));
  }
  logBI(num: bigint) {
    const { MAX_SAFE_INTEGER_BI } = this;
    const { MAX_SAFE_INTEGER } = Number;
    if (num <= MAX_SAFE_INTEGER_BI) {
      return Math.log(Number(num));
    }
    const rate = num / MAX_SAFE_INTEGER_BI;
    if (rate >= MAX_SAFE_INTEGER_BI) {
      throw new RangeError("log bigint out range.");
    }
    /**
     * @FIXME 这里一旦rate过大，就会带来log的精度问题。但过大的rate，会在其它地方带来更多问题，而不单单是这里
     */
    const rest = Number(num - rate * MAX_SAFE_INTEGER_BI) / MAX_SAFE_INTEGER;
    return Math.log(Number(rate) + rest) + Math.log(MAX_SAFE_INTEGER);
  }

  /**
   * 困难难度分水岭
   * 这里默认难度为150b/s
   */
  @cacheGetter
  private get hardDiffThresholdBI() {
    const blockPerRoundBI = BigInt(this.config.blockPerRound);
    const forgeIntervalBI = BigInt(this.config.forgeInterval);
    return (
      (BigInt(this.config.averageComputingPower) * forgeIntervalBI * blockPerRoundBI) /
      (blockPerRoundBI - BigInt(1))
    );
  }
  // /**计算难度基数 */
  // private calcDiffBaseFloat(num: number) {
  //   const { growthFactor } = this.config.genesisBlock.remark.transactionPowOfWorkConfig;

  //   /**(E ^ N) * N */
  //   return (Number(growthFactor.numerator) / Number(growthFactor.denominator)) ** num * num;
  // }
  /**计算难度基数 */
  private calcDiffBaseBI(num: number) {
    const { growthFactorBI } = this;
    /**难度基数的分子，这个只与num有关系，所以可以进行缓存 */
    let diff_numerator_BI = this._cache_of_diff_numerator_BI.get(num);
    if (!diff_numerator_BI) {
      const num_BI = BigInt(num);
      const growthFactor_numerator_BI = growthFactorBI.numerator;
      const growthFactor_denominator_BI = growthFactorBI.denominator;
      /**(E ^ N) */
      const BI_1 = growthFactor_numerator_BI ** num_BI / growthFactor_denominator_BI ** num_BI;
      diff_numerator_BI = BI_1 * num_BI;
      this._cache_of_diff_numerator_BI.set(num, diff_numerator_BI);
    }
    return diff_numerator_BI;
  }
  /**计算难度累积值 */
  private accDiffBaseBI(num: number) {
    const rest = num % 1;
    let accDiffBI = BigInt(0);
    for (let i = 0; i <= num; i++) {
      accDiffBI += this.calcDiffBaseBI(i);
    }
    if (rest !== 0) {
      accDiffBI += this.jsbiHelper.multiplyCeilFraction(
        this.calcDiffBaseBI(num - rest + 1),
        this.jsbiHelper.numberToFraction(rest),
      );
    }
    return accDiffBI;
  }

  calcTpowParticipationBI(txCount: number, txBalance: string) {
    return BigInt(txCount + 1) * BigInt(txBalance);
  }

  /**
   * 计算交易POW的难度
   */
  calcDiffOfTransactionProfOfWork(num: number, participation: string) {
    const { _cache_of_diff_BI, hardDiffThresholdBI } = this;
    let diff_BI: bigint;
    if (_cache_of_diff_BI.num === num && _cache_of_diff_BI.participation === participation) {
      diff_BI = _cache_of_diff_BI.diff_BI;
    } else {
      const { growthFactorBI, jsbiHelper } = this;
      /**难度基数的分子，这个只与num有关系，所以可以进行缓存 */
      let diff_numerator_BI = this._cache_of_diff_numerator_BI.get(num);
      if (!diff_numerator_BI) {
        const num_BI = BigInt(num);
        const growthFactor_numerator_BI = growthFactorBI.numerator;
        const growthFactor_denominator_BI = growthFactorBI.denominator;
        /**(E ^ N) */
        const BI_1 = growthFactor_numerator_BI ** num_BI / growthFactor_denominator_BI ** num_BI;
        diff_numerator_BI = BI_1 * num_BI;
        this._cache_of_diff_numerator_BI.set(num, diff_numerator_BI);
      }
      /// 如果难度基数是0，直接跳过后面的校验计算
      if (diff_numerator_BI === BigInt(0)) {
        return diff_numerator_BI;
      }

      //#region 基于拟合曲线算出来的难度倍数
      /**
       * 得出简单与困难 交易数 的分水岭
       */
      const easyTrsPreBlock = 1 / this.calcNeedOnlineTime(participation);
      const hardTrsPreBlock = easyTrsPreBlock + 1;

      const needWorkTimes: BFChainCore.FractionJSON<bigint> = {
        numerator: hardDiffThresholdBI,
        denominator: this.accDiffBaseBI(hardTrsPreBlock),
      };

      diff_BI = jsbiHelper.multiplyCeilFraction(diff_numerator_BI, needWorkTimes);

      _cache_of_diff_BI.num = num;
      _cache_of_diff_BI.participation = participation;
      _cache_of_diff_BI.diff_BI = diff_BI;
    }
    return diff_BI;
  }
  /**
   * 根据参与度计算一轮需要在线的时间
   * 0.2* Round ~ 1.3* Round
   */
  calcNeedOnlineTime(participation: string | number | bigint) {
    const { participationRatioBI } = this;
    /**
     * Tpow participation
     * 将参与度乘上参与度比重,并除以 1000 * 1e8 (x千个BFT)
     * 而后转为普通js数值,因为极值是>280,所以不用担心精度丢失的问题
     */
    const x =
      Number(this.jsbiHelper.multiplyCeilFraction(participation, participationRatioBI)) / 1e11;
    /**
     * Need Online Time
     * 计算出一轮需要在线时间
     */
    const y = 0.238536212611 / (1 - 0.7936005508148 * Math.E ** (-0.0847138128036 * x));
    return y;
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
    /**得分应该读取多少位数，至少8位 */
    const X = Math.max(
      Math.min(
        Math.ceil(Math.log2(Number(diff_BI * (BigInt(1) + diff_BI)))),
        signatureBuffer.length,
      ),
      8,
    );
    /**总共的分数 */
    const hit_numerator_BI = BigInt(2) << BigInt(X - 1);
    /**将分数基于diff来细分成diff份，得分必须小于最小的一份 */
    const max_score_BI = hit_numerator_BI / diff_BI;
    /**读取出交易的得分 */
    const score_BI = this.baseHelper.getUintN(this.Buffer.from(signatureBuffer), X);
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
    const jsbiTotalAsset = BigInt(totalGiftAssetNumber);
    if (totalGrabableTimes === 1) {
      return jsbiTotalAsset;
    }
    const { jsbiHelper } = this;
    const miniUnit = BigInt(0);
    const minAssets = BigInt(this.config.miniUnit);
    const averageAsset = jsbiTotalAsset / BigInt(totalGrabableTimes);
    if (averageAsset === miniUnit) {
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
    const maxAssets = averageAsset * BigInt(2);
    let amount = jsbiHelper.multiplyFloorFractionString(totalGiftAssetNumber, {
      numerator: grabAsset,
      denominator: BigInt(2) ** BigInt(128),
    });
    if (amount > maxAssets) {
      let newAmount = amount % maxAssets;
      if (amount > maxAssets * BigInt(2)) {
        if (newAmount <= averageAsset) {
          newAmount += averageAsset;
        }
      }
      amount = newAmount;
    }
    if (amount < minAssets) {
      amount = minAssets;
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

  /**
   * 在遇到被禁止的交易是，是否要中断
   * 默认是严格模式
   */
  @Inject(ABORT_FORBIDDEN_TRANSACTION_SYMBOL, { dynamics: true })
  abortForbiddenTransaction = true;
}
