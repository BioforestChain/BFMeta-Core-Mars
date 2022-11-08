/// <reference lib="dom"/>
import { IpHelper } from "@bfchain/util";
import { Injectable } from "@bfchain/util-dep-inject";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { ParityBitHelper } from "@bfchain/core-helper-parity-bit";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { RANGE_TYPE, PARITY_BIT_MAPPING, RECORD_TYPE } from "@bfchain/core-model-constants";

@Injectable()
export class BaseHelper {
  constructor(
    private accountBaseHelper: AccountBaseHelper,
    private configHelper: ConfigHelper,
    private ipHelper: IpHelper,
    private parityBitHelper: ParityBitHelper,
    private jsbiHelper: JSBIHelper,
  ) {}

  isIp(ip: string) {
    return this.ipHelper.isIp(ip);
  }

  isIpV4(ipV4: string) {
    return this.ipHelper.isIpV4(ipV4);
  }

  isIpV6(ipV6: string) {
    return this.ipHelper.isIpV6(ipV6);
  }

  /**
   * 是否是经度,（-180，+180）：负坐标表示西半球，正坐标标识东半球
   *
   * @param lon
   * @returns
   */
  isLongitude(lon: string) {
    return /^[\-\+]((0(\.\d{1,10})?)|(([1,9](\d)?)(\.\d{1,10})?)|(1[0-7]\d{1}(\.\d{1,10})?)|(180(\.0{1,10})?))$/.test(
      lon,
    );
  }

  /**
   * 是否是纬度，（-90，+90）：负坐标标识南半球，正坐标表示北半球
   *
   * @param lat
   * @returns
   */
  isLatitude(lat: string) {
    return /^[\-\+]((0(\.\d{1,10})?)|([1,9](\.\d{1,10})?)|([1-8]\d?(\.\d{1,10})?)|(90(\.0{1,10})?))$/.test(
      lat,
    );
  }

  /**
   * 是否是域名
   *
   * @param dns
   * @returns
   */
  isDNS(dns: string) {
    return /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/.test(
      dns,
    );
  }

  /**
   * 是否是电子邮箱
   *
   * @param email
   * @returns
   */
  isEmail(email: string) {
    if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email)) {
      return false;
    }
    return [
      "qq.com",
      "163.com",
      "vip.163.com",
      "263.net",
      "yeah.net",
      "sohu.com",
      "sina.cn",
      "sina.com",
      "eyou.com",
      "gmail.com",
      "hotmail.com",
      "42du.cn",
    ].includes(email.substring(email.indexOf("@") + 1));
  }

  /**
   * 是否是合法的位名解析值
   *
   * @param record
   */
  async isValidLocationNameRecord(record: BFChainCore.LocationNameRecordJSON) {
    if (!this.isObject(record)) {
      return false;
    }
    const { recordType, recordValue } = record;
    if (recordType === undefined || recordValue === undefined) {
      return false;
    }
    if (!this.isString(recordValue)) {
      return false;
    }
    if (recordType === RECORD_TYPE.UNKNOWN) {
      return true;
    }
    if (recordType === RECORD_TYPE.IPV4) {
      return this.isIpV4(recordValue);
    }
    if (recordType === RECORD_TYPE.IPV6) {
      return this.isIpV6(recordValue);
    }
    if (recordType === RECORD_TYPE.LNG_LAT) {
      const items = recordValue.split(",");
      if (items.length !== 2) {
        return false;
      }
      return this.isLongitude(items[0]) && this.isLatitude(items[1]);
    }
    if (recordType === RECORD_TYPE.ADDRESSV1) {
      return await this.accountBaseHelper.isAddress(recordValue);
    }
    if (recordType === RECORD_TYPE.LOCATION_NAME) {
      return this.isValidLocationName(recordValue);
    }
    if (recordType === RECORD_TYPE.DNS) {
      return this.isDNS(recordValue);
    }
    if (recordType === RECORD_TYPE.EMAIL) {
      return this.isEmail(recordValue);
    }
    if (recordType === RECORD_TYPE.URL) {
      return this.isURL(recordValue);
    }
    return false;
  }

  /**
   * 接收范围是否合法
   *
   * @param range
   */
  async isValidRange(rangeType: RANGE_TYPE, range: string[]) {
    if (
      rangeType !== RANGE_TYPE.EMPTY &&
      rangeType !== RANGE_TYPE.MULTI_ADDRESS &&
      rangeType !== RANGE_TYPE.MULTI_DAPPID &&
      rangeType !== RANGE_TYPE.MULTI_LOCATION_NAME
    ) {
      return false;
    }
    if (!this.isArray(range)) {
      return false;
    }
    if (rangeType === RANGE_TYPE.EMPTY) {
      if (range.length !== 0) {
        return false;
      }
    } else {
      if (range.length === 0) {
        return false;
      }
      switch (rangeType) {
        case RANGE_TYPE.MULTI_ADDRESS:
          for (const item of range) {
            if (!(await this.accountBaseHelper.isAddress(item))) {
              return false;
            }
          }
          break;
        case RANGE_TYPE.MULTI_DAPPID:
          for (const item of range) {
            if (!this.isValidDAppId(item)) {
              return false;
            }
          }
          break;
        case RANGE_TYPE.MULTI_LOCATION_NAME:
          for (const item of range) {
            if (!this.isValidLocationName(item)) {
              return false;
            }
          }
          break;
        default:
          return false;
      }
    }

    return true;
  }

  /**
   * 密码公钥是否合法
   *
   * @param cipherPublicKeys
   */
  isValidCipherPublicKeys(cipherPublicKeys: string[]) {
    if (!this.isArray(cipherPublicKeys)) {
      return false;
    }
    for (const cipherPublicKey of cipherPublicKeys) {
      if (!this.isValidPublicKey(cipherPublicKey)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 是否是一个合法的账号签名
   *
   * @param accountSignature
   */
  isValidAccountSignature(accountSignature: BFChainCore.AccountSignatureJSON | undefined) {
    if (!accountSignature) {
      return false;
    }

    if (!this.isObject(accountSignature)) {
      return false;
    }

    const { publicKey, signature, secondPublicKey, signSignature } = accountSignature;
    if (!(this.isValidPublicKey(publicKey) && this.isValidSignature(signature))) {
      return false;
    }

    if ((secondPublicKey && !signSignature) || (!secondPublicKey && signSignature)) {
      return false;
    }

    if (secondPublicKey && signSignature) {
      if (!(this.isValidPublicKey(secondPublicKey) && this.isValidSignature(signSignature))) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取输入值的类型
   *
   * @param variable
   */
  getVariableType(variable: any) {
    return Object.prototype.toString.call(variable);
  }

  /**
   * 判断是否是一个 boolean 值
   *
   * @param value
   */
  isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  /**
   * 判断输入值是否是非负整数
   *
   * @param value
   */
  isNaturalNumber(value: any): value is number {
    return Number.isInteger(value) && value >= 0;
  }

  /**uint32的最大数值 */
  MAX_UINT_32_INTEGER = 2 ** 32;

  /**判断输入值是否是合法的uint32数值 */
  isUint32(value: any): value is number {
    return this.isNaturalNumber(value) && value < this.MAX_UINT_32_INTEGER;
  }

  /**uint32的最大数值 */
  MAX_INT_32_INTEGER = 2 ** 31 - 1;
  /**uint32的最大数值 */
  MIN_INT_32_INTEGER = -(2 ** 31);

  /**判断输入值是否是合法的uint32数值 */
  isInt32(value: any): value is number {
    return (
      Number.isInteger(value) && value < this.MAX_INT_32_INTEGER && value > this.MIN_INT_32_INTEGER
    );
  }

  /**判读是否是非空的`Uint8Array` */
  isNoEmptyUint8Array(value: any): value is Uint8Array {
    return value instanceof Uint8Array && value.length > 0;
  }

  /**
   * 判断输入值是否是正整数
   *
   * @param value
   */
  isPositiveInteger(value: any): value is number {
    return Number.isInteger(value) && value > 0;
  }

  /**
   * 判断输入值是否是满足条件
   *
   * @param value
   */
  isPositiveFloatMatchCondition<R extends boolean, T = any>(
    value: T,
    condition: (value: number) => R,
  ) {
    let num_val: number = value as any;
    // 对Fraction的支持
    if (
      value &&
      typeof (value as any).denominator === "number" &&
      typeof (value as any).numerator === "number"
    ) {
      // 分母不能为 0
      if ((value as any).denominator === 0) {
        return false;
      }
      num_val = (value as any).numerator / (value as any).denominator;
    }
    if (Number.isNaN(num_val)) {
      return false;
    }
    return condition(num_val);
  }

  /**
   * 判断输入值是否是非负浮点数，包含 0
   *
   * @param value
   */
  isPositiveFloatContainZero(value: unknown): value is number {
    return this.isPositiveFloatMatchCondition(value, (v) => v >= 0);
  }

  /**
   * 判断输入值是否是正浮点数，不包含 0
   *
   * @param value
   */
  isPositiveFloatNotContainZero(value: unknown): value is number {
    return this.isPositiveFloatMatchCondition(value, (v) => v > 0);
  }

  /**
   * 判断输入值是否是满足条件
   *
   * @param value
   */
  isPositiveBigFloatMatchCondition<R extends boolean>(
    value: any,
    condition: (value: {
      /**分子 */
      numerator: string;
      /**分母 */
      denominator: string;
    }) => R,
  ): value is {
    /**分子 */
    numerator: string;
    /**分母 */
    denominator: string;
  } {
    // 对Fraction的支持
    if (!(value && typeof value.denominator === "string" && typeof value.numerator === "string")) {
      return false;
    }
    // 分母不能为 0
    if (value.denominator === "0") {
      return false;
    }
    return condition(value);
  }

  /**
   * 判断输入值是否是非负浮点数，包含 0
   *
   * @param value
   */
  isPositiveBigFloatContainZero(value: unknown): value is {
    /**分子 */
    numerator: string;
    /**分母 */
    denominator: string;
  } {
    return this.isPositiveBigFloatMatchCondition(
      value,
      (v) =>
        this.jsbiHelper.compareFraction(v, {
          numerator: 0,
          denominator: 888,
        }) >= 0,
    );
  }

  /**
   * 判断输入值是否是正浮点数，不包含 0
   *
   * @param value
   */
  isPositiveBigFloatNotContainZero(value: unknown): value is {
    /**分子 */
    numerator: string;
    /**分母 */
    denominator: string;
  } {
    return this.isPositiveBigFloatMatchCondition(
      value,
      (v) =>
        this.jsbiHelper.compareFraction(v, {
          numerator: 0,
          denominator: 888,
        }) > 0,
    );
  }

  /**
   * 判断输入数据是否是一个分数
   *
   * @param value
   */
  isFraction(value: any): value is BFChainCore.FractionJSON {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    if (!(value.numerator && value.denominator)) {
      return false;
    }
    const denominator = BigInt(value.denominator);
    const minNumber = BigInt(0);
    if (denominator === minNumber) {
      return false;
    }
    return true;
  }

  /**
   * 判断输入数据是否是一个可作为BigInt的值
   * @param value
   */
  isFiniteBigInt(value: unknown): value is number | bigint | string {
    try {
      BigInt(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 判断是否为空对象
   * @param {*} e
   */
  isEmptyObject(e: unknown): e is object {
    if (!this.isObject(e)) return false;
    let t;
    for (t in e) return false;
    return true;
  }

  /**
   * 快速判断两个数组是否相等
   * @param a
   * @param b
   */
  isArrayEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  /**hex字符串或者buffer长度是否合法 */
  isValidBufferSize(buffer_or_string: unknown, buffer_length: number) {
    if (buffer_or_string instanceof Uint8Array) {
      return buffer_or_string.length === buffer_length;
    }
    if (this.isString(buffer_or_string)) {
      if (buffer_or_string.length === buffer_length * 2) {
        for (let i = 0; i < buffer_or_string.length; i += 1) {
          let c = buffer_or_string[i];
          return c >= "0" && c <= "f";
        }
      }
    }
    return false;
  }

  /**
   * 判断公钥是否合法
   *
   */
  isValidPublicKey(publicKey: unknown) {
    return this.isValidBufferSize(publicKey, 32);
  }

  /**
   * 判断公钥是否合法
   *
   */
  isValidSecondPublicKey = this.isValidPublicKey;

  /**
   * 判断公钥是否合法
   *
   */
  isValidSecretKey(secretKey: unknown) {
    return this.isValidBufferSize(secretKey, 64);
  }

  /**
   * 是否是一个字符串
   *
   * @param str
   */
  isString(str: unknown): str is string {
    return typeof str === "string";
  }

  /**
   * 是否是一个 16 进制字符串
   *
   * @param str
   * @returns
   */
  isHexString(str: unknown): str is string {
    return typeof str === "string" && /^[A-F0-9]+$/i.test(str);
  }

  /**
   * 是否是一个数组
   *
   * @param arr
   */
  isArray(arr: unknown): arr is any[] {
    return this.getVariableType(arr) === "[object Array]";
  }

  /**
   * 是否是一个对象
   *
   * @param obj
   */
  isObject(obj: unknown): obj is Object {
    return this.getVariableType(obj) === "[object Object]";
  }

  /**
   * 是否是一个合法的图片格式
   * @FIXME
   * @param img
   */
  isImage(img: unknown) {
    return this.isString(img);
  }

  /**
   * 是否是一个合法的URL
   * @param url
   */
  isURL(url: unknown): url is string {
    try {
      if (this.isString(url)) {
        const url_info = new URL(url);
        return url_info.hostname !== "";
      }
    } catch {}
    return false;
  }

  /**
   * 交易 signature 是否合法
   *
   * @param signature
   */
  isValidTransactionSignature(signature: string) {
    return this.isValidSignature(signature);
  }

  /**
   * 区块 signature 是否合法
   *
   * @param signature
   */
  isValidBlockSignature(signature: string) {
    return this.isValidSignature(signature);
  }

  /**
   * 签名是否合法
   *
   * @param signature
   */
  isValidSignature(signature: any) {
    return this.isValidBufferSize(signature, 64);
  }

  /**
   * 链上链 hash 是否合法
   *
   * @param hash
   */
  isValidChainOnChainHash(hash: any) {
    return this.isValidBufferSize(hash, 32);
  }

  /**
   * 大写链名
   *
   * @param chainName
   */
  isValidUpperChainName(chainName: string) {
    if (!this.isString(chainName)) {
      return false;
    }
    return /^[A-Z]{5,10}$/.test(chainName);
  }

  /**
   * 链名是否合法：小写字母 5-10
   *
   * @param chainName
   */
  isValidChainName(chainName: string) {
    if (!this.isString(chainName)) {
      return false;
    }
    return /^[a-z]{5,10}$/.test(chainName);
  }

  /**
   * 链资产名是否合法：大写字母 3-8
   *
   * @param assetType
   */
  isValidAssetType(assetType: string) {
    if (!this.isString(assetType)) {
      return false;
    }
    return /^[A-Z]{3,8}$/.test(assetType);
  }

  /**
   * 链网络标识符是否合法：大写字母、数字 6 位，最后一位是校验位
   *
   * @param magic
   */
  isValidChainMagic(magic: string) {
    if (!this.isString(magic)) {
      return false;
    }
    if (!/^[A-Z0-9]{5}$/.test(magic)) {
      return false;
    }
    const realMagic = magic.slice(0, 4);
    const parityBit = magic.slice(4);
    const parityBitCode = this.parityBitHelper.calcParityBit(realMagic);
    const mapKey = `P_${parityBitCode}` as BFChainCore.PARITY_BIT_MAPPING;
    if (PARITY_BIT_MAPPING[mapKey] === undefined) {
      return false;
    }
    return PARITY_BIT_MAPPING[mapKey].toString() === parityBit;
  }

  /**
   * 交易类型是否合法
   *
   * @param type
   */
  isValidTransactionType(type: string) {
    if (!this.isString(type)) {
      return false;
    }
    const strArray = type.split("-");
    if (strArray.length !== 4) {
      return false;
    }
    if (!this.isValidAssetType(strArray[0])) {
      return false;
    }
    if (!this.isValidUpperChainName(strArray[1])) {
      return false;
    }
    const baseType = strArray[2];
    if (!(baseType === baseType.trim().toUpperCase() && baseType.length === 3)) {
      return false;
    }
    const serialNumber = strArray[3];
    if (!(/^[0-9]+$/.test(serialNumber) && serialNumber.length === 2)) {
      return false;
    }
    return true;
  }

  /**
   * dappid 是否合法：大写字母、数字 8 位，最后一位是校验位
   *
   * @param dappid
   */
  isValidDAppId(dappid: string) {
    if (!this.isString(dappid)) {
      return false;
    }
    if (!/^[A-Z0-9]{8}$/.test(dappid)) {
      return false;
    }
    const realDAppid = dappid.slice(0, 7);
    const parityBit = dappid.slice(7);
    const parityBitCode = this.parityBitHelper.calcParityBit(realDAppid);
    const mapKey = `P_${parityBitCode}` as BFChainCore.PARITY_BIT_MAPPING;
    if (PARITY_BIT_MAPPING[mapKey] === undefined) {
      return false;
    }
    return PARITY_BIT_MAPPING[mapKey].toString() === parityBit;
  }

  /**
   * 是否是合法的创世受托人名
   *
   * 大小写字母、数字、下划线 1-20
   *
   * @param username
   */
  isValidGenesisUsername(username: any) {
    if (!this.isString(username)) {
      return false;
    }
    return /^[A-Za-z0-9_]{1,20}$/.test(username);
  }

  /**
   * 用户名是否合法
   *
   * 不能包含本链名
   * 只能由大小写字母、数字、下划线 1-20
   *
   * @param username
   */
  isValidUsername(username: string, chainName = this.configHelper.chainName) {
    if (!this.isValidGenesisUsername(username)) {
      return false;
    }
    if (username.toLowerCase().includes(chainName)) {
      return false;
    }
    return true;
  }

  /**
   * 数字组成
   *
   * @param stringNumber
   */
  isMakeUpWithNumber(stringNumber: string) {
    return /^(([0-9])|([1-9](\d)+?))$/.test(stringNumber);
  }

  /**
   * 是否时是数字组成的字符串
   *
   * @param stringNumber
   */
  isValidStringNumber(stringNumber: any) {
    if (!this.isString(stringNumber)) {
      return false;
    }
    return this.isMakeUpWithNumber(stringNumber);
  }

  isPositiveStringNumber(stringNumber: any) {
    return this.isValidStringNumber(stringNumber) && BigInt(stringNumber) > BigInt(0);
  }

  /**资产数量是否合法： 只能是数字组成的字符串 */
  isValidAssetNumber = this.isValidStringNumber;

  /**权益数量是否合法： 只能是数字组成的字符串 */
  isValidAccountEquity = this.isValidStringNumber;

  /**区块的参与度是否合法： 只能是数字组成的字符串 */
  isValidBlockParticipation = this.isValidStringNumber;

  /**权益比例是否合法： 只能是数字组成的字符串 */
  isValidEquityRate = this.isValidStringNumber;

  /**权益数量是否合法： 只能是数字组成的字符串 */
  isValidAssetPrealnum = this.isValidStringNumber;

  /**
   * 位名是否合法
   * 总位名最大长度 1024
   * 不能以 . 开头或结尾
   * 只能包含大小写字母、数字、.
   * 顶级位名只能是小写字母，多级位名每级只能是大小写字母、数字
   * 每级位名的最大长度 128
   *
   * @param name
   */
  isValidLocationName(name: string, chainName = this.configHelper.chainName) {
    if (!this.isString(name)) {
      return false;
    }
    // 位名总长度不大于 1024
    if (name.length > 1024) {
      return false;
    }
    // 不能以 . 开头或结尾
    if (this.isStartWithOrEndWithPoint(name)) {
      return false;
    }
    const names = name.split(".");
    const len = names.length;
    if (len < 2) {
      return false;
    }

    for (let i = 0; i < len; i++) {
      const item = names[i];
      if (item.length > 128) {
        return false;
      }
      if (i === len - 2) {
        if (!this.isLowerCaseLetter(item)) {
          return false;
        }
      } else if (i === len - 1) {
        // 根位名必须是本链链名
        if (item !== chainName) {
          return false;
        }
      } else {
        if (item.length <= 2) {
          if (!this.isLowerCaseLetterOrNumber(item)) {
            return false;
          }
        } else {
          if (!this.isLowerCaseLetterOrNumberOrUnderline(item)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  isValidNumber(data: number) {
    const dataString = data.toString();
    if (dataString.length > 1) {
      if (dataString.startsWith("0")) {
        return false;
      }
    }
    return true;
  }

  /**
   * 端口号是否合法
   *
   * @param port
   */
  isValidPort(port: any): port is number {
    return !Number.isNaN(port) && this.isValidNumber(port) && port > 0 && port < 65536;
  }

  /**
   * 链端口号是否合法
   * 不能是空对象
   * 必须包含默认端口和节点扫描端口
   * 端口号 大于 0 小于 65536
   *
   * @param ports
   */
  isValidChainPorts(ports: any) {
    if (this.isEmptyObject(ports)) {
      return false;
    }

    return this.isValidPort(ports.port) && this.isValidPort(ports.scan_peer_port);
  }

  /**
   * 奖励比例是否合法
   * 不能是空对象
   * 必须要有投票奖励比例和打块奖励比例
   * 比例之和必须等于 1
   *
   * @param rewardPercent
   */
  isValidChainRewardPercent(rewardPercent: any) {
    if (this.isEmptyObject(rewardPercent)) {
      return false;
    }
    if (!(rewardPercent.votePercent && rewardPercent.forgePercent)) {
      return false;
    }
    const votePercent = rewardPercent.votePercent;
    const forgePercent = rewardPercent.forgePercent;
    if (
      !(
        this.isPositiveFloatNotContainZero(votePercent.denominator) &&
        this.isPositiveFloatNotContainZero(forgePercent.denominator)
      )
    ) {
      return false;
    }
    if (votePercent.denominator !== forgePercent.denominator) {
      return false;
    }
    const denominator = votePercent.denominator;
    if (votePercent.numerator + forgePercent.numerator !== denominator) {
      return false;
    }
    return true;
  }

  /**
   * 链奖励里程是否合法
   * 不能是空对象
   * 必须包含里程高度数组和里程奖励数组
   * 里程高度数组中每个值只能是数字，并且下一个里程高度大于上一个里程高度
   * 里程奖励数组中每个值只能是字符串，并且是一个合法的资产数量
   * 里程奖励数组长度和里程高度数组长度相差 1
   *
   * @param milestones
   */
  isValidChainRewardMilestones(milestones: any): milestones is BFChainCore.RewardPerBlockJSON {
    if (!(milestones && milestones.heights && milestones.rewards)) {
      return false;
    }
    const heights = milestones.heights;
    const rewards = milestones.rewards;
    if (!(this.isArray(heights) && this.isArray(rewards))) {
      return false;
    }
    const hlen = heights.length;
    const rlen = rewards.length;
    if (hlen < 1) {
      return false;
    }
    if (rlen < 2) {
      return false;
    }
    if (rlen - hlen !== 1) {
      return false;
    }
    if (rewards[rlen - 1] !== "0") {
      return false;
    }
    if (Number.isNaN(heights[0]) || !this.isValidNumber(heights[0])) {
      return false;
    }
    if (hlen > 1) {
      for (let i = 0; i < hlen - 1; i++) {
        if (Number.isNaN(heights[i + 1]) || !this.isValidNumber(heights[i + 1])) {
          return false;
        }
        if (heights[i] >= heights[i + 1]) {
          return false;
        }
      }
    }
    for (let i = 0; i < rlen; i++) {
      if (!this.isValidAssetNumber(rewards[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * 是否是纯大写
   *
   * @param value
   */
  isUpperCaseString(value: any): value is string {
    return this.isString(value) && value === value.trim().toUpperCase();
  }

  /**
   * 是否是纯小写
   *
   * @param value
   */
  isLowerCaseString(value: any): value is string {
    return this.isString(value) && value === value.trim().toLowerCase();
  }

  /**
   * 是否是科学计数法
   *
   * @param value
   */
  isScientificCounting(value: string) {
    return value.includes(".") || value.includes("e");
  }

  /**
   * 是否时纯小写字母
   *
   * @param value
   */
  isLowerCaseLetter(value: string) {
    return this.isString(value) && /^[a-z]+$/.test(value);
  }

  /**
   * 是否时纯大写字母
   *
   * @param value
   */
  isUpperCaseLetter(value: string) {
    return this.isString(value) && /^[A-Z]+$/.test(value);
  }

  /**
   * 是否是大写字母或数字
   *
   * @param value
   */
  isUpperCaseLetterOrNumber(value: string) {
    return this.isString(value) && /^[A-Z0-9]+$/.test(value);
  }

  /**
   * 是否是纯大小写字母
   *
   * @param value
   */
  isUpperCaseOrLowerCaseLetter(value: string) {
    return this.isString(value) && /^[A-Za-z]+$/.test(value);
  }

  /**
   * 是否是大小写字母或数字
   *
   * @param value
   */
  isUpperCaseOrLowerCaseLetterOrNumber(value: string) {
    return this.isString(value) && /^[A-Za-z0-9]+$/.test(value);
  }

  /**
   * 是否以点开头或结尾
   *
   * @param value
   */
  isStartWithOrEndWithPoint(value: string) {
    return !/^[^\.].*[^\.]$/.test(value);
  }

  /**
   * 小写字母或数字
   *
   * @param value
   */
  isLowerCaseLetterOrNumber(value: string) {
    return /^[a-z0-9]+$/.test(value);
  }

  /**
   * 字母或数字开头，内容可包含下划线，字母或数字开头
   *
   * @param value
   */
  isLowerCaseLetterOrNumberOrUnderline(value: string) {
    return /^[a-z0-9][a-z0-9_]*[a-z0-9]+$/.test(value);
  }

  /**
   * 手续费比例是否合法
   *
   * @param feeRate
   */
  isValidFeeRate(feeRate: BFChainCore.FeeRateJSON) {
    if (!feeRate) {
      return false;
    }
    const senderPaidFeeRate = feeRate.senderPaidFeeRate;
    const recipientPaidFeeRate = feeRate.recipientPaidFeeRate;
    if (!this.isPositiveFloatContainZero(senderPaidFeeRate)) {
      return false;
    }

    if (!this.isPositiveFloatContainZero(recipientPaidFeeRate)) {
      return false;
    }
    if (!(senderPaidFeeRate.denominator === 1 && recipientPaidFeeRate.denominator === 1)) {
      return false;
    }
    const isValid =
      (senderPaidFeeRate.numerator === 1 && recipientPaidFeeRate.numerator === 0) ||
      (senderPaidFeeRate.numerator === 0 && recipientPaidFeeRate.numerator === 1);
    if (!isValid) {
      return false;
    }
    return true;
  }

  isValidAccountParticipationWeightRatio(
    accountParticipationWeightRatio: BFChainCore.AccountParticipationWeightRatioJSON,
  ) {
    if (!accountParticipationWeightRatio) {
      return false;
    }
    const { balanceWeight, numberOfTransactionsWeight } = accountParticipationWeightRatio;
    return this.isNaturalNumber(balanceWeight) && this.isNaturalNumber(numberOfTransactionsWeight);
  }

  isValidBlockParticipationWeightRatio(
    blockParticipationWeightRatio: BFChainCore.BlockParticipationWeightRatioJSON,
  ) {
    if (!blockParticipationWeightRatio) {
      return false;
    }
    const { balanceWeight, numberOfTransactionsWeight } = blockParticipationWeightRatio;
    return this.isNaturalNumber(balanceWeight) && this.isNaturalNumber(numberOfTransactionsWeight);
  }

  /**
   * 兑换比例是否合法
   *
   * @param rate
   */
  isValidRate(rate: BFChainCore.RateJSON<any>) {
    if (!rate) {
      return false;
    }
    const prevWeight = rate.prevWeight;
    const nextWeight = rate.nextWeight;
    try {
      const x = BigInt(prevWeight);
      const y = BigInt(nextWeight);
      if (x === BigInt(0) || y === BigInt(0)) {
        return false;
      }
      return typeof nextWeight === typeof prevWeight;
    } catch (err) {
      return false;
    }
  }

  /**
   * 兑换比例是否合法
   *
   * @param rate
   */
  isValidAssetExchangeWeightRatio(rate: BFChainCore.AssetExchangeWeightRatioJSON) {
    if (!rate) {
      return false;
    }
    const { toExchangeAssetWeight, beExchangeAssetWeight } = rate;
    if (
      !(
        this.isValidStringNumber(rate.toExchangeAssetWeight) &&
        this.isValidStringNumber(rate.beExchangeAssetWeight)
      )
    ) {
      return false;
    }
    if (toExchangeAssetWeight === "0" || beExchangeAssetWeight === "0") {
      return false;
    }
    return true;
  }

  /**
   * tpow 计算公式是否合法
   *
   * @param tpowDiffFormula
   */
  isValidTpowDiffFormula(tpowDiffFormula: string) {
    return true;
  }

  /**
   * factoryId 是否合法，小写字母或数字，3-15 个字符
   *
   * @param factoryId
   * @returns
   */
  isValidEntityFactoryId(factoryId: string) {
    if (!this.isString(factoryId)) {
      return false;
    }

    return /^[a-z0-9]{3,15}$/.test(factoryId);
  }

  /**
   * entityId 是否合法，小写字母或数字，3-30 个字符
   *
   * @param entityId
   * @returns
   */
  isValidEntityId(entityId: string) {
    if (!this.isString(entityId)) {
      return false;
    }

    const entitys = entityId.split("_");
    if (entitys.length !== 2 && entitys.length !== 3) {
      return false;
    }

    const pattern = /^[a-z0-9]{3,30}$/;

    if (entitys.length === 3) {
      if (entitys[0] !== "m") {
        return false;
      }

      if (!this.isValidEntityFactoryId(entitys[1])) {
        return false;
      }

      return pattern.test(entitys[2]);
    }

    if (!this.isValidEntityFactoryId(entitys[0])) {
      return false;
    }

    return pattern.test(entitys[1]);
  }

  /**
   * tIndexRanges 是否合法
   *
   * @param tIndexRanges
   */
  isValidTindexRanges(tIndexRanges: number[]) {
    const len = tIndexRanges.length;
    if (len === 0) {
      return false;
    }
    if (len % 2 !== 0) {
      return false;
    }
    if (!this.isNaturalNumber(tIndexRanges[0])) {
      return false;
    }
    for (let i = 1; i < len; i++) {
      if (!this.isPositiveInteger(tIndexRanges[i])) {
        return false;
      }
    }
    return true;
  }
}
