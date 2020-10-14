# pc 端交易验证和处理逻辑

## @bfchain/core 区块链核心包

- 基础校验函数

  ```
      /**
      * 接收范围是否合法
      *
      * @param range
      */
      async isValidRange(rangeType: RANGE_TYPE, range: string[]) {
          if (!RANGE_TYPE[rangeType]) {
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
                          if (!await this.accountBaseHelper.isAddress(item)) {
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
                          if (!this.isValidLnsName(item)) {
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
      isValidAccountSignature(accountSignature: any) {
          if (!this.isObject(accountSignature)) {
              return false;
          }

          const { publicKey, signature } = accountSignature;
          if (!(this.isValidPublicKey(publicKey) && this.isValidSignature (signature))) {
              return false;
          }
          return true;
      }

      /**
      * 第三方签名是否合法
      *
      * @param thirdPartySignatures
      */
      isValidThirdPartySignatures(thirdPartySignatures: any) {
          if (!this.isArray(thirdPartySignatures)) {
              return false;
          }
          for (const thirdPartySignature of thirdPartySignatures) {
              if (!this.isValidAccountSignature(thirdPartySignature)) {
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
          typeof (value as any)["denominator"] === "number" &&
          typeof (value as any)["numerator"] === "number"
          ) {
              num_val = (value as any)["numerator"] / (value as any)["denominator"];
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
      isPositiveFloatContainZero(value: any): value is number {
          return this.isPositiveFloatMatchCondition(value, v => v >= 0);
      }

      /**
      * 判断输入值是否是正浮点数，不包含 0
      *
      * @param value
      */
      isPositiveFloatNotContainZero(value: any): value is number {
          return this.isPositiveFloatMatchCondition(value, v => v > 0);
      }

      /**
      * 判断输入数据是否是一个分数
      *
      * @param value
      */
      isFraction(value: any): value is BFChainCore.FractionJSON {
          if (!(value.numerator && value.denominator)) {
              return false;
          }
          const denominator = JSBI.BigInt(value.denominator);
          const minNumber = JSBI.BigInt(0);
          if (JSBI.equal(denominator, minNumber)) {
              return false;
          }
          return true;
      }

      /**
      * 判断输入数据是否是一个可作为BigInt的值
      * @param value
      */
      isFiniteBigInt(value: any): value is JSBI | number | bigint | string {
          try {
              JSBI.BigInt(value);
              return true;
          } catch {
              return false;
          }
      }

      /**
      * 判断是否为空对象
      * @param {*} e
      */
      isEmptyObject(e: any): e is object {
          if (!this.isObject(e)) return false;
          var t;
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
      isValidBufferSize(buffer_or_string: any, buffer_length: number) {
          if (buffer_or_string instanceof Uint8Array) {
              return buffer_or_string.length === buffer_length;
          }
          if (this.isString(buffer_or_string)) {
              if (buffer_or_string.length === buffer_length * 2) {
                  for (var i = 0; i < buffer_or_string.length; i += 1) {
                      var c = buffer_or_string[i];
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
      isValidPublicKey(publicKey: any) {
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
      isValidSecretKey(secretKey: any) {
          return this.isValidBufferSize(secretKey, 64);
      }

      /**
      * 是否是一个字符串
      *
      * @param str
      */
      isString(str: any): str is string {
          return typeof str === "string";
      }

      /**
      * 是否是一个数组
      *
      * @param arr
      */
      isArray(arr: any): arr is Array<any> {
          return this.getVariableType(arr) === "[object Array]";
      }

      /**
      * 是否是一个对象
      *
      * @param obj
      */
      isObject(obj: any): obj is Object {
          return this.getVariableType(obj) === "[object Object]";
      }

      /**
      * 是否是一个合法的图片格式
      * @FIXME
      * @param img
      */
      isImage(img: any) {
          return this.isString(img);
      }

      /**
      * 是否是一个合法的URL
      * @param url
      */
      isURL(url: any): url is string {
          try {
              if (this.isString(url)) {
                  const url_info = new URL(url);
                  return url_info.hostname !== "";
              }
          } catch {}
          return false;
      }

      /**
      * 返回 ip 检测正则
      *
      */
      ipRegex() {
          const v4 =
          "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}";

          const v6seg = "[a-fA-F\\d]{1,4}";
          const v6 = `
          (
          (?:${v6seg}:){7}(?:${v6seg}|:)|                                // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
          (?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)|                         // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
          (?:${v6seg}:){5}(?::${v4}|(:${v6seg}){1,2}|:)|                 // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
          (?:${v6seg}:){4}(?:(:${v6seg}){0,1}:${v4}|(:${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
          (?:${v6seg}:){3}(?:(:${v6seg}){0,2}:${v4}|(:${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
          (?:${v6seg}:){2}(?:(:${v6seg}){0,3}:${v4}|(:${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
          (?:${v6seg}:){1}(?:(:${v6seg}){0,4}:${v4}|(:${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
          (?::((?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))           // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
          )(%[0-9a-zA-Z]{1,})?                                           // %eth0            %1
          `
              .replace(/\s*\/\/.*$/gm, "")
              .replace(/\n/g, "")
              .trim();

          return {
              isIP: new RegExp(`(?:^${v4}$)|(?:^${v6}$)`),
              v4: new RegExp(`^${v4}$`),
              v6: new RegExp(`^${v6}$`),
          };
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
          if (!this.isValidChainName(strArray[1])) {
              return false;
          }
          const baseType = strArray[2];
          if (!(this.isUpperCaseString(baseType) && baseType.length === 3)) {
              return false;
          }
          const serialNumber = strArray[3];
          if (!(this.isValidStringNumber(serialNumber) && serialNumber.length === 2)) {
              return false;
          }
          return true;
      }

      /**
      * 交易 ID 是否合法
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
      * remark.hash 是否合法
      *
      * @param hash
      */
      isValidRemarkHash(hash: any) {
          return this.isValidBufferSize(hash, 32);
      }

      /**
      * 链名是否合法：英文 3-20
      *
      * @param chainName
      */
      isValidChainName(chainName: string) {
          if (!this.isString(chainName)) {
              return false;
          }
          const pattern = new RegExp("^[A-Za-z]{3,20}$");
          return pattern.test(chainName);
      }

      /**
      * 链资产名是否合法：英文 3-5
      *
      * @param assetType
      */
      isValidAssetType(assetType: string) {
          if (!this.isString(assetType)) {
              return false;
          }
          if (!this.isUpperCaseString(assetType)) {
              return false;
          }
          const pattern = new RegExp("^[A-Za-z]{3,5}$");
          return pattern.test(assetType);
      }

      /**
      * 链网络标识符是否合法：英文、数字 1-16
      *
      * @param magic
      */
      isValidChainMagic(magic: string) {
          if (!this.isString(magic)) {
              return false;
          }
          if (!this.isUpperCaseString(magic)) {
              return false;
          }
          const pattern = new RegExp("^[A-Za-z0-9]{1,16}$");
          return pattern.test(magic);
      }

      /**
      * dappid 是否合法：6 位大写字母或数字
      *
      * @param dappid
      */
      isValidDAppId(dappid: string) {
          if (!this.isString(dappid)) {
              return false;
          }
          const pattern = new RegExp("^[A-Z0-9]{6}$");
          return pattern.test(dappid);
      }

      /**
      * 用户名是否合法：
      * 不能包含 ifmchain/bfchain
      * 只能由大小写字母、数字、下划线 1-20
      *
      * @param username
      */
      isValidUsername(username: string) {
          if (!this.isString(username)) {
              return false;
          }
          // 大小写字母、数字、下划线 1-20
          const allowSymbols = /^[A-Za-z0-9_]{1,20}$/g;
          if (!allowSymbols.test(username)) {
              return false;
          }
          // 不能包含 ifmchain/bfchain
          const ipattern = /^((?!ifmchain|bfchain).)*$/;
          return ipattern.test(username.toLowerCase());
      }

      /**
      * 是否是合法的创世受托人名
      *
      * @param username
      */
      isValidGenesisUsername(username: any) {
          if (!this.isString(username)) {
              return false;
          }
          // 大小写字母、数字、下划线 1-20
          const allowSymbols = /^[A-Za-z0-9_]{1,20}$/g;
          return allowSymbols.test(username);
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
          const allowSymbols = /^[0-9]+$/g;
          return allowSymbols.test(stringNumber);
      }

      /**
      * 资产数量是否合法： 只能是数字组成的字符串
      *
      * @param assetNumber
      */
      isValidAssetNumber(assetNumber: any) {
          return this.isValidStringNumber(assetNumber);
      }

      /**
      * 权益数量是否合法： 只能是数字组成的字符串
      *
      * @param equity
      */
      isValidAccountEquity(equity: any) {
          return this.isValidStringNumber(equity);
      }

      /**
      * 区块的参与度是否合法： 只能是数字组成的字符串
      *
      * @param blockParticipation
      */
      isValidBlockParticipation(blockParticipation: any) {
          return this.isValidStringNumber(blockParticipation);
      }

      /**
      * 权益比例是否合法： 只能是数字组成的字符串
      *
      * @param equity
      */
      isValidEquityRate(rate: any) {
          return this.isValidStringNumber(rate);
      }

      /**
      * 链域名是否合法
      * 总域名最大长度 1024
      * 不能以 . 开头或结尾
      * 只能包含大小写字母、数字、.
      * 顶级域名只能是小写字母，多级域名每级只能是大小写字母、数字
      * 每级域名的最大长度 128
      *
      * @param name
      */
      isValidLnsName(name: string, chainName?: string) {
          if (!this.isString(name)) {
              return false;
          }
          const names = name.split(".");
          const len = names.length;
          // 不能以 . 开头或结尾
          const sePattern = /^[^\.].*[^\.]$/;
          const startPattern = new RegExp("^[A-Za-z][A-Za-z0-9.]+$");
          const endPattern = new RegExp("[A-Za-z0-9]+$");

          if (name.length > 1024) {
              return false;
          }
          if (!(sePattern.test(name) && startPattern.test(name) && endPattern.test(name))) {
              return false;
          }

          if (len < 2) {
              return false;
          }
          const tpattern = new RegExp("^[a-z]+$");
          const pattern = new RegExp("^[A-Za-z][A-Za-z0-9]+$");
          for (let i = 0; i < len; i++) {
              const item = names[i];
              if (item.length > 128) {
                  return false;
              }
              if (i === len - 2) {
                  if (!pattern.test(item)) {
                      return false;
                  }
              } else if (i === len - 1) {
                  // 链域名的最后一级必须是本链链名
                  if (item !== (chainName || this.configHelper.chainName)) {
                      return false;
                  }
              } else {
                  if (!tpattern.test(item)) {
                      return false;
                  }
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
          return !Number.isNaN(port) && port > 0 && port < 65536;
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
          if (rlen === 0) {
              return false;
          }
          if (hlen === 0) {
              return false;
          }
          if (hlen === 1) {
              if (Number.isNaN(heights[0])) {
                  return false;
              }
          } else {
              for (let i = 0; i < hlen - 1; i++) {
                  if (Number.isNaN(heights[i]) || heights[i] >= heights[i + 1]) {
                      return false;
                  }
              }
          }
          for (let i = 0; i < rlen - 1; i++) {
              if (!this.isValidAssetNumber(rewards[i])) {
                  return false;
              }
          }
          if (milestones.rewards.length - milestones.heights.length !== 1) {
              return false;
          }
          return true;
      }

      /**
      * 链的父链信息是否合法
      * 必须要有父链的网络标识符，并且合法
      * 必须要有父链的链名，并且合法
      * 必须要有父链的链资产名，并且合法
      * 必须要有父链的链域名，并且合法
      *
      * @param parentInfo
      */
      isValidChainParentInfo(parentInfo: any): parentInfo is BFChainCore.ParentInfoJSON {
          if (!parentInfo.magic) {
              return false;
          }
          if (!this.isValidChainMagic(parentInfo.magic)) {
              return false;
          }
          if (!parentInfo.chainName) {
              return false;
          }
          if (!this.isValidChainName(parentInfo.chainName)) {
              return false;
          }
          if (!parentInfo.assetType) {
              return false;
          }
          if (!this.isValidAssetType(parentInfo.assetType)) {
              return false;
          }
          if (!this.isValidLnsName(parentInfo.genesisNodeAddress)) {
              return false;
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
      * 是否是大写字母或数字
      *
      * @param value
      */
      isUpperCaseOrNumber(value: string) {
          const pattern = /^[A-Z0-9]+$/;
          return this.isString(value) && pattern.test(value);
      }

      /**
      * 是否是纯大小写字母
      *
      * @param value
      */
      isUpperCaseOrLowerCase(value: string) {
          const pattern = /^[A-Za-z]+$/;
          return this.isString(value) && pattern.test(value);
      }

      /**
      * 是否是大小写字母或数字
      *
      * @param value
      */
      isUpperCaseOrLowerCaseOrNumber(value: string) {
          const pattern = /^[A-Za-z0-9]+$/;
          return this.isString(value) && pattern.test(value);
      }

      /**
      * 是否以点开头或结尾
      *
      * @param value
      */
      isStartWithOrEndWithPoint(value: string) {
          const pattern = /^[^\.].*[^\.]$/;
          return !pattern.test(value);
      }

      /**
      * 字母开头，内容可包含数字
      *
      * @param value
      */
      isStartWithLeterAndOtherContainNumber(value: string) {
          const pattern = /^[A-Za-z][A-Za-z0-9]+$/;
          return pattern.test(value);
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

      private BI_2_32 = JSBI.BigInt(32);
      private BI_2_16 = JSBI.BigInt(16);
      private BI_2_8 = JSBI.BigInt(8);

      /**读取一个二进制的n位数据作为BigInt数字 */
      getUintX(dv: BFChainUtil.Buffer, X: number) {
          let BI_res = JSBI.BigInt(0);
          let offset = 0;
          while (X > 0) {
              if (X >= 32) {
                  const BI_val = JSBI.BigInt(dv.readUInt32BE(offset));
                  BI_res = JSBI.add(JSBI.leftShift(BI_res, this.BI_2_32), BI_val);
                  offset += 32;
                  X -= 32;
              } else if (X >= 16) {
                  const BI_val = JSBI.BigInt(dv.readUInt16BE(offset));
                  BI_res = JSBI.add(JSBI.leftShift(BI_res, this.BI_2_16), BI_val);
                  offset += 16;
                  X -= 16;
              } else if (X >= 8) {
                  const BI_val = JSBI.BigInt(dv.readUInt8(offset));
                  BI_res = JSBI.add(JSBI.leftShift(BI_res, this.BI_2_8), BI_val);
                  offset += 8;
                  X -= 8;
              } else {
                  const binary_num = dv.readUInt8(offset) >> X;
                  const BI_val = JSBI.BigInt(binary_num);
                  BI_res = JSBI.add(JSBI.leftShift(BI_res, JSBI.BigInt(X)), BI_val);
                  offset += X;
                  X -= X;
              }
          }
          return BI_res;
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
              JSBI.BigInt(prevWeight);
              JSBI.BigInt(nextWeight);
              return typeof nextWeight === typeof prevWeight;
          } catch (err) {
              return false;
          }
      }
  ```

- 交易验证

  - 创建时的交易验证(verifyTransactionBody)

    1. 如果没有交易体或 asset 则报错
       ```
           if (!body) {
               throw new Error
           }
           if (!asset) {
               throw new Error
           }
       ```
    2. 必须携带合法的交易版本号
       - 正整数
       ```
           if (!isPositiveInteger(body.version)) {
               throw new Error
           }
       ```
    3. 必须携带合法的交易类型
       - 由 4 个 "-" 拼接起来的字符串
       - 第一部分 合法的资产名
       - 第二部分 合法的链名
       - 第三部分 3 个大写字母组成的字符
       - 第四部分 2 个数字组成的字符
       ```
           if (!body.type) {
               throw new Error
           }
           if (!isValidTransactionType(body.type)) {
               throw new Error
           }
       ```
    4. 必须携带合法的发起账户地址
       - 必须是字符串
       - 符合 base58 编码规范
       ```
           if (!body.senderId) {
               return false;
           }
           if (!isAddress(body.senderId)) {
               throw new Error
           }
       ```
    5. 必须携带合法的发起账户公钥
       - 64 位 16 进制字符串
       ```
           if (body.senderPublicKey) {
               return false;
           }
           if (!isValidPublicKey(body.senderPublicKey)) {
               throw new Error
           }
       ```
    6. 交易的发起账户地址和公钥必须匹配
       ```
           if (body.senderId !== getAddressFromPublicKeyString(body.senderPublicKey)) {
               return false;
           }
       ```
    7. 如果交易携带二次密码公钥
       - 二次密码公钥必须是合法的公钥
       ```
           if (body.senderSecondPublicKey) {
               if (!isValidPublicKey(body.senderSecondPublicKey)) {
                   throw new Error
               }
           }
       ```
    8. 如果携带交易的接收账户地址
       - 必须是合法的账户地址
       ```
           if (isAddress(body.recipientId)) {
               throw new Error
           }
       ```
    9. 必须携带合法的交易范围数据(rangeType, range)
       - 范围类型(rangeType)必须是限定的类型
       - 范围(range)必须合法
         - 必须是一个数组
         - rangeType 是 EMPTY
           - range 的长度必须是 0
         - rangeType 不是 EMPTY
           - 如果 range 长度等于 0 则报错
           - rangeType 是 MULTI_ADDRESS
             - range 的每一项必须是合法的地址
           - rangeType 是 MULTI_DAPPID
             - range 的每一项必须是合法的 dappid
           - rangeType 是 MULTI_LOCATION_NAME
             - range 的每一项必须是合法的 lns
       ```
           if (!await isValidRange(body.rangeType, body.range)) {
               throw new Error
           }
       ```
    10. 必须携带合法的交易时间戳
        - 必须是一个自然数
        ```
            if (!isNaturalNumber(body.timestamp)) {
                throw new Error
            }
        ```
    11. 必须携带合法的交易发起区块高度
        - 必须是一个正整数
        ```
            if (!isPositiveInteger(body.applyBlockHeight)) {
                throw new Error
            }
        ```
    12. 如果交易携带交易的有效区块间隔数
        - 区块间隔数必须是一个正整数
        - 交易间隔数必须小于等于设定的最大值(创世块设定)
        ```
            if (!isPositiveInteger(body.applyBlockHeight)) {
                throw new Error
            }
            if (numberOfEffectiveBlocks > maxApplyAndConfirmedBlockHeightDiff) {
                throw new Error
            }
        ```
    13. 交易的手续费必须合法
        - 金额必须是一个由 0-9 组成的字符串
        - 金额必须大于等于 0
        ```
            if (!fee) {
                throw new Error
            }
            if (!isValidAssetNumber(fee)) {
                throw new Error
            }
            if (JSBI.greaterThan(0, fee)) {
                throw new Error
            }
        ```
    14. 必须携带合法的来源链网络标识符
        - 必须是一个字符串
        - A-Za-z0-9 组成的 1-16 个字符
        ```
            if (!body.fromMagic) {
                throw new Error
            }
            if (!isValidChainMagic(body.fromMagic)) {
                throw new Error
            }
        ```
    15. 必须携带合法的去往链网络标识符
        - 必须是一个字符串
        - A-Za-z0-9 组成的 1-16 个字符
        ```
            if (!body.toMagic) {
                throw new Error
            }
            if (!isValidChainMagic(body.toMagic)) {
                throw new Error
            }
        ```
    16. 如果携带交易来源 ip
        - 必须是一个合法的 ipV4 或 ipV6
        ```
            if (!ipRegex().isIP.test(body.sourceIP)) {
                throw new Error
            }
        ```
    17. 如果携带交易所属的 dappid
        - dappid 必须合法
          - 必须是一个字符串
          - A-Z0-9 组成的 6 个字符
        ```
            if (!isValidDAppId(body.dappid)) {
                throw new Error
            }
        ```
    18. 如果携带交易所属的 lns
        - lns 必须合法链域名
        ```
            if (!isValidLnsName(body.lns, config.chainName)) {
                throw new Error
            }
        ```
    19. 每种交易各自的验证

        ```
            /**
            * 检验手续费是否大于等于最小单位
            *
            * @param fee
            * @param config
            */
            checkTrsFee(fee: string, config = this.configHelper) {
                const miniUnit = config.miniUnit;
                const inputFee = JSBI.BigInt(fee);
                const miniUnitFee = JSBI.BigInt(miniUnit);
                if (JSBI.greaterThan(miniUnitFee, inputFee)) {
                    throw new Error
                }
            }

            /**
            * 必须是不限定范围
            *
            * @param body
            */
            emptyRangeType(body: BFChainCore.TxBodyJSON) {
                if (body.rangeType !== RANGE_TYPE.EMPTY) {
                    throw new Error
                }
            }

            /**
            * 校验金额
            *
            * @param amount
            */
            checkAmount(amount: string) {
                if (!amount) {
                    throw new Error
                }

                if (!isValidAssetNumber(amount)) {
                    throw new Error
                }

                const minAmount = JSBI.BigInt(0);
                const inputAmount = JSBI.BigInt(amount);
                if (JSBI.greaterThanOrEqual(minAmount, inputAmount)) {
                    throw new Error
                }
            }
        ```

        - SIGNATURE -- BSE-01 -- 设置支付密码交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带生成支付密码的合法数据
            ```
                signature = asset.signature;
                if (!signature) {
                    throw new Error
                }
            ```
            - 携带合法的账户账户公钥
              ```
                  if (!signature.publicKey) {
                      throw new Error
                  }
                  if (!isValidSecondPublicKey(signature.publicKey)) {
                      throw new Error
                  }
              ```

        - DELEGATE -- BSE-02 -- 注册为受托人交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "username"
            - value 必须是受托人的用户名
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "username") {
                    throw new Error
                }
                if (storage.value !== asset.delegate.username) {
                    throw new Error
                }
            ```
          - 必须携带生成受托人的合法数据
            ```
                delegate = asset.delegate;
                if (!delegate) {
                    throw new Error
                }
            ```
            - 携带合法的账户用户名
              ```
                  username = delegate.username;
                  if (!username) {
                      throw new Error
                  }
                  if (body.applyBlockHeight === 1) {
                      if (!isValidGenesisUsername(username)) {
                          throw new Error
                      }
                  } else {
                      if (!isValidUsername(username)) {
                          throw new Error
                      }
                  }
              ```
            - 必须携带合法的账户公钥且与发起账户公钥一致
              ```
                  publicKey = delegate.publicKey;
                  if (!publicKey) {
                      throw new Error
                  }
                  if (!isValidPublicKey(publicKey)) {
                      throw new Error
                  }
                  if (publicKey !== body.senderPublicKey) {
                      throw new Error
                  }
              ```

        - VOTE -- BSE-03 -- 投票交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收者账户
            ```
                if (!body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带生成投票的合法数据
            ```
                vote = asset.vote;
                if (!vote) {
                    throw new Error
                }
            ```
            - 必须携带合法的投出权益数量
              ```
                  if (isValidAccountEquity(vote.equity)) {
                      throw new Error
                  }
              ```

        - USERNAME -- BSE-04 -- 注册用户别名交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "alias"
            - value 必须要设置的用户名
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "alias") {
                    throw new Error
                }
                if (storage.value !== asset.username.alias) {
                    throw new Error
                }
            ```
          - 必须携带生成用户名的合法数据
            ```
                username = asset.username;
                if (!username) {
                    throw new Error
                }
            ```
            - 必须携带要设置的用户名值
              ```
                  alias = username.alias;
                  if (!alias) {
                      throw new Error
                  }
              ```
            - 必须是一个资产串：由 大小写字母、数字、下划线 组成
              ```
                  if (!isString(alias)) {
                      throw new Error
                  }
              ```
            - 用户名不能是 bfchain/ifmchain
              ```
                  if (body.applyBlockHeight === 1) {
                      if (!isValidGenesisUsername(alias)) {
                          throw new Error
                      }
                  } else {
                      if (!isValidUsername(alias)) {
                          throw new Error
                      }
                  }
              ```
            - 用户名不能是潜在的账户地址
              ```
                  if (isAddress(alias)) {
                      throw new Error
                  }
              ```
            - 用户名的长度 0-20
              ```
                  if (alias.length === 0 || alias.length > 20) {
                      throw new Error
                  }
              ```
            - 必须携带合法的账户公钥且与发起账户公钥一致
              ```
                  publicKey = username.publicKey;
                  if (!publicKey) {
                      throw new Error
                  }
                  if (!isValidPublicKey(publicKey)) {
                      throw new Error
                  }
                  if (publicKey !== body.senderPublicKey) {
                      throw new Error
                  }
              ```

        - ACCEPT_VOTE -- BSE-05 -- 受托人接收投票交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```

        - REJECT_VOTE -- BSE-06 -- 受托人拒绝投票交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```

        - DAPP -- WOD-00 -- 注册侧链应用交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "dappid"
            - value 必须是 dappid 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "dappid") {
                    throw new Error
                }
                if (storage.value !== asset.dapp.dappid) {
                    throw new Error
                }
            ```
          - 必须携带生成 dapp 的合法数据
            ```
                dapp = asset.dapp;
                if (!dapp) {
                    throw new Error
                }
            ```
            - 必须携带合法的 dappid
              - 纯大写字母
              - 6 个字符
              ```
                  if (!isString(dappid)) {
                      throw new Error
                  }
                  if (dappid.length !== 6) {
                      throw new Error
                  }
                  if (!isUpperCaseOrNumber(dappid)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的拥有者账户公钥
              ```
                  if (!possessorPublicKey) {
                      throw new Error
                  }
                  if (!isValidPublicKey(possessorPublicKey)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的 dapp 所属链名
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
                  if (sourceChainName !== config.chainName) {
                      throw new Error
                  }
              ```
            - 必须携带合法的 dapp 所属链网络标识符
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
                  if (sourceChainMagic !== config.magic) {
                      throw new Error
                  }
              ```
            - 必须携带合法的 dapp 类型(枚举)
              - PAID_APP = 0 付费应用
              - FREE_APP = 1 免费应用
              ```
                  if (!DAPP_TYPE[type]) {
                      throw new Error
                  }
              ```

        - DAPP_PURCHASING -- WOD-01 -- dappid 购买交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收者账户，并且不能和发起账户地址相等
            ```
                recipientId = body.recipientId;
                if (!recipientId) {
                    throw new Error
                }
                if (body.senderId === recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "dappid"
            - value 必须是购买的 dappid 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "dappid") {
                    throw new Error
                }
                if (storage.value !== asset.dappPurchasing.dappAsset.dappid) {
                    throw new Error
                }
            ```
          - 必须携带生成 dappPurchasing 的合法数据

            ```
                dappPurchasing = asset.dappPurchasing;
                if (!dappPurchasing) {
                    throw new Error
                }
                if (dappAsset.possessor !== recupientId) {
                    throw new Error
                }
                if (dappAsset.possessor === body.senderId) {
                    throw new Error
                }
            ```

            - 必须携带需要购买的 dapp 的相关信息
              ```
                  dappAsset = dappPurchasing.dappAsset;
                  verifyDAppAsset(dappAsset);
              ```
            - 需要携带用于购买的合法的资产所属链名称
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
              ```
            - 需要携带用于购买的合法的资产所属链的网络标识符
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
                  if (sourceChainMagic !== config.magic) {
                      throw new Error
                  }
              ```
            - 需要携带用于购买的合法的资产名称
              ```
                  if (!isValidAssetType(assetType)) {
                      throw new Error
                  }
              ```
            - 需要携带用于购买的合法的资产数量
              ```
                 checkAmount(amount);
              ```

        - REGISTER_CHAIN -- WOD-01 -- 发行注册链交易,

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "magic"
            - value 必须是 magic 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "magic") {
                    throw new Error
                }
                if (storage.value !== asset.registerChain.genesisBlock.magic) {
                    throw new Error
                }
            ```
          - 必须携带生成注册链的合法数据

            ```
                registerChain = registerChainAsset.registerChain;
                if (!registerChain) {
                    throw new Error
                }
            ```

            - 必须携带合法的创世块

              ```
                let chainConfig = this.configMap.get(genesisBlockJson.magic);
                    if (!chainConfig) {
                    // FIXME: 没有注册链的配置文件就生成一个
                    chainConfig = new ConfigHelper(genesisBlockJson, this.configHelper.business);
                }

                const genesisBlock = this._blockCore.recombineBlock(genesisBlockJson);
                this._blockCore
                .getBlockFactoryFromHeight<BFChainCore.Block<BFChainCore.GenesisBlockAssetJSON>>(
                    genesisBlockJson.height,
                )
                .verify(genesisBlock, chainConfig);
              ```

        - MARK -- EXT-00 -- 数据存证交易

          ```
              FIXME: 这个交易具体怎么使用？目前结构很奇怪
          ```

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收者账户，并且是 数据存证 的拥有者地址
            ```
                recipientId = body.recipientId;
                if (!recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "dappid"
            - value 必须是购买的 dappid 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "dappid") {
                    throw new Error
                }
                if (storage.value !== asset.mark.dappid) {
                    throw new Error
                }
            ```
          - 必须携带生成 mark 的合法数据
            ```
                mark = asset.mark;
                if (!mark) {
                    throw new Error
                }
            ```
            - 必须携带 dapp 的相关信息
              ```
                  dapp = mark.dapp;
                  verifyDAppAsset(dapp);
              ```
            - 必须携带合法的数据所属账户地址，与接收账户地址一致
              ```
                  if (mark.markPossessor !== recipientId) {
                      throw new Error
                  }
              ```
            - 必须携带合法的数据
              - 字符串
              - 小于 1024 个字符
              ```
                  content = mark.content;
                  if (!content) {
                      throw new Error
                  }
                  if (!isString(content)) {
                      throw new Error
                  }
                  if (content.length > 1024) {
                      throw new Error
                  }
              ```
            - 必须携带合法的数据类型(get/put/post...)
              - 字符串
              - 1-10 个字符
              ```
                  action = mark.action;
                  if(!action) {
                      throw new Error
                  }
                  if (!isString(action)) {
                      throw new Error
                  }
                  len = action.length;
                  if (len < 1 || len > 10) {
                      throw new Error
                  }
              ```

        - ISSUE_ASSET -- AST-00 -- 发行数字资产交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收者账户，并且不能是交易的发起账户地址，并且是数字资产的创世账户地址
            ```
                recipientId = body.recipientId;
                if (!recipientId) {
                    throw new Error
                }
                if (body.senderId === recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "assetType"
            - value 必须是 assetType 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "assetType") {
                    throw new Error
                }
                if (storage.value !== asset.issueAsset.assetType) {
                    throw new Error
                }
            ```
          - 必须携带生成数字资产的合法数据

            ```
                issueAsset = asset.issueAsset;
                if (!issueAsset) {
                    throw new Error
                }
                const {
                    sourceChainName,
                    sourceChainMagic,
                    assetType,
                    genesisAddress,
                    expectedIssuedAssets,
                } = issueAsset;
            ```

            - 必须携带合法的资产所属链链名，且必须等于当前链链名
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
                  if (sourceChainName !== config.chainName) {
                      throw new Error
                  }
              ```
            - 必须携带合法的资产所属链网络标识符，且必须等于当前链链网络标识符
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  isValidChainMagic(sourceChainMagic) {
                      throw new Error
                  }
                  if (sourceChainMagic !== config.magic) {
                      throw new Error
                  }
              ```
            - 必须携带合法的数字资产名
              - 大写字母
              - 3-5 个字符
              ```
                  if (!assetType) {
                      throw new Error
                  }
                  if (!isUpperCaseString(assetType)) {
                      throw new Error
                  }
                  len = assetType.length;
                  if (len < 3 || len > 5) {
                      throw new Error
                  }
              ```
            - 必须携带合法的预计发行数字资产总量
              - 由数字组成的字符串
              ```
                  if (!expectedIssuedAssets) {
                      throw new Error
                  }
                  if (!isValidAssetNumber(expectedIssuedAssets)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的创世账户地址，且于接收账户地址相等，不能等于发起账户地址
              ```
                  if (!genesisAddress) {
                      throw new Error
                  }
                  if (!isAddress(genesisAddress)) {
                      throw new Error
                  }
                  if (body.senderId === genesisAddress) {
                      throw new Error
                  }
                  if (recipientId !== genesisAddress) {
                      throw new Error
                  }
              ```

        - TRANSFER_ASSET -- AST-01 -- 数字资产转账交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收者账户，并且不能和发起账户地址相等
            ```
                recipientId = body.recipientId;
                if (!recipientId) {
                    throw new Error
                }
                if (body.senderId === recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "assetType"
            - value 必须是 assetType 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "assetType") {
                    throw new Error
                }
                if (storage.value !== asset.transferAsset.assetType) {
                    throw new Error
                }
            ```
          - 必须携带生成数字资产转账的合法数据
            ```
                transferAsset = asset.transferAsset;
                if (!transferAsset) {
                    throw new Error
                }
                const { sourceChainMagic, sourceChainName, assetType } = transferAsset;
            ```
            - 必须携带合法的资产所属链名
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的资产所属链网络标识符
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的要转出的数字资产名
              ```
                  if (!isValidAssetType(assetType)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的贤惠数字资产数量，且大于 0
              ```
                  checkAmount(transferAsset.amount);
              ```

        - DESTORY_ASSET -- AST-02 -- 销毁数字资产交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收者账户
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "assetType"
            - value 必须是 assetType 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "assetType") {
                    throw new Error
                }
                if (storage.value !== asset.destoryAsset.assetType) {
                    throw new Error
                }
            ```
          - 必须携带生成销毁数字资产的合法数据
            ```
                destoryAsset = destoryAssetAsset.destoryAsset;
                if (!destoryAsset) {
                    throw new Error
                }
                const { sourceChainMagic, sourceChainName, assetType } = destoryAsset;
            ```
            - 必须携带合法的要销毁的数字资产所属链名，且等于当前链链名
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
                  if (sourceChainName !== config.chainName) {
                      throw new Error
                  }
              ```
            - 必须携带合法的要销毁的数字资产所属链网络标识符，且等于当前链链网络标识符
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
                  if (sourceChainMagic !== config.magic) {
                      throw new Error
                  }
              ```
            - 必须携带合法的要销毁的数字资产名，且不能等于当前链的链资产名
              ```
                  if (!isValidAssetType(assetType)) {
                      throw new Error
                  }
                  if (assetType === config.assetType) {
                      throw new Error
                  }
              ```
            - 必须携带合法的要销毁的数字资产数量，且大于 0
              ```
                  checkAmount(destoryAsset.amount);
              ```

        - GIFT_ASSET -- AST-03 -- 发红包交易

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 必须携带交易的接收账户地址，并且是 toExchangeAsset 交易的发起账户地址
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "assetType"
            - value 必须是 assetType 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "assetType") {
                    throw new Error
                }
                if (storage.value !== asset.giftAsset.assetType) {
                    throw new Error
                }
            ```
          - 必须携带生成发红包交易的合法数据
            ```
                giftAsset = giftAssetAsset.giftAsset
                if (!giftAsset) {
                    throw new Error
                }
                const { sourceChainMagic, sourceChainName, assetType } = giftAsset;
            ```
            - 必须携带合法的密文公钥组
              - 必须是一个数组，可为空
              - 每一项都必须是公钥
              ```
                  if (!isValidCipherPublicKeys(giftAsset.cipherPublicKeys)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的用于发红包数字资产所属链网络标识符
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的用于发红包数字资产所属链名
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的用于发红包数字资产名
              ```
                  if (!isValidAssetType(assetType)) {
                      throw new Error
                  }
              ```
            - 必须指定可抢的次数，并且是一个正整数
              ```
                  if (!isPositiveInteger(giftAsset.totalGrabableTimes)) {
                      throw new Error
                  }
              ```
            - 如果携带开始抢的区块间隔，这个间隔必须是正整数
              ```
                  if (giftAsset.numberOfBeginUnfrozenBlocks !== undefined &&!baseHelper.isNaturalNumber(giftAsset.numberOfBeginUnfrozenBlocks)
                  ) {
                      throw new Error
                  }
              ```
            - 必须携带抢红包规则
              - average： 平均分配
              - random：根据任意账户的地址的随机分配法
              - recipient_random：根据接收者列表中账户地址的随机分配法，这种规则会确保赠送的资产尽可能的被分配完，并且确保每一个接收账户都有能得到的金额
              ```
                  if ((GIFT_DISTRIBUTION_RULE as any)[(GIFT_DISTRIBUTION_RULE as any)[giftAsset.giftDistributionRule]] !== giftAsset.giftDistributionRule
                  ) {
                      throw new Error
                  }
              ```
            - 必须携带合法的用于发红包数字资产数量，并且大于 0
              ```
                  checkAmount(giftAsset.amount);
              ```

        - GRAB_ASSET -- AST-04 -- 抢红包交易

          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收账户地址，并且是 giftAsset 交易的发起账户地址
            ```
                recipientId = body.recipientId;
                if (!recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "transactionSignature"
            - value 必须是 发红包交易 的签名
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "transactionSignature") {
                    throw new Error
                }
                if (storage.value !== asset.grabAsset.transactionSignature) {
                    throw new Error
                }
            ```
          - 必须携带生成抢红包交易的合法数据
            ```
                grabAsset = grabAssetAsset.grabAsset;
                if (!grabAsset) {
                    throw new Error
                }
                const {
                    blockSignature,
                    transactionSignature,
                    transactionRangeType,
                    transactionRange,
                } = grabAsset;
            ```
            - 必须携带 发红包交易 被确认的区块签名
              ```
                  if (!blockSignature) {
                      throw new Error
                  }
                  if (!isValidSignature(blockSignature)) {
                      throw new Error
                  }
              ```
            - 必须携带 发红包交易 的签名
              ```
                  if (!transactionSignature) {
                      throw new Error
                  }
                  if (!isValidSignature(transactionSignature)) {
                      throw new Error
                  }
              ```
            - 必须携带 发红包交易 的 接收范围类型 rangeType 和 接收范围 range
              - rangeType === MULTI_ADDRESS
                - 交易的发起账户地址必须在 range 中
              - rangeType === MULTI_DAPPID
                - 交易的 dappid 必须在 range 中
              - rangeType === MULTI_LOCATION_NAME
                - 交易的 lns 必须在 range 中
              ```
                  if (!await isValidRange(transactionRangeType, transactionRange)) {
                      throw new Error
                  }
                  if (transactionRangeType & RANGE_TYPE.MULTI_ADDRESS) {
                      if (!transactionRange.includes(body.senderId)) {
                          throw new Error
                      }
                  } else if (transactionRangeType & RANGE_TYPE.MULTI_DAPPID) {
                      if (!body.dappid || !transactionRange.includes(body.dappid)) {
                          throw new Error
                      }
                  } else if (transactionRangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
                      if (!body.lns || !transactionRange.includes(body.lns)) {
                          throw new Error
                      }
                  }
              ```
            - 必须携带 发红包交易 的发起交易高度
              ```
                  if (!isPositiveInteger(grabAsset.applyBlockHeight)) {
                      throw new Error
                  }
              ```
            - 如果 发红包交易 有指定开始交易高度间隔，则必须携带则个值
              ```
                  if (grabAsset.numberOfBeginUnfrozenBlocks) {
                      if (!isPositiveInteger(grabAsset.numberOfBeginUnfrozenBlocks)) {
                          throw new Error
                      }
                  }
              ```
            - 如果 发红包交易 有指定交易的有效区块高度，则必须携带这个值
              ```
                  if (grabAsset.numberOfEffectiveBlocks) {
                     if (!isPositiveInteger(grabAsset.numberOfEffectiveBlocks)) {
                         throw new Error
                     }
                  }
              ```
            - 携带的资产数量格式必须合法
              ```
                 if (!isValidAssetNumber(grabAsset.amount)) {
                     throw new Error
                 }
              ```
            - 如果是公钥模式，则密文必须存在，且密文签名合法
              - 签名由` 发红包交易的签名``发送者的地址 `组成
              ```
                  if (cipherPublicKeys.length > 0) {
                      if (!isValidAccountSignature(grabAsset.ciphertextSignature)) {
                          throw new Error
                      }
                      const { ciphertextSignature } = grabAsset;
                      if (!ciphertextSignature) {
                          throw new Error
                      }
                      const { publicKey, signature } = ciphertextSignature;
                      if (!cipherPublicKeys.includes(publicKey)) {
                          throw new Error
                      }
                      if (!transactionHelper.verifyCiphertextSignature({
                          secretPublicKey: parseHexToArrayBuffer(publicKey),
                          ciphertextSignatureBuffer: parseHexToArrayBuffer(signature),
                          transactionSignatureBuffer: trsSignBuffer,
                          senderId: body.senderId,
                          })
                      ) {
                          throw new Error
                      }
                  }
              ```
            - 根据 发红包交易 的模式，校验金额是否正确
              ```
                  let should_grap_amount_BI: JSBI | undefined;
                  switch (giftAsset.giftDistributionRule) {
                      case GIFT_DISTRIBUTION_RULE.AVERAGE:
                          should_grap_amount_BI = transactionHelper.calcGrabAverageGiftAssetNumber(
                          giftAsset.amount,
                          giftAsset.totalGrabableTimes,
                          );
                          break;
                      case GIFT_DISTRIBUTION_RULE.RANDOM:
                          should_grap_amount_BI = transactionHelper.calcGrabRandomGiftAssetNumber(
                          body.senderId,
                          blockSignBuffer,
                          trsSignBuffer,
                          recipientId,
                          giftAsset.amount,
                          giftAsset.totalGrabableTimes,
                          );
                          break;
                      case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
                          should_grap_amount_BI = transactionHelper.calcGrabRecipientRandomGiftAssetNumber(
                          body.senderId,
                          blockSignBuffer,
                          trsSignBuffer,
                          recipientId,
                          grabAsset.transactionRange,
                          giftAsset.amount,
                          );
                          break;
                  }
                  if (!should_grap_amount_BI) {
                      throw new Error
                  }
                  if (should_grap_amount_BI.toString() !== grabAsset.amount) {
                      throw new Error
                  }
              ```

        - TRUST_ASSET -- AST-05 -- 委托资产

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收账户地址，并且是 signForAsset 交易的发起账户地址，并且不能是交易的发起账户
            ```
                recipientId = body.recipientId;
                if (!recipientId) {
                    throw new Error
                }
                if (body.senderId === recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "assetType"
            - value 必须是 assetType 值
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "assetType") {
                    throw new Error
                }
                if (storage.value !== asset.trustAsset.assetType) {
                    throw new Error
                }
            ```
          - 必须携带生成委托交易的合法数据
            ```
                trustAsset = trustAssetAsset.trustAsset;
                if (!trustAsset) {
                    throw new Error
                }
                const { trustees, numberOfSignFor, sourceChainName, sourceChainMagic } = trustAsset;
            ```
            - 必须携带委托账户
              - 合法的账户地址组成的数组
              - 长度大于 0
              - 不能包含发起账户
              ```
                  if (!isArray(trustees)) {
                      throw new Error
                  }
                  if (trustees.length <= 0) {
                      throw new Error
                  }
                  for (const trustee of trustees) {
                      if (!isAddress(trustee)) {
                          throw new Error
                      }
                  }
              ```
            - 必须携带签收交易需要的委托人签名数量 n，n 不能大于最大签名数量(max = 发起账户 + 接收账户数量 + 委托账户数量)
              ```
                  if (!isPositiveInteger(numberOfSignFor)) {
                      throw new Error
                  }
                  // max = 发起账户 + 接收账户 + 委托账户数量
                  const maxSifnFor = trustees.length + 2;
                  if (numberOfSignFor > maxSifnFor) {
                      throw new Error
                  }
              ```
            - 必须携带合法的委托的数字资产所属链名
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的委托的数字资产所属链网络标识符
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的委托的数字资产名
              ```
                  if (!isValidAssetType(trustAsset.assetType)) {
                      throw new Error
                  }
              ```
            - 必须携带合法的委托的数字资产数量，并且大于 0
              ```
                  checkAmount(trustAsset.amount);
              ```

        - SIGN_FOR_ASSET -- AST-06 -- 签收委托资产

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 必须携带交易的接收账户地址，并且是 trustAsset 交易的发起账户地址，并且不能是交易的发起账户
            ```
                recipientId = body.recipientId;
                if (recipientId) {
                    throw new Error
                }
                if (body.senderId === recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "transactionSignature"
            - value 必须是 trustAsset 的签名
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "transactionSignature") {
                    throw new Error
                }
                if (storage.value !== asset.signForAsset.transactionSignature) {
                    throw new Error
                }
            ```
          - 必须携带生成签收交易的合法数据
            ```
                signForAsset = signForAssetAsset.signForAsset;
                if (!signForAsset) {
                    throw new Error
                }
                const {
                    trustAsset,
                    trustSenderId,
                    trustRecipientId,
                    thirdPartySignatures,
                    transactionSignature,
                } = signForAsset;
            ```
            - 必须携带 资产委托交易 的签名
              ```
                  if (!transactionSignature) {
                      throw new Error
                  }
                  if (!isValidSignature(transactionSignature)) {
                      throw new Error
                  }
              ```
            - 必须携带 资产委托交易 的发起交易高度
              ```
                  if (!isPositiveInteger(signForAsset.applyBlockHeight)) {
                      throw new Error
                  }
              ```
            - 必须携带 资产委托交易 的有效签收签名数量
              ```
                  if (!isPositiveInteger(signForAsset.trustNumberOfSignFor)) {
                      throw new Error
                  }
              ```
            - 如果 资产委托交易 有指定开始交易高度间隔，则必须携带则个值
              ```
                  if (signForAsset.numberOfBeginUnfrozenBlocks) {
                      if (!isPositiveInteger(signForAsset.numberOfBeginUnfrozenBlocks)) {
                          throw new Error
                      }
                  }
              ```
            - 如果 资产委托交易 有指定交易的有效区块高度，则必须携带这个值
              ```
                  if (signForAsset.numberOfEffectiveBlocks) {
                      if (!isPositiveInteger(signForAsset.numberOfEffectiveBlocks)) {
                          throw new Error
                      }
                  }
              ```
            - 必须携带 资产委托交易 的发起账户地址，接收账户地址
              ```
                  if (!trustSenderId) {
                      throw new Error
                  }
                  if (!isAddress(trustSenderId)) {
                      throw new Error
                  }
                  if (!trustRecipientId) {
                      throw new Error
                  }
                  if (!isAddress(trustRecipientId)) {
                      throw new Error
                  }
              ```
            - 必须携带委托方签名，签名合法，且签名人是 资产委托交易 的发起人/接收人/指定的委托账户
              - 签名由 ` 密文公钥``密文签名``trust 交易签名``trust 交易 senderId``trust 交易 recipientId `
              ```
                  if (!thirdPartySignatures) {
                      throw new Error
                  }
                  if (!isValidThirdPartySignatures(thirdPartySignatures)) {
                      throw new Error
                  }
                  verifyTrustAsset(trustAsset);
              ```
            - 委托方签名数量必须大于等于 资产委托交易 指定的有效的委托方签名数量
              ```
                  const { numberOfSignFor, trustees } = trustAsset;
                  if (numberOfSignFor > thirdPartySignatures.length) {
                      throw new Error
                  }
                  const tempTrustees = [...trustees];
                  tempTrustees[tempTrustees.length] = trustSenderId;
                  tempTrustees[tempTrustees.length] = trustRecipientId;
                  const transactionSignatureBuffer = parseHexToArrayBuffer(transactionSignature);
                  for (const thirdPartySignature of thirdPartySignatures) {
                      const { publicKey, signature } = thirdPartySignature;
                      const address = accountBaseHelper.getAddressFromPublicKeyString(publicKey);
                      if (!tempTrustees.includes(address)) {
                          throw new Error
                      }
                      if (
                          !transactionHelper.verifyThirdPartySignature({
                          secretPublicKey: parseHexToArrayBuffer(publicKey),
                          signatureBuffer: parseHexToArrayBuffer(signature),
                          transactionSignatureBuffer,
                          senderId: trustSenderId,
                          recipientId: trustRecipientId,
                          })
                      ) {
                          throw new Error
                      }
                  }
              ```

        - EMIGRATE_ASSET -- AST-07 -- 资产迁出(只能是链资产迁出)

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收账户地址
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链网络标识符必须是本链的网络标识符，交易的去往链网络标识符不能是本链的网络标识符
            ```
                if (body.fromMagic !== config.magic) {
                    throw new Error
                }
                if (body.toMagic === config.magic) {
                    throw new Error
                }
            ```
          - 必须携带生成资产迁出交易的合法数据
            ```
                emigrateAsset = emigrateAssetAsset.emigrateAsset;
                if (!emigrateAsset) {
                    throw new Error
                }
                const {
                    sourceChainMagic,
                    sourceChainName,
                    assetType,
                    amount,
                    genesisDelegateSignature,
                } = emigrateAsset;
            ```
            - 需要携带合法的资产所属链名称,并且是本链
              ```
                  if (!sourceChainName) {
                      throw new Error
                  }
                  if (!isValidChainName(sourceChainName)) {
                      throw new Error
                  }
              ```
            - 需要携带合法的资产所属链的网络标识符,并且是本链
              ```
                  if (!sourceChainMagic) {
                      throw new Error
                  }
                  if (!isValidChainMagic(sourceChainMagic)) {
                      throw new Error
                  }
              ```
            - 需要携带合法的资产名称，并且是链资产
              ```
                  if (!isValidAssetType(assetType))  {
                      throw new Error
                  }
              ```
            - 需要携带迁出的资产数量，并且大于 0
              ```
                  checkAmount(amount);
              ```
            - 必须携带合法的可验证的本链创世受托人签名(创世受托人公钥+签名)
              - 签名由` 所属链名称``网络标识符``资产名称``发起账户地址 `组成
              ```
                  if (!genesisDelegateSignature) {
                      throw new Error
                  }
                  if (!isValidAccountSignature(genesisDelegateSignature)) {
                      throw new Error
                  }
                  const { publicKey, signature } = genesisDelegateSignature;
                  const address = accountBaseHelper.getAddressFromPublicKeyString(publicKey);
                  const genesisDelegates = transactionHelper.genesisDelegates(config);
                  if (!genesisDelegates.includes(address)) {
                      throw new Error
                  }
                  if (!transactionHelper.verifyEmigrateAssetGenesisSignature({
                      secretPublicKey: parseHexToArrayBuffer(publicKey),
                      signatureBuffer: parseHexToArrayBuffer(signature),
                      chainName: sourceChainName,
                      magic: sourceChainMagic,
                      assetType,
                      senderId: body.senderId,
                  })
                  ) {
                      throw new Error
                  }
              ```

        - IMMIGRATE_ASSET -- AST-08 -- 资产迁入

          - 交易的手续费必须大于 0
            ```
                checkTrsFee(body.fee);
            ```
          - 交易的 rangeType 必须是 empty
            ```
                emptyRangeType(body);
            ```
          - 不能携带交易的接收账户地址
            ```
                if (body.recipientId) {
                    throw new Error
                }
            ```
          - 交易的来源链网络标识符不能是本链的网络标识符，交易的去往链网络标识符必须是本链的网络标识符
            ```
                if (body.fromMagic === config.magic) {
                    throw new Error
                }
                if (body.toMagic !== config.magic) {
                    throw new Error
                }
            ```
          - 必须携带查询用索引存储
            - key 值必须是 "transactionSignature"
            - value 必须是资产迁出交易的签名
            ```
                if (!body.storage) {
                    throw new Error
                }
                if (storate.key !== "transactionSignature") {
                    throw new Error
                }
                if (storage.value !== asset.immigrateAsset.transactionSignature) {
                    throw new Error
                }
            ```
          - 必须携带生成资产迁入交易的合法数据
            ```
                immigrateAsset = migrateAssetAsset.immigrateAsset;
                if (!immigrateAsset) {
                    throw new Error
                }
                const { genesisDelegateSignature, emigrateAssetTransaction } = immigrateAsset;
            ```
            - 必须携带完整的可验证的 资产迁出 交易
              ```
                  if (!emigrateAssetTransaction) {
                      throw new Error
                  }
                  const emigrateAssetTransactionModel = emigrateAssetTransactionFactory.fromJSON(
                  emigrateAssetTransaction,
                  );
                  const otherChainConfig = this.configMap.get(emigrateAssetTransactionModel.fromMagic);
                  if (!otherChainConfig) {
                      throw new Error
                  }
                  emigrateAssetTransactionFactory.verify(emigrateAssetTransactionModel, otherChainConfig);
              ```
            - 必须携带合法的可验证的本链创世受托人的签名
              - 签名由`资产迁出的签名`组成
              ```
                  if (!genesisDelegateSignature) {
                      throw new Error
                  }
                  if (!isValidAccountSignature(genesisDelegateSignature)) {
                      throw new Error
                  }
                  const { publicKey, signature } = genesisDelegateSignature;
                  const address = accountBaseHelper.getAddressFromPublicKeyString(publicKey);
                  const genesisDelegates = transactionHelper.genesisDelegates(config);
                  if (!genesisDelegates.includes(address)) {
                      throw new Error
                  }
                  if (!transactionHelper.verifyImmigrateAssetGenesisSignature({
                      secretPublicKey: parseHexToArrayBuffer(publicKey),
                      signatureBuffer: parseHexToArrayBuffer(signature),
                      transactionSignatureBuffer: emigrateAssetTransactionModel.signatureBuffer,
                  })
                  ) {
                      throw new Error
                  }
              ```


            - TO_EXCHANGE_ASSET -- AST-09 -- 申请资产交换交易

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 交易的 rangeType 必须是 empty
                    ```
                        emptyRangeType(body);
                    ```
                - 不能携带交易的接收者账户
                    ```
                        if (body.recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 交易体的 range 不能包含交易的发起账户地址
                    ```
                        if (body.range.includes(body.senderId)) {
                            throw new Error
                        }
                    ```
                - 必须携带生成数字资产交换的合法数据
                    ```
                        toExchangeAsset = asset.toExchangeAsset;
                        if (!toExchangeAsset) {
                            throw new Error
                        }
                    ```
                    - 必须携带合法的密文公钥组
                        - 必须是一个数组，可为空
                        - 每一项都必须是公钥
                        ```
                            if (!isValidCipherPublicKeys(toExchangeAsset.cipherPublicKeys)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的用于交换的数字资产所属链网络标识符
                        ```
                            if (!toExchangeAsset.toExchangeSource) {
                                throw new Error
                            }
                            if (!isValidChainMagic(toExchangeAsset.toExchangeSource)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的用于交换的数字资产所属链名
                        ```
                            if (!toExchangeAsset.toExchangeChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(toExchangeAsset.toExchangeChainName)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的用于交换的数字资产名
                        ```
                            if (!toExchangeAsset.toExchangeAsset) {
                                throw new Error
                            }
                            if (!isValidAssetType(toExchangeAsset.toExchangeAsset)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的用于交换的数字资产数量
                        ```
                            if (!toExchangeAsset.toExchangeNumber) {
                                throw new Error
                            }
                            if (!isValidAssetNumber(toExchangeAsset.toExchangeNumber) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的被交换的数字资产所属链网络标识符
                        ```
                            if (!toExchangeAsset.beExchangeSource) {
                                throw new Error
                            }
                            if (!isValidChainMagic(toExchangeAsset.beExchangeSource)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的被交换的数字资产所属链名
                        ```
                            if (!toExchangeAsset.beExchangeChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(toExchangeAsset.beExchangeChainName)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的被交换的数字资产名
                        ```
                            if (!toExchangeAsset.beExchangeAsset) {
                                throw new Error
                            }
                            if (!isValidAssetType(toExchangeAsset.beExchangeAsset)) {
                                throw new Error
                            }
                        ```
                    - 必须携带交换比例
                        ```
                            if (!isValidRate(toExchangeAsset.exchangeRate)) {
                                throw new Error
                            }
                        ```
                    - 如果携带了开始交换高度间隔，这个高度间隔必须是自然数
                        ```
                            if (toExchangeAsset.numberOfBeginUnfrozenBlocks !== undefined &&
                            !baseHelper.isNaturalNumber(toExchangeAsset.numberOfBeginUnfrozenBlocks)
                            ) {
                                throw new Error
                            }
                        ```

            - BE_EXCHANGE_ASSET -- AST-10 -- 接收数字资产转换交易

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 交易的 rangeType 必须是 empty
                    ```
                        emptyRangeType(body);
                    ```
                - 必须携带交易的接收账户地址，并且是 toExchangeAsset 交易的发起账户地址
                    ```
                        recipientId = body.recipientId;
                        if (!recipientId) {
                            throw new Error
                        }
                        if (body.senderId === recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 必须携带查询用索引存储
                    - key 值必须是 "transactionSignature"
                    - value 必须是 申请资产交换交易 的签名
                    ```
                        if (!body.storage) {
                            throw new Error
                        }
                        if (storate.key !== "transactionSignature") {
                            throw new Error
                        }
                        if (storage.value !== asset.beExchangeAsset.transactionSignature) {
                            throw new Error
                        }
                    ```
                - 必须携带生成数字资产交换的合法数据
                    ```
                        beExchangeAsset = beExchangeAssetAsset.beExchangeAsset;
                        if (!beExchangeAsset) {
                            throw new Error
                        }
                    ```
                    - 必须携带 申请资产交换交易 的签名
                        ```
                            const { transactionSignature } = beExchangeAsset;
                            if (!transactionSignature) {
                                throw new Error
                            }
                            if (!isValidSignature(transactionSignature)) {
                                throw new Error
                            }
                        ```
                    - 必须携带用于交换的资产数量和交换得到的资产数量
                        ```
                            const { toExchangeNumber, beExchangeNumber } = beExchangeAsset;
                            if (!toExchangeNumber) {
                                throw new Error
                            }
                            if (!isValidAssetNumber(toExchangeNumber)) {
                                throw new Error
                            }
                            if (!beExchangeNumber) {
                                throw new Error
                            }
                            if (!isValidAssetNumber(beExchangeNumber)) {
                                throw new Error
                            }
                        ```
                    - 必须携带 申请资产交换交易 的发起交易高度
                        ```
                            if (!isPositiveInteger(beExchangeAsset.applyBlockHeight)) {
                                throw new Error
                            }
                        ```
                    - 如果 申请资产交换交易 有指定开始交易高度间隔，则必须携带则个值
                        ```
                            if (beExchangeAsset.numberOfBeginUnfrozenBlocks) {
                               if (!isPositiveInteger(beExchangeAsset.numberOfBeginUnfrozenBlocks)) {
                                   throw new Error
                               }
                            }
                        ```
                    - 如果 申请资产交换交易 有指定交易的有效区块高度，则必须携带这个值
                        ```
                            if (beExchangeAsset.numberOfEffectiveBlocks) {
                                if (!isPositiveInteger(beExchangeAsset.numberOfEffectiveBlocks)) {
                                    throw new Error
                                }
                            }
                        ```
                    - 必须携带 申请资产交换交易 的 接收范围类型 rangeType 和 接收范围 range
                        - rangeType === MULTI_ADDRESS
                            - 交易的发起账户地址必须在 range 中
                        - rangeType === MULTI_DAPPID
                            - 交易的 dappid 必须在 range 中
                        - rangeType === MULTI_LOCATION_NAME
                            - 交易的 lns 必须在 range 中
                        ```
                            const { transactionRangeType, transactionRange } = beExchangeAsset;
                            if (!await isValidRange(transactionRangeType, transactionRange)) {
                                throw new Error
                            }
                            if (transactionRangeType & RANGE_TYPE.MULTI_ADDRESS) {
                                if (!transactionRange.includes(body.senderId)) {
                                    throw new Error
                                }
                            } else if (transactionRangeType & RANGE_TYPE.MULTI_DAPPID) {
                                if (!body.dappid || !transactionRange.includes(body.dappid)) {
                                    throw new Error
                                }
                            } else if (transactionRangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
                                if (!body.lns || !transactionRange.includes(body.lns)) {
                                    throw new Error
                                }
                            }
                        ```
                    - 用于交换的资产数量必须等于被交换资产数量价格转换后得到的资产数量
                        ```
                            const { exchangeAsset } = beExchangeAsset;
                            toExchangeAssetTransactionFactory.verifyToExchangeAsset(exchangeAsset);
                            if (!baseHelper.isValidRate(exchangeAsset.exchangeRate)) {
                                throw new Error
                            }
                            const minToExchangeNumber_BI = jsbiHelper.multiplyRoundFraction(
                            beExchangeAsset.beExchangeNumber,
                            {
                                numerator: exchangeAsset.exchangeRate.prevWeight,
                                denominator: exchangeAsset.exchangeRate.nextWeight,
                            },
                            );
                            if (
                            !JSBI.lessThanOrEqual(minToExchangeNumber_BI, JSBI.BigInt(beExchangeAsset.toExchangeNumber))
                            ) {
                                throw new Error
                            }
                        ```
                    - 如果是公钥模式，则密文必须存在，且密文签名合法
                        - 签名由` 申请资产交换交易的签名``发送者的地址 `组成
                        ```
                            const { cipherPublicKeys } = exchangeAsset;
                            if (cipherPublicKeys.length > 0) {
                                if (!baseHelper.isValidAccountSignature(beExchangeAsset.ciphertextSignature)) {
                                    throw new Error
                                }
                                const beExchangeAssetModel = BeExchangeAssetModel.fromObject(beExchangeAsset);
                                const { transactionSignatureBuffer, ciphertextSignature } = beExchangeAssetModel;
                                const { publicKeyBuffer, signatureBuffer, publicKey } = ciphertextSignature;
                                if (!cipherPublicKeys.includes(publicKey)) {
                                    throw new Error
                                }
                                /// 对密文进行解码校验
                                if (
                                    !this.transactionHelper.verifyCiphertextSignature({
                                    secretPublicKey: publicKeyBuffer,
                                    ciphertextSignatureBuffer: signatureBuffer,
                                    transactionSignatureBuffer: transactionSignatureBuffer,
                                    senderId: body.senderId,
                                    })
                                ) {
                                    throw new Error
                                }
                            }
                        ```

            - TO_EXCHANGE_SPECIAL_ASSET -- "AST-11" -- 申请特殊资产交换交易(售出/购买)

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 不能携带交易的接收账户地址
                    ```
                        if (body.recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 交易体的 range 不能包含交易的发起账户地址
                    ```
                        if (body.range.includes(body.senderId)) {
                            throw new Error
                        }
                    ```
                - 必须携带生成申请特殊资产交换交易的合法数据
                    ```
                        toExchangeSpecialAsset = asset.toExchangeSpecialAsset;
                        if (!toExchangeSpecialAsset) {
                            throw new Error
                        }
                        const {
                            toExchangeSource,
                            toExchangeChainName,
                            toExchangeAsset,
                            beExchangeSource,
                            beExchangeChainName,
                            beExchangeAsset,
                        } = toExchangeSpecialAsset;
                    ```
                    - 必须携带合法的密文公钥组
                        - 必须是一个数组，可为空
                        - 每一项都必须是公钥
                        ```
                            if (!isValidCipherPublicKeys(toExchangeSpecialAsset.cipherPublicKeys)) {
                                throw new Error
                            }
                        ```
                    - 必须携带用于交换的资产所属链的网络标识符
                        ```
                            if (!toExchangeSource) {
                                throw new Error
                            }
                            if (!isValidChainMagic(toExchangeSource)) {
                                throw new Error
                            }
                        ```
                    - 必须携带用于交换的资产所属链名
                        ```
                            if (!toExchangeChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(toExchangeChainName)) {
                                throw new Error
                            }
                        ```
                    - 必须携带被交换的资产所属链的网络标识符
                        ```
                            if (!beExchangeSource) {
                                throw new Error
                            }
                            if (!isValidChainMagic(beExchangeSource)) {
                                throw new Error
                            }
                        ```
                    - 必须携带被交换的资产所属链名
                        ```
                            if (!beExchangeChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(beExchangeChainName)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的交换的资产类型
                        ```
                            exchangeAssetType = toExchangeSpecialAsset.exchangeAssetType;
                            if (!SPECIAL_ASSET_TYPE[exchangeAssetType]) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的交换的方向
                        ```
                            exchangeDirection = toExchangeSpecialAsset.exchangeDirection;
                            if (!EXCHANGE_DIRECTION[exchangeDirection]) {
                                throw new Error
                            }
                        ```
                    - 如果是购买特殊资产
                        - 如果是购买 dappid
                            - 必须携带合法的 dappid
                        - 如果是购买 lns
                            - 必须携带合法的 lns
                        - 用于购买的资产名必须合法
                    - 如果是出售特殊资产
                        - 如果是出售 dappid
                            - 必须携带合法的 dappid
                        - 如果是出售 lns
                            - 必须携带合法的 lns
                        - 希望得到的资产名必须合法
                        ```
                            if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
                                if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
                                    if (!baseHelper.isValidDAppId(beExchangeAsset)) {
                                        throw new Error
                                    }
                                } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                                    if (!baseHelper.isValidLnsName(beExchangeAsset)) {
                                        throw new Error
                                    }
                                }
                                if (!baseHelper.isValidAssetType(toExchangeAsset)) {
                                    throw new Error
                                }
                            } else {
                                if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
                                    if (!baseHelper.isValidDAppId(toExchangeAsset)) {
                                        throw new Error
                                    }
                                } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                                    if (!baseHelper.isValidLnsName(toExchangeAsset)) {
                                        throw new Error
                                    }
                                }
                                if (!baseHelper.isValidAssetType(beExchangeAsset)) {
                                    throw new Error
                                }
                            }
                        ```
                    - 必须携带合法的 出售得到/用于购买的 资产数量
                        ```
                            if (!toExchangeSpecialAsset.exchangeNumber) {
                                throw new Error
                            }
                            if (!isValidAssetNumber(toExchangeSpecialAsset.exchangeNumber)) {
                                throw new Error
                            }
                        ```
                    - 如果 发起特殊资产交换交易指定开始交换的区块高度间隔，则必须携带这个值
                        ```
                           if (toExchangeSpecialAsset.numberOfBeginUnfrozenBlocks !== undefined &&
                            !baseHelper.isNaturalNumber(toExchangeSpecialAsset.numberOfBeginUnfrozenBlocks)
                            ) {
                                throw new Error
                            }
                        ```

            - BE_EXCHANGE_SPECIAL_ASSET -- "AST-12" -- 接收特殊资产交换交易

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 交易的 rangeType 必须是 empty
                    ```
                        emptyRangeType(body);
                    ```
                - 必须携带交易的接收账户地址，并且是 toExchangeSpecialAsset 交易的发起账户地址，并且不能是交易的发起账户
                    ```
                        recipientId = body.recipientId;
                        if (!recipientId) {
                            throw new Error
                        }
                        if (body.senderId === recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 必须携带查询用索引存储
                    - key 值必须是 "transactionSignature"
                    - value 必须是 申请特殊资产交换交易 的签名
                    ```
                        if (!body.storage) {
                            throw new Error
                        }
                        if (storate.key !== "transactionSignature") {
                            throw new Error
                        }
                        if (storage.value !== asset.beExchangeSpecialAsset.transactionSignature) {
                            throw new Error
                        }
                    ```
                - 必须携带生成接收特殊资产交换交易的合法数据
                    ```
                        beExchangeSpecialAsset = asset.beExchangeSpecialAsset;
                        if (!beExchangeSpecialAsset) {
                            throw new Error
                        }
                    ```
                    - 必须携带 申请特殊资产交换交易 的签名
                        ```
                            transactionSignature = beExchangeSpecialAsset.transactionSignature;
                            if (!transactionSignature) {
                                throw new Error
                            }
                            if (!isValidSignature(transactionSignature)) {
                                throw new Error
                            }
                        ```
                    - 必须携带 申请特殊资产交换交易 的发起交易高度
                        ```
                            if (!isPositiveInteger(beExchangeSpecialAsset.applyBlockHeight)) {
                                throw new Error
                            }
                        ```
                    - 如果 申请特殊资产交换交易 有指定开始交易高度间隔，则必须携带则个值
                        ```
                            if (beExchangeSpecialAsset.numberOfBeginUnfrozenBlocks) {
                                if (!isPositiveInteger(beExchangeSpecialAsset.numberOfBeginUnfrozenBlocks)) {
                                    throw new Error
                                }
                            }
                        ```
                    - 如果 申请特殊资产交换交易 有指定交易的有效区块高度，则必须携带这个值
                        ```
                            if (beExchangeSpecialAsset.numberOfEffectiveBlocks) {
                               if (!isPositiveInteger(beExchangeSpecialAsset.numberOfEffectiveBlocks)) {
                                   throw new Error
                               }
                            }
                        ```
                    - 必须携带 申请特殊资产交换交易 的 接收范围类型 rangeType 和 接收范围 range
                        - rangeType === MULTI_ADDRESS
                            - 交易的发起账户地址必须在 range 中
                        - rangeType === MULTI_DAPPID
                            - 交易的 dappid 必须在 range 中
                        - rangeType === MULTI_LOCATION_NAME
                            - 交易的 lns 必须在 range 中
                        ```
                            const { transactionRangeType, transactionRange } = beExchangeSpecialAsset;
                            if (!await isValidRange(transactionRangeType, transactionRange)) {
                                throw new Error
                            }
                            if (transactionRangeType & RANGE_TYPE.MULTI_ADDRESS) {
                                if (!transactionRange.includes(body.senderId)) {
                                    throw new Error
                                }
                            } else if (transactionRangeType & RANGE_TYPE.MULTI_DAPPID) {
                                if (!body.dappid || !transactionRange.includes(body.dappid)) {
                                    throw new Error
                                }
                            } else if (transactionRangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
                                if (!body.lns || !transactionRange.includes(body.lns)) {
                                    throw new Error
                                }
                            }
                        ```
                    - 如果是公钥模式，则密文必须存在，且密文签名合法
                        - 签名由` 申请特殊资产交换交易的签名``发送者的地址 `组成
                        ```
                            const { exchangeSpecialAsset } = beExchangeSpecialAsset;
                            /**校验`exchangeSpecialAsset`的基本格式 */verifyExchangeSpecialAsset(exchangeSpecialAsset);
                            const { cipherPublicKeys } = exchangeSpecialAsset;
                            /**如果是公钥模式，那么必须存在密文 */
                            if (cipherPublicKeys.length > 0) {
                                if (!baseHelper.isValidAccountSignature(beExchangeSpecialAsset.ciphertextSignature)) {
                                    throw new Error
                                }
                                const beExchangeSpecialAssetModel = BeExchangeSpecialAssetModel.fromObject(
                                    beExchangeSpecialAsset,
                                );
                                const { transactionSignatureBuffer, ciphertextSignature } = beExchangeSpecialAssetModel;
                                const { publicKeyBuffer, signatureBuffer, publicKey } = ciphertextSignature;
                                if (!cipherPublicKeys.includes(publicKey)) {
                                    throw new Error
                                }
                                /// 对密文进行解码校验
                                if (
                                    !this.transactionHelper.verifyCiphertextSignature({
                                    secretPublicKey: publicKeyBuffer,
                                    ciphertextSignatureBuffer: signatureBuffer,
                                    transactionSignatureBuffer: transactionSignatureBuffer,
                                    senderId: body.senderId,
                                    })
                                ) {
                                    throw new Error
                                }
                            }
                        ```

            - LOCATION_NAME -- LNS-00 -- 申请链域名交易

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 交易的 rangeType 必须是 empty
                    ```
                        emptyRangeType(body);
                    ```
                - 不能携带交易的接收账户地址
                    ```
                        if (body.recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 必须携带生成申请链域名的合法数据
                    ```
                        locationName = asset.locationName;
                        if (!locationName) {
                            throw new Error
                        }
                    ```
                    - 必须携带合法的链域名
                        - 字符串，2-1024 个字符
                        - 不能以 "." 开头或结尾
                        - 顶级域名
                            - 只能是小写字母
                            - 长度小于等于 128 个字符
                        - 多级域名
                            - 每段域名的长度小于等于 128 个字符
                            - 除最后一级外，每级域名只能由字母开头，内容可包含数字
                            - 最后一级只能是小写字母
                        ```
                           lnsName = locationName.name;
                            if (!lnsName) {
                                throw new Error
                            }
                            if (!isString(lnsName)) {
                                throw new Error
                            }
                            if (lnsName.length < 2) {
                                throw new Error
                            }
                            const name = lnsName.substr(1);
                            const names = name.split(".");
                            if (name.length > 1024) {
                                throw new Error
                            }
                            // 能以 . 开头或结尾
                            if (isStartWithOrEndWithPoint(name)) {
                                throw new Error
                            }
                            namesLength = names.length;
                            if (namesLength === 1) {
                                const lnsName = names[0];
                                if (!isLowerCaseString(lnsName)) {
                                    throw new Error
                                }
                                if (lnsName.length > 128) {
                                    throw new Error
                                }
                            } else {
                                for (let i = 0; i < namesLength; i++) {
                                    const lnsName = names[i];
                                    if (lnsName.length > 128) {
                                        throw new Error
                                    }
                                    if (i !== namesLength - 1) {
                                        if (!isStartWithLeterAndOtherContainNumber(lnsName)) {
                                            throw new Error
                                        }
                                    } else {
                                        if (!isLowerCaseString(lnsName)) {
                                            throw new Error
                                        }
                                    }
                                }
                            }
                            const { sourceChainName, sourceChainMagic } = locationName;
                        ```
                    - 必须携带合法的链域名所属链名，且等于当前链
                        ```
                            if (!sourceChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(sourceChainName)) {
                                throw new Error
                            }
                            if (sourceChainName !== config.chainName) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的链域名所属链网络标识符，且等于当前链
                        ```
                            if (!sourceChainMagic) {
                                throw new Error
                            }
                            if (!isValidChainMagic(sourceChainMagic)) {
                                throw new Error
                            }
                            if (sourceChainMagic !== config.magic) {
                                throw new Error
                            }
                        ```

            - SET_LNS_RECORD_VALUE -- LNS-01 -- 设置链域名的解析值交易

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 交易的 rangeType 必须是 empty
                    ```
                        emptyRangeType(body);
                    ```
                - 不能携带交易的接收账户地址
                    ```
                        if (body.recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 必须携带查询用索引存储
                    - key 值必须是 "name"
                    - value 必须是 欲设置解析值的链域名
                    ```
                        if (!body.storage) {
                            throw new Error
                        }
                        if (storate.key !== "name") {
                            throw new Error
                        }
                        if (storage.value !== asset.lnsRecordValue.name) {
                            throw new Error
                        }
                    ```
                - 必须携带生成设置链域名解析值的合法数据
                    ```
                        lnsRecordValue = asset.lnsRecordValue;
                        if (!lnsRecordValue) {
                            throw new Error
                        }
                        const { sourceChainName, sourceChainMagic, recordType, recordValue } = lnsRecordValue;
                    ```
                    - 必须携带合法的欲设置解析值的链域名
                        ```
                            name = lnsRecordValue.name;
                            if (!name) {
                                throw new Error
                            }
                            if (!isValidLnsName(name)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的欲设置解析值的链域名所属链的名称
                        ```
                            if (!sourceChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(sourceChainName)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的欲设置解析值的链域名所属链的网络标识符
                        ```
                            if (!sourceChainMagic) {
                                throw new Error
                            }
                            if (!isValidChainMagic(sourceChainMagic)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法且存在的解析类型和相应的值
                        - IPV4：合法的 ipV4
                        - IPV6：合法的 ipV6
                        - 经纬度解析：字符串
                        ```
                            if (!recordType) {
                                throw new Error
                            }
                            if (!recordValue) {
                                throw new Error
                            }
                            if (RECORD_TYPE.IPV4 === recordType) {
                                if (!baseHelper.ipRegex().v4.test(recordValue)) {
                                    throw new Error
                                }
                            } else if (RECORD_TYPE.IPV6 === recordType) {
                                if (!baseHelper.ipRegex().v6.test(recordValue)) {
                                    throw new Error
                                }
                            } else if (RECORD_TYPE.LNG_LAT === recordType) {
                                if (!baseHelper.isString(recordValue)) {
                                    throw new Error
                                }
                            } else {
                                throw new Error
                            }
                        ```

            - SET_LNS_MANAGER -- LNS-02 -- 设置链域名的管理员交易

                - 交易的手续费必须大于 0
                    ```
                        checkTrsFee(body.fee);
                    ```
                - 交易的 rangeType 必须是 empty
                    ```
                        emptyRangeType(body);
                    ```
                - 必须携带交易的接收者账户，并且不能和发起账户地址相等，并且是新的管理员账户地址
                    ```
                        recipientId = body.recipientId;
                        if (!recipientId) {
                            throw new Error
                        }
                        if (body.senderId === recipientId) {
                            throw new Error
                        }
                    ```
                - 交易的来源链和去往链的网络标识符必须是本链的网络标识符
                    ```
                        if (body.fromMagic !== config.magic) {
                            throw new Error
                        }
                        if (body.toMagic !== config.magic) {
                            throw new Error
                        }
                    ```
                - 必须携带查询用索引存储
                    - key 值必须是 "name"
                    - value 必须是 欲设置链域名管理员的链域名
                    ```
                        if (!body.storage) {
                            throw new Error
                        }
                        if (storate.key !== "name") {
                            throw new Error
                        }
                        if (storage.value !== asset.lnsRecordValue.name) {
                            throw new Error
                        }
                    ```
                - 必须携带生成设置链域名管理员的合法数据
                    ```
                        lnsManager = lnsManagerAsset.lnsManager;
                        if (!lnsManager) {
                            throw new Error
                        }
                    ```
                    - 必须携带合法的欲设置管理员的链域名
                        ```
                            name = lnsManager.name;
                            if (!isValidLnsName(name)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的欲设置管理员的链域名所属链的名称
                        ```
                            const { sourceChainName, sourceChainMagic } = lnsManager;
                            if (!sourceChainName) {
                                throw new Error
                            }
                            if (!isValidChainName(sourceChainName)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的欲设置管理员的链域名所属链的网络标识符
                        ```
                            if (!sourceChainMagic) {
                                throw new Error
                            }
                            if (!isValidChainMagic(sourceChainMagic)) {
                                throw new Error
                            }
                        ```
                    - 必须携带合法的新管理员账户地址，且等于交易的接收账户地址
                        ```
                            if (lnsManager.manager !== recipientId) {
                                throw new Error
                            }
                        ```

## pc 端交易验证和处理逻辑

### 交易

- 所有交易的接收入口为 channel 中双工的 onNewTransaction 事件。查询入口为 onQueryTransaction 事件
- 接收新交易
  1. 校验交易的手续费是否充足
     - 交易手续费大于等于网络手续费
       ```
            if (tr.fee < webFee) {
                throw new Error
            }
       ```
     - 交易手续费大于等于矿机手续费
       ```
            if (tr.fee < miningMachineFee) {
                throw new Error
            }
       ```
  2. 接收到新交易时的逻辑校验
     - 如果交易已经在未处理交易进程则报错
       ```
            processName = getUntreatedTrsClient(tr.senderId);
            untreatedTrsResult = await getUntreatedTrbyId({id: tr.id});
            if (untreatedTrsResult === 1) {
                throw new Error
            }
       ```
     - 如果交易已经在链上则报错(交易已经在交易表)
       ```
            countTrsResult = await countTable(modTrs, {
                transaction.id: tr.id
            });
            if (countTrsResult && countTrsResult >= 1) {
                throw new Error
            }
       ```
     - 如果二次操作同一笔交易则报错(红包/委托/资产交换等)
       ```
            count = await countTable(modTrs, {
                "transaction.senderId": transaction.senderId,
                "transaction.storageValue": transaction.storageValue,
            });
            if (count > 0) {
                throw new Error
            }
       ```
     - 验证交易发起者的账户是否存在
       - 必须包含账户信息和资产信息
         ```
            if (!(sender && sender.accountInfo && sender.accountAsset && sender.accountAsset.assets)) {
                throw new Error
            }
         ```
       - 如果账户没有公钥，则初始化账户公钥
         ```
            if (!accountInfo.publicKey) {
                accountInfo = await mergeAccountInfo({
                    publicKey: tr.senderPublicKey,
                    height: currentBlockHeight
                });
            }
         ```
       - 如果还是没有账户公钥，则报错
         ```
            if (!accountInfo.publicKey) {
                throw new Error
            }
         ```
     - 校验发起账户状态
       - 如果账户状态为`禁止资产转出`或者`禁止资产转入转出`，则报错
         ```
            if (!(accountInfo && accountInfo.hasOwnProperty("accountStatus"))) {
                throw new Error
            }
            if (accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_OUT || accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_IN_AND_OUT) {
                throw new Error
            }
         ```
     - 校验二次密码
       - 账户已有二次密码公钥
         - 如果交易没有携带发起账户二次公钥和二次签名则报错
           ```
                if (!(tr.senderSecondPublicKey && tr.signSignature)) {
                    throw new Error
                }
           ```
         - 如果账户的二次密码公钥不等于交易体携带发起账户二次公钥则报错
           ```
                if (accountInfo.secondPublicKey !== tr.senderSecondPublicKey) {
                    throw new Error
                }
           ```
       - 账户没有二次密码公钥
         - 如果交易体携带发起账户二次公钥则报错
           ```
                if (tr.senderSecondPublicKey) {
                    throw new Error
                }
           ```
         - 如果交易体携带二次签名则报错
           ```
                if (tr.signSignature) {
                    throw new Error
                }
           ```
     - 校验交易的发起高度
       - 如果交易的发起高度大于当前链最新块高度，则报错
         ```
            if (trsApplyHeight > currentBlockHeight) {
                throw new Error
            }
         ```
       - 计算交易从发起到当前块高度的区块间隔数 diffHeight
         ```
            diffHeight = currentBlockHeight - trsApplyBlockHeight;
         ```
       - 如果交易体携带交易的有效区块高度
         - 如果交易体携带的有效期大于最大交易有效期则报错
           ```
                if (numberOfEffectiveBlocks > maxApplyAndConfirmedBlockHeightDiff) {
                    throw new Errror
                }
           ```
         - 如果 diffHeight 大于交易的有效区块高度，则报错(交易已经过期)
           ```
                if (diffHeight > numberOfEffectiveBlocks) {
                    throw new Error
                }
           ```
       - 如果交易体没有携带交易的有效区块高度
         - 如果 diffHeight 大于最大交易有效期则报错
           ```
                if (diffHeight > maxApplyAndConfirmedBlockHeightDiff) {
                    throw new Error
                }
           ```
     - 校验交易的 magic(根据当前链的网络标识符是否等于父链的网络标识符，创世块携带父链的网络标识符)
       - 交易来自本链
         - 交易去往本链，无需其他判断
           ```
                if (toMagic === chainMagic) {
                    return;
                }
           ```
         - 交易去往其他链
           - 去往的注册链的交易, 去往的链必须已经在链上注册过
           ```
                const chain = await accountGetterHelper.getChain(toMagic);
                if (!chain) {
                    throw new Error
                }
           ```
       - 交易来自外链
         - 来自的外链必须已经在链上注册过
           ```
               const chain = await accountGetterHelper.getChain(fromMagic);
               if (!chain) {
                   throw new Error
               }
           ```
         - 必须是去往本链
           ```
               if (toMagic !== chainMagic) {
                   throw new Error
               }
           ```
     - 校验交易时间戳
       - 如果交易携带的时间戳大于节点当前的区块链时间则报错
         ```
            if (bfchainCore.time.getSlotNumberByTimestamp(tr.timestamp) > bfchainCore.time.getSlotNumberByTimestamp()) {
                throw new Error
            }
         ```
     - 校验交易的接收范围
       - EMPTY 校验结束
         ```
            if (rangeType === RANGE_TYPE>EMPTY) {
                return;
            }
         ```
       - MULTI_ADDRESS range 内如果某个账户状态为 `禁止资产转出`或者 `禁止资产转入转出` 则报错（只能保证当前账户状态，可能下一笔就被改了）
         ```
            for (const address of range) {
                accountInfo = await getAccountInfo(address);
                checkSenderAccountStatus(accountInfo);
            }
         ```
       - MULTI_DAPPID range 内如果某个 `dappid` 不存在则报错
         ```
            for (const dappid of range) {
                memDapp = await getMemDapp(magic, dappid, currentBlockHeight);
                if (!memDapp) {
                    throw new Error
                }
            }
         ```
       - MULTI_LOCATION_NAME range 内如果某个 `lns` 不存在则报错
         ```
            for (const lns of range) {
                memLocation = await getMemLocationName(magic, lns, currentBlockHeight)
            }
         ```
     - 如果交易体携带接收者账户
       - 如果接收账户的状态为 `禁止资产转入` 或者 `禁止资产转入转出` 则报错
       ```
            recipient = await getAccountInfoAndAsset(tr.recipientId);
            if (recipient && recipient.accountInfo && recipient.accountAsset) {
                checkRecipientAccountStatus(recipient.accountInfo);
            }
       ```
     - 校验账户的资产余额是否充足
       - 监听 扣手续费 事件，如果发起账户的链资产余额不够付手续费则报错
         ```
            event.on("fee", (args) => {
                if (accountHodingAsset - fee < 0) {
                    throw new Error
                }
            });
         ```
       - 监听 扣资产 事件，如果账户的资产余额不够则报错
         ```
            event.on("asset", (args) => {
                if (accountHodingAsset - amount < 0) {
                    throw new Error
                }
            });
         ```
       - 监听 冻结资产 事件，如果账户的余额不够冻结则报错
         ```
            event.on("frozenAsset", (args) => {
                if (accountHodingAsset - amount < 0) {
                    throw new Error
                }
            });
         ```
       - 监听 扣权益 事件，如果账户的权益不够则报错
         ```
            event.on("voteEquity", (args) => {
                if (accountEquity - spendEquity < 0) {
                    throw new Error
                }
            });
         ```
     - 校验交易的最大字节数
       - 如果交易的字节数大于共识中的交易最大字节数则报错
         ```
            if (byteLength > maxTransactionSize) {
                throw new Error
            }
         ```
     - 校验交易的 dappid
       - 如果交易体没有携带 dappid 则验证结束
         ```
            if (!dappid) {
                return;
            }
         ```
       - 获取本地的 dappid 如果 dappid 不存在则报错
         ```
            dapp = await getMemDapp(magic, dappid, currentBlockHeight);
            if (!dapp) {
                throw new Error
            }
         ```
       - 如果 dappid 是付费类型
         - 如果交易的发起账户没有购买使用权则报错(dappPurasing 交易)(购买一次，永久有效？)
           ```
                count = await countTable(modTrs, {
                    "transaction.type": transactionHelper.DAPP_PURCHASING,
                    "transaction.senderId": trs.senderId,
                    "transaction.storageValue": dappid,
                });
                if (count === 0) {
                    throw new Error
                }
           ```
       - 如果是投票交易则验证结束
         ```
            if (trs.type === VOTE) {
                throw new Error
            }
         ```
       - 获取 dappid 的拥有者账户
         - 如果拥有者账户不存在则报错
           ```
                accountInfo = await getAccountInfo(dappPossessor)
                if (!accountInfo) {
                    throw new Error
                }
           ```
         - 如果拥有者账户开启了接收投票
           - 如果账户的发起账户在上一轮和当前轮没有给 dappid 的拥有者账户投票，则报错
             ```
                countVote = await getMemVotesByAddressAndVote(senderId, dappPossessor, curRound);
                if (countVote === 0) {
                    throw new Error
                }
             ```
     - 每种交易的业务验证
  3. 本链交易直接调用 receiveTransactionsAsync，将交易发往未处理交易进程
  4. 过程中出现错误则直接抛出。
- 查询交易

  1. 可根据交易 id、区块 id、最大最小高度、接收者地址、发送者地址、类型、查询结果分页、查询下标来查询交易。
  2. 超过矿机最大查询，返回节点繁忙 TODO 这个没有实现 直接是 return 了
  3. 根据传参去数据库查询,并返回交易数据

- 各种交易的业务逻辑(verify)

  1. 交易完整性验证，统一由 core 包实现，包含每种交易每个字段的格式，大小，缺省，交易的签名，二次签名，即从 core 包出来的交易就是完整的交易

  2. 交易接收时的业务逻辑

     - SIGNATURE -- BSE-01 -- 设置支付密码交易

     - USERNAME -- BSE-04 -- 注册用户别名交易

       - 如果交易的发起账户已经由用户名则报错
         ```
             if (accountInfo.username) {
                 throw new Error
             }
         ```
       - 如果用户名已经被抢注则报错
         ```
             username = asset.username.alias;
             memUsername = await getMemUsername(username);
             if (memUsername) {
                 throw new Error
             }
         ```

     - DELEGATE -- BSE-02 -- 注册为受托人交易

       - 如果发起账户的用户名不存在则报错
         ```
             if (!accountInfo.username) {
                 throw new Error
             }
         ```
       - 如果交易携带的用户名不等于账户的用户名则报错
         ```
             if (delegate.username!== accountInfo.username) {
                 throw new Error
             }
         ```
       - 如果发起账户已经是受托人则报错
         ```
             if (accountInfo.isDelegate) {
                 throw new Error
             }
         ```

     - ACCEPT_VOTE -- BSE-05 -- 受托人接收投票交易

       - 如果交易的发起账户不是受托人账户则报错
         ```
             if (!accountInfo.isDelegate) {
                 throw new Error
             }
         ```
       - 如果交易的发起账户已经开启接收投票则报错
         ```
             if (accountInfo.isAcceptVote) {
                 throw new Error
             }
         ```

     - REJECT_VOTE -- BSE-06 -- 受托人拒绝投票交易

       - 如果交易的发起账户不是受托人账户则报错
         ```
             if (!accountInfo.isDelegate) {
                 throw new Error
             }
         ```
       - 如果交易的发起账户已经开启拒绝投票则报错
         ```
             if (!accountInfo.isAcceptVote) {
                 throw new Error
             }
         ```

     - VOTE -- BSE-03 -- 投票交易

       - 如果交易携带 dappid
         ```
             if (tr.dappid)
         ```
         - 如果 dapp 不存在则报错
           ```
               dapp = await getMemDapp(magic, dappid, currentBlockHeight);
               if (!dapp) {
                   throw new Error
               }
           ```
         - 如果本票投给 dapp 的拥有者账户则验证结束
           ```
               if (dapp.markPossessor === tr.recipientId) {
                   return;
               }
           ```
         - 本票投给其他人
           - dapp 的开发账户没有开启接收投票，验证结束
           ```
               accountInfo = await getAccountInfo(dapp.markPossessor);
               if (!accountInfo) {
                   throw new Error
               }
               if (!accountInfo.isAcceptVote) {
                   return;
               }
           ```
           - dapp 的开发账户开启接收投票
             - 如果交易的发起账户从上一轮到当前块没有给 dapp 的拥有者账户投过票，没有则报错
             ```
                 curRound = calcRound(currentBlockHeight);
                 countVote = await getMemVotesByAddressAndVote(tr.senderId, dapp.markPossessor, curRound)
             ```

     - DAPP -- WOD-00 -- 注册侧链应用交易

       - 如果 dapp 已经被抢注则报错
         ```
             memDapp = await getMemDapp(dapp.sourceChainMagic, dapp.dappid, currentBlockHeight);
             if (memDapp) {
                 throw new Error
             }
         ```

     - DAPP_PURCHASING -- 购买侧链应用

       - 如果购买的 dapp 不存在则报错
         ```
             memDapp = await getMemDapp(dapp.souceChainMagic, dapp.dappid, currentBlockHeight);
             if (!memDapp) {
                 throw new Error
             }
         ```
       - 如果交易的发起账户时 dapp 的拥有者账户则报错
         ```
             if (tr.senderId === memDapp.markPossessor) {
                 throw new Error
             }
         ```
       - 如果交易的接收者账户不等于 dapp 的拥有者账户则报错
         ```
             if (tr.recipientId !== memDapp.markPossessor) {
                 throw new Error
             }
         ```

     - MARK -- EXT-00 -- 数据存证交易

       - 如果 mark 所属的 dapp 不存在则报错
         ```
             memDapp = await getMemDapp(sourceChainMagic, dappid, currentBlockHeight);
             if (!memDapp) {
                 throw new Error
             }
         ```

     - REGISTER_CHAIN -- WOD-01 -- 发行注册链交易,

       - 如果账户拥有除链资产外的资产则报错
         ```
             checkAccountAsset(senderAssets);
         ```
       - 如果发起账户扣除手续费后没有足够的链资产则报错(创世块设定)
         ```
             remainBalance = accountChainAsset - tr.fee;
             if (registerChainMinChainAsset > remainBalance) {
                 throw new Error
             }
         ```
       - 注册链的发起账户不能是 dapp 的拥有者账户
         ```
            const memDApp = await getMemDApp(chainMagic, "", currentBlockHeight, {
                address,
            });
            if (memDApp) {
                throw new Error
            }
         ```
       - 注册链的发起账户不能是链域名的发起账户或管理员账户
         ```
             memLnsNameByPossessor = await getMemLocationName(possessor: tr.senderId);
             if (memLnsNameByPossessor) {
                 throw new Error
             }
             memLnsNameByManager = await getMemLocationName(manager: tr.senderId);
             if (memLnsNameByManager) {
                 throw new Error
             }
         ```

     - ISSUE_ASSET -- AST-00 -- 发行数字资产交易

       - 如果账户拥有除链资产外的资产则报错
         ```
             checkAccountAsset(senderAssets);
         ```
       - 如果发起账户扣除手续费后没有足够的链资产则报错(创世块设定)
         ```
             remainBalance = accountChainAsset - tr.fee;
             if (issueAssetMinChainAsset > remainBalance) {
                 throw new Error
             }
         ```
       - 发行数字资产的账户不能是链域名的发起账户或管理员账户
         ```
             memLnsNameByPossessor = await getMemLocationName(possessor: tr.senderId);
             if (memLnsNameByPossessor) {
                 throw new Error
             }
             memLnsNameByManager = await getMemLocationName(manager: tr.senderId);
             if (memLnsNameByManager) {
                 throw new Error
             }
         ```
       - 数字资产和链资产的兑换比例不能大于设定值(创世块设定)
         ```
             maxIssueAssets = remainBalance * constants.chainAssetAndDigitalAssetExchangeRate;
             if (issueAsset.expectedIssueAssets > maxIssueAssets) {
                 throw new Error
             }
         ```
       - 如果数字资产名已经被占用则报错
         ```
             memLegalCurrency = await getMemLegalCurrency(issueAssetType);
             if (memLegalCurrency) {
                 throw new Error
             }
         ```
       - 如果数字资产的创世账户没有给交易的发起账户转过账则报错
         ```
             countTrs = await countTable(modTrs, {
                 "transaction.senderId": issueAsset.genesisAddress,
                 "transaction.recipientId": tr.senderId,
                 "transaction.type": transactionHelper.TRANSFER_ASSET,
             });
             if (countTrs < 1) {
                 throw new Error
             }
         ```
       - 如果数字资产已经存在则报错
         ```
             memAssets = await getMemAsset(tr.fromMagic, issueAssetType);
             if (memAssets) {
                 throw new Error
             }
         ```

     - TRANSFER_ASSET -- AST-01 -- 数字资产转账交易

     - DESTORY_ASSET -- AST-02 -- 销毁数字资产交易

       - 如果销毁的数字资产不存在则报错
         ```
             memAssets = await getMemAsset(souceChainMagic, assetType);
             if (!memAssets) {
                 throw new Error
             }
         ```
       - 数字资产的创世账户不能销毁资产
         ```
             if (memAssets.genesisAddress === tr.senderId) {
                 throw new Error
             }
         ```
       - 本链资产不能销毁
         ```
             if (assetType === constants.assetType) {
                 throw new Error
             }
         ```

     - GIFT_ASSET -- AST-03 -- 发红包交易

     - GRAB_ASSET -- AST-04 -- 抢红包交易

       - 如果 giftAsset 交易不存在，则报错
         ```
             trsRows = await getData(modTrs, {
                 "transaction.signature": transactionSignature
             })
             if (!trsRows) {
                 throw new Error
             }
         ```
       - 如果携带的红包信息和 giftAsset 不匹配，则报错
         ```
             trsAsset = gitTrs.asset.giftAsset;
             if (
                 trsAsset.sourceChainMagic !== sourceChainMagic ||
                 trsAsset.assetType !== assetType ||
                 trsAsset.giftDistributionRule !== giftDistributionRule ||
                 trs.applyBlockHeight !== applyBlockHeight ||
                 trs.rangeType !== transactionRangeType ||
                 trs.range.length !== transactionRange.length
             ) {
                 throw new Error
             }
             if (giftTrs.numberOfEffectiveBlocks) {
                 if (giftNumberOfEffictiveBlocks !== giftTrs.numberOfEffictiveBlocks) {
                     throw new Error
                 }
             }
             if (giftTrs.numberOfBeginUnfrozenBlocks) {
                 if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
                     throw new Error
                 }
             }
         ```
       - 如果还没有到达解冻高度则报错
         ```
             frozenAsset = await getFrozenAsset({
                 transactionSignature: transactionSignature,
                 magic: sourceChainMagic,
                 assetType,
             });
             if (frozenAsset.minEffectiveHeight > tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果 giftAsset 交易已经过期则报错
         ```
             if (currentBlockHeight > frozenAsset.maxEffectiveHeight) {
                 throw new Error
             }
             if (frozenAsset.maxEffectiveHeight < tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果 giftAsset 剩余的可抢数量不足则报错
         ```
             if (frozenAsset.amount > amount) {
                 throw new Error
             }
         ```
       - 如果 giftAsset 剩余的可抢次数为 0 则报错
         ```
             if (frozenAsset.remainUnfrozenTimes && frozenAsset.remainUnfrozenTimes === 0) {
                 throw new Error
             }
         ```

     - TRUST_ASSET -- AST-05 -- 资产委托交易

       - 委托账户不能是冻结账户
         ```
             for (const trustee of trustees) {
                 accountInfo = await getAccountInfo(trustee);
                 checkSenderAccountStatus(accountInfo);
             }
         ```

     - SIGN_FOR_ASSET -- AST-06 -- 链外数字资产返回交易

       - 如果 trustAsset 交易不存在，则报错
         ```
             trsRows = await getData(modTrs, {
                 "transaction.signature": trustTransactionSignature
             })
             if (!trsRows) {
                 throw new Error
             }
         ```
       - 如果携带的委托信息和 trustAsset 不匹配，则报错
         ```
             if (
                 trsAsset.sourceChainMagic !== trustAsset.sourceChainMagic ||
                 trsAsset.assetType !== trustAsset.assetType ||
                 trsAsset.amount !== trustAsset.amount ||
                 trsAsset.trustees.length !== trustAsset.trustees.length ||
                 trsAsset.numberOfSignFor !== trustNumberOfSignFor ||
                 trs.applyBlockHeight !== applyBlockHeight ||
                 trs.senderId !== trustSenderId ||
                 trs.recipientId !== trustRecipientId
             ) {
                 throw new Error
             }
             if (trustTrs.numberOfEffectiveBlocks) {
                 if (numberOfEffectiveBlocks !== trustTrs.numberOfEffictiveBlocks) {
                     throw new Error
                 }
             }
             if (trustTrs.numberOfBeginUnfrozenBlocks) {
                 if (trustNumberOfBeginGrabBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
                     throw new Error
                 }
             }
             trustTrsRange = [...trs.range, ...trsAsset.trustees];
             trustRange = [...trustAsset.trustees];
             for (const address of trustTrsRange) {
                 if (!trustRange.includes(address)) {
                     throw new ResError(`Trust asset not match`, `transaction signature ${tr.signature} trust asset transaction signature ${transactionSignature}`);
                 }
             }
         ```
       - 如果还没有到达解冻高度则报错
         ```
             frozenAsset = await getFrozenAsset({
                 transactionSignature: trustTransactionSignature,
                 magic: sourceChainMagic,
                 assetType,
             });
             if (frozenAsset.minEffectiveHeight > tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果 trustAsset 交易已经过期则报错
         ```
             if (currentBlockHeight > frozenAsset.maxEffectiveHeight) {
                 throw new Error
             }
             if (frozenAsset.maxEffectiveHeight < tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果委托交易剩余的资产数量为 0 则报错(已被签收)
         ```
             if (frozenAsset.amount === "0") {
                 throw new Error
             }
         ```

     - EMIGRATE_ASSET -- AST-07 -- 资产迁出交易

       - 如果账户持有其他资产，则报错
         ```
             checkAccountAsset(senderAssets);
         ```
       - 如果迁出的不是账户的所有链资产，则报错(FIXME: 投票和资产转入会导致余额变更进而导致交易验证失败)
         ```
             totalSpend = tr.fee + tr.amount;
             if (accountHoldingAsset !== totalSpend) {
                 throw new Error
             }
         ```

     - IMMIGRATE_ASSET -- AST-08 -- 资产迁入交易(迁入时是否需要考虑迁出交易是否过期)

       - 如果迁出的资产已经迁入则报错
         ```
             count = await countTable(modTrs, {
                 "transaction.type": transactionHelper.IMMIGRATE_ASSET,
                 "transaction.storageValue": emigrateAssetTransaction.signature,
             });
             if (count > 0) {
                 throw new Error
             }
         ```

     - TO_EXCHANGE_ASSET -- AST-09 -- 发起数字资产转换交易

       - 如果用于交换的资产不存在，则报错
         ```
             memAsset = await getMemAsset(toExchangeSource, toExchangeAsset);
             if (!memAsset) {
                 throw new Error
             }
         ```
       - 如果被交换的资产不存在，则报错
         ```
             memAsset = await getMemAsset(beExchangeSource, beExchangeAsset);
             if (!memAsset) {
                 throw new Error
             }
         ```

     - BE_EXCHANGE_ASSET -- AST-10 -- 接收数字资产转换交易

       - 如果 toExchangeAsset 交易不存在，则报错
         ```
             trsRows = await getData(modTrs, {
                 "transaction.signature": toExchangeAssetTransactionSignature
             });
             if (!trsRows) {
                 throw new Error
             }
         ```
       - 如果携带的交换信息和 toExchangeAsset 不匹配，则报错
         ```
             if (
                 trsAsset.toExchangeSource !== toExchangeSource ||
                 trsAsset.beExchangeSource !== beExchangeSource ||
                 trsAsset.toExchangeAsset !== toExchangeAsset ||
                 trsAsset.beExchangeAsset !== beExchangeAsset ||
                 toExchangeAssetTrs.applyBlockHeight !== applyBlockHeight ||
                 toExchangeAssetTrs.rangeType !== transactionRangeType ||
                 toExchangeAssetTrs.range.length !== transactionRange.length
             ) {
                 throw new Error
             }
             if (toExchangeAssetTrs.numberOfEffectiveBlocks) {
                 if (numberOfEffectiveBlocks !== toExchangeAssetTrs.numberOfEffectiveBlocks) {
                     throw new Error
                 }
             }
             if (trsAsset.numberOfBeginUnfrozenBlocks) {
                 if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
                     throw new Error
                 }
             }
         ```
       - 如果还没有到达解冻高度则报错
         ```
             frozenAsset = await getFrozenAsset({
                 transactionSignature: toExchangeAssetTransactionSignature,
                 magic: sourceChainMagic,
                 assetType,
             });
             if (frozenAsset.minEffectiveHeight > tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果 toExchangeAsset 交易已经过期则报错
         ```
             if (currentBlockHeight > frozenAsset.maxEffectiveHeight) {
                 throw new Error
             }
             if (frozenAsset.maxEffectiveHeight < tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果剩余的可交换数量不足则报错
         ```
             if (toExchangeNumber > frozenAsset.amount) {
                 throw new Error
             }
         ```

     - TO_EXCHANGE_SPECIAL_ASSET -- AST-11 -- 发起特殊资产交换交易

       - 如果是求购(特殊资产来自接收账户)
         - 如果用于购买的数字资产不存在则报错
           ```
               memToAssets = await getMemAsset(toExchangeSource, toExchangeAsset);
               if (!memToAssets) {
                   throw new Error
               }
           ```
         - 如果是购买 dappid
           - 如果求购的 dappid 不存在则报错
             ```
                 memDapp = await getMemDapp(beExchangeSource, beExchangeAsset);
                 if (!memDapp) {
                     throw new Error
                 }
             ```
           - 如果求购人是 dappid 的拥有者账户则报错
             ```
                 if (memDapp.markPossessor === senderId) {
                     throw new Error
                 }
             ```
         - 如果是购买 lns
           - 如果求购的 lns 不存在则报错
             ```
                 memLocation = await getMemLocationName(beExchangeSource, beExchangeAsset);
                 if (!memLocation) {
                     throw new Error
                 }
             ```
           - 如果求购人是 lns 的拥有者账户则报错
             ```
                 if (memLocation.possessor === senderId) {
                     throw new Error
                 }
             ```
           - 如果求购的 lns 不是顶级域名则报错
             ```
                 if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
                     throw new Error
                 }
             ```
       - 如果是售出(特殊资产来自发起账户)
         - 如果指定的换购数字资产不存在则报错
           ```
               memBeAssets = await getMemAsset(beExchangeSource, beExchangeAsset);
               if (!memBeAssets) {
                   throw new Error
               }
           ```
         - 如果是售出 dappid
           - 如果出售的 dappid 不存在则报错
             ```
                 memDapp = await getMemDapp(toExchangeSource, toExchangeAsset);
                 if (!memDapp) {
                     throw new Error
                 }
             ```
           - 如果出售人不是 dappid 的拥有者账户则报错
             ```
                 if (memDapp.markPossessor !== senderId) {
                     throw new Error
                 }
             ```
           - 如果出售的 dappid 已经处于冻结状态则报错
             ```
                 if (memDapp.status === ASSET_STATUS.FROZEN) {
                     throw new Error
                 }
             ```
         - 如果是售出 lns
           - 如果出售的 lns 不存在则报错
             ```
                 memLocation = await getMemLocationName(toExchangeSource, toExchangeAsset);
                 if (!memLocation) {
                     throw new Error
                 }
             ```
           - 如果出售人是 lns 的拥有者账户则报错
             ```
                 if (memLocation.possessor !== senderId) {
                     throw new Error
                 }
             ```
           - 如果出售的 lns 已经处于冻结状态则报错
             ```
                 if (memLocation.status === ASSET_STATUS.FROZEN) {
                     throw new Error
                 }
             ```
           - 如果出售的 lns 不是顶级域名则报错
             ```
                 if (memLocation.level !== LOCATION_NAME_LEVEL.TOP_LEVEL) {
                     throw new Error
                 }
             ```

     - BE_EXCHANGE_SPECIAL_ASSET -- AST-12 -- 接收特殊资产交换交易

       - 如果 toExchangeSpecialAsset 交易不存在则报错
         ```
             trsRows = await getData(modTrs, {
                 "transaction.signature": toExchangeSpecialAssetTransactionSignature
             })
             if (!trsRows) {
                 throw new Error
             }
         ```
       - 如果交易携带的交换信息和 toExchangeSpecialAsset 不匹配则报错
         ```
             if (
                 trsAsset.toExchangeSource !== toExchangeSource ||
                 trsAsset.beExchangeSource !== beExchangeSource ||
                 trsAsset.toExchangeAsset !== toExchangeAsset ||
                 trsAsset.beExchangeAsset !== beExchangeAsset ||
                 toExchangeSpecialAssetTrs.applyBlockHeight !== applyBlockHeight ||
                 toExchangeSpecialAssetTrs.rangeType !== transactionRangeType ||
                 toExchangeSpecialAssetTrs.range.length !== transactionRange.length
             ) {
                 throw new Error
             }
             if (toExchangeSpecialAssetTrs.numberOfEffectiveBlocks) {
                 if (numberOfEffectiveBlocks !== toExchangeSpecialAssetTrs.numberOfEffectiveBlocks) {
                     throw new Error
                 }
             }
             if (trsAsset.numberOfBeginUnfrozenBlocks) {
                 if (numberOfBeginUnfrozenBlocks !== trsAsset.numberOfBeginUnfrozenBlocks) {
                     throw new Error
                 }
             }
         ```
       - 如果还没有到达解冻高度则报错
         ```
             frozenAsset = await getFrozenAsset({
                 transactionSignature: trustTransactionSignature,
                 magic: sourceChainMagic,
                 assetType,
             });
             if (frozenAsset.minEffectiveHeight > tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果 toExchangeSpecialAsset 交易已经过期则报错
         ```
             if (currentBlockHeight > frozenAsset.maxEffectiveHeight) {
                 throw new Error
             }
             if (frozenAsset.maxEffectiveHeight < tr.applyBlockHeight) {
                 throw new Error
             }
         ```
       - 如果 toExchangeSpecialAsset 是求购
         - 如果是求购 dappid
           - 如果交易的发起账户不是 dapp 的拥有者则报错
             ```
                 memDapp = await getMemDapp(beExchangeSource, beExchangeAsset);
                 if (!memDapp) {
                     throw new Error
                 }
                 if (memDapp.markPossessor !== senderId) {
                     throw new Error
                 }
             ```
         - 如果是求购 lns
           - 如果交易的发起账户不是 lns 的拥有者则报错
             ```
                 memLocation = await getMemLocationName(beExchangeSource, beExchangeAsset);
                 if (!memLocation) {
                     throw new Error
                 }
                 if (memLocation.possessor !== senderId) {
                     throw new Error
                 }
             ```
       - 如果 toExchangeSpecialAsset 是售出
         - 如果是售出 dappid
           - 如果 dapp 不是处于冻结状态则报错
             ```
                 memDapp = await getMemDapp(toExchangeSource, toExchangeAsset);
                 if (!memDapp) {
                     throw new Error
                 }
                 if (memDapp.status === ASSET_STATUS.NORMAL) {
                     throw new Error
                 }
             ```
           - 如果交易的发起账户是 dapp 的拥有者则报错
             ```
                 if (memDapp.markPossessor === senderId) {
                     throw new Error
                 }
             ```
         - 如果是售出 lns
           - 如果 lns 不是处于冻结状态则报错
             ```
                 memLocation  = await getMemLocationName(toExchangeSource, toExchangeAsset);
                 if (!memLocation) {
                     throw new Error
                 }
                 if (memLocation.status === ASSET_STATUS.NORMAL) {
                     throw new Error
                 }
             ```
           - 如果交易的发起账户是 lns 的拥有者则报错
             ```
                 if (memLocation.possessor === senderId) {
                     throw new Error
                 }
             ```

     - LOCATION_NAME -- LNS-00 -- 申请链域名交易

       ```
           memLocation = await getMemLocationName(magic, lnsName, currentBlockHeight);
           names = lnsName.split(".");
       ```

       - 申请域名

         - 已经存在的域名不能再次申请
           ```
               if (memLocation) {
                   throw new Error
               }
           ```
         - 不能越级申请域名，即上级域名不存在则申请失败
           ```
               if (names.length > 1) {
                   lastMemLocation = await getMemLocationName(magic, lastLnsName, currentBlockHeight);
                   if (!lastMemLocation) {
                       throw new Error
                   }
               }
           ```

       - 域名销毁

         - 顶级域名不能被销毁
           ```
               if (names.length === 1) {
                   throw new Error
               }
           ```
         - 不存在的域名不能被销毁
           ```
               if (memLocation) {
                   throw new Error
               }
           ```
         - 处于冻结状态的域名不能销毁
           ```
               if (memLocation.status === ASSET_STATUS.FROZEN) {
                   throw new Error
               }
           ```
         - 只有域名的拥有者才能销毁域名
           ```
               if (memLocation.possessor !== tr.senderId) {
                   throw new Error
               }
           ```
         - 不能越级删除域名，即有子域名的域名不能被销毁
           ```
               lastMemLocation = await getMemLocationName(magic, lastLnsName, currentBlockHeight, {
                   endsWith: lastLnsName
               })
           ```

       - SET_LNS_RECORD_VALUE -- LNS-01 -- 设置链域名的解析值交易

         - 不存在的域名不能设置解析值
           ```
               memLocation = await getMemLocationName(magic, lnsName, currentBlockHeight);
               if (!memLocation) {
                   throw new Error
               }
           ```
         - 处于冻结状态的链域名不能设置解析值
           ```
               if (memLocation.status === ASSET_STATUS.FROZEN) {
                   throw new Error
               }
           ```
         - 只有域名的拥有者或域名的管理员能设置域名的解析值
           ```
               address = tr.senderId;
               if (!(address === memLocation.possessor || address === memLocation.manager)) {
                   throw new Error
               }
           ```

       - SET_LNS_MANAGER -- LNS-02 -- 设置链域名的管理员交易

         - 账户状态为 `禁止资产转出` 或 `禁止资产转入转出` 不能被设置为域名的管理员
           ```
               newManager = await getAccountInfo(lnsManager.manager);
               if (newManager) {
                   checkSenderAccountStatus(newManager);
               }
           ```
         - 不存在的域名不能设置管理员
           ```
               memLocation = await getMemLocationName(magic, lnsName);
               if (!memLocation) {
                   throw new Error
               }
           ```
         - 处于冻结状态的链域名不能设置管理员
           ```
               if (memLocation.status === ASSET_STATUS.FROZEN) {
                   throw new Error
               }
           ```
         - 不能将当前的管理员设置为管理员(似乎没必要)
           ```
               if (lnsManager.manager === memLocation.manager) {
                   throw new Error
               }
           ```
         - 多级域名只有域名的拥有者或上级域名的管理员可以设置域名管理员
           ```
               lastMemLocation = await getMemLocation(magic, lastLnsName);
               if (!lastMemLocation) {
                   throw new Error
               }
               if (!(tr.senderId === memLocation.possessor || tr.senderId === lastMemLocation.manager)) {
                   throw new Error
               }
           ```
         - 顶级域名只有域名的拥有者可以设置域名的管理员
           ```
               if (tr.senderId !== memLocation.possessor) {
                   throw new Error
               }
           ```

  3. 交易处理时的业务逻辑(apply)

     - 公共部分

       - 如果交易基础类型不存在则报错
         ```
             baseType = parseType(transaction.type);
             if (!baseType) {
                 throw new Error
             }
         ```
       - 监听交易手续费，交易涉及的资产，交易的冻结资产，交易的解冻资产，交易的权益计算等事件，统计账户更新信息
         ```
             event.on("fee", args => {
                 calAsset.amount += args.amount;
                 calAsset.paidFee -= args.amount;
             });
             event.on("asset", args => {
                 calAsset.amount += args.amount;
             });
             event.on("frozenAsset", args => {
                 calAsset.amount += args.amount;
             });
             event.on("unfrozenAsset", args => {
                 calAsset.amount += args.amount;
             });
             event.on("voteEquity", args => {
                 calAsset.equity += args.equity;
             });
         ```
       - 更新交易涉及的账户信息并且返回更新结果
         ```
             mergeAccountsInfoAndAssetMulti(calAsset);
             return { applyResult, senderAccountAsset };
         ```
       - 每种交易各自的验证
       - 将 applyResult 返回给打块进程(统计账户变动)

     - 每种交易各自的验证

       - SIGNATURE -- BSE-01 -- 设置支付密码交易

         - 保存账户的支付密码
           ```
               accountInfo = await mergeAccountInfo({
                   address: tr.senderId,
                   height: currentBlockHeight,
                   secondPublicKey: tr.asset.signature.publicKey
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               ipcHeplers.IPCClientSend("caclRound", {
                   cmd: "apply-transaction",
                   data: {
                       address: tr.senderId,
                       height: currentBlockHeight,
                       balance: chainAsset.assetNumber,
                       type: tr.type,
                       dappid: tr.dappid,
                       lstRoundBalance: roundInfo ? roundInfo.assetNumber : BigInt(0),
                       lstRoundTxCount: roundInfo ? roundInfo.txCount : 0,
                   },
               });
           ```

       - USERNAME -- BSE-04 -- 注册用户别名交易

         - 更改账户的用户名
           ```
               username = tr.asset.username.alias;
               accountInfo = await mergeAccountInfo({
                   address: tr.senderId,
                   username,
                   height: currentBlockHeight
               });
           ```
         - 将用户名存入去重表
           ```
               await setMemData(tr.type, {
                   modMem_username: {
                       username,
                   },
                   height: currentBlockHeight
               });
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - DELEGATE -- BSE-02 -- 注册为受托人交易

         - 将账户标志为受托人
           ```
               accountInfo = await mergeAccountInfo({
                   address: tr.senderId,
                   isDelegate: 1,
                   vote: 0,
                   height: currentBlockHeight
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - VOTE -- BSE-03 -- 投票交易

         - 保存投票信息
           ```
               await setMemData(tr.type, {
                   mem_votes: {
                       senderId: tr.senderId,
                       delegate: recipientId,
                       dappid: tr.dappid
                   }
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - ACCEPT_VOTE -- BSE-05 -- 受托人接收投票交易

         - 更新账户的状态为接收投票
           ```
               accountInfo = await mergeAccountInfo({
                   address: tr.senderId,
                   isAcceptVote: 1,
                   height: currentBlockHeight
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - REJECT_VOTE -- BSE-06 -- 受托人拒绝投票交易

         - 更新账户的状态为拒绝接收投票
           ```
               accountInfo = await mergeAccountInfo({
                   address: tr.senderId,
                   isAcceptVote: 0,
                   height: currentBlockHeight
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               ipcHeplers.IPCClientSend("caclRound", {
                   cmd: "apply-transaction",
                   data: {
                       address: tr.senderId,
                       delegate: recipientId,
                       height: currentBlockHeight,
                       balance: chainAsset.assetNumber, // beginBalance 投票交易验证完成后的账户余额
                       type: tr.type,
                       dappid: tr.dappid,
                       voteEquity: tr.asset.vote.equity,
                       lstRoundBalance: roundInfo ? roundInfo.assetNumber : BigInt(0),
                       lstRoundTxCount: roundInfo ? roundInfo.txCount : 0,
                   },
               });
           ```

       - DAPP -- WOD-00 -- 注册侧链应用交易

         - 保存 dapp 信息
           ```
               await setMemData(tr.type, {
                   modMem_dapp: {
                       dappid: dapp.dappid,
                       markPossessor: tr.senderId,
                       sourceChainName: dapp.sourceChainName,
                       sourceChainMagic: dapp.sourceChainMagic,
                       type: dapp.type,
                       status: ASSET_STATUS.NORMAL,
                   },
                   height: currentBlockHeight
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - DAPP_PURCHASING -- 购买侧链应用

         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - MARK -- EXT-00 -- 数据存证交易

         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - REGISTER_CHAIN -- WOD-01 -- 发行注册链交易

         - 保存注册的链的创世块
           ```
               await setMemData(tr.type, {
                   registerChain: {
                       genesisBlock
                   },
                   height: currentBlockHeight
               })
           ```
         - 更改账户状态为 `禁止资产转入转出`
           ```
               await mergeAccountInfo({
                   address: tr.senderId,
                   publicKey: tr.senderPublicKey,
                   height: currentBlockHeight,
                   accountStatus: ACCOUNT_STATUS.FROZEN_IN_AND_OUT
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - ISSUE_ASSET -- AST-00 -- 发行数字资产交易

         - 将数字资产名存入内存，保存数字资产
           ```
               await setMemData(tr.type, {
                   modMem_legalCurrency: [assetType],
                   modMem_assets: {
                       applyAddress: tr.senderId,
                       sourceChainName,
                       sourceChainMagic,
                       assetType,
                       genesisAddress: genesisAddress,
                       expectedIssuedAssets,
                       remainAssets: expectedIssuedAssets,
                       originalFrozenAssets: senderChainAsset.assetNumber
                   },
                   height: currentBlockHeight
               })
           ```
         - 更改账户状态为 `禁止资产转出`
           ```
               await mergeAccountInfo({
                   address: tr.senderId,
                   publicKey: tr.senderPublicKey,
                   height: currentBlockHeight,
                   accountStatus: ACCOUNT_STATUS.FROZEN_OUT,
               })
           ```
         - 初始化数字资产的创世账户
           ```
               await mergeAccountAsset({
                   address: genesisAddress,
                   height: currentBlockHeight
               }, {
                   sourceChainMagic,
                   assetType: assetType,
                   sourceChainName,
                   assetNumber: BigInt(expectedIssuedAssets),
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - TRANSFER_ASSET -- AST-01 -- 数字资产转账交易

         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - DESTORY_ASSET -- AST-02 -- 销毁数字资产交易

         - 计算赎回的链资产并扣除资产发行账户的链资产
           ```
               memAssets = await getMemAsset(magic, assetType);
               owner = await getAccountAsset(memAssets.applyAddress);
               holdingAssets = ownerChainAsset.assetNumber;
               assets = (holdingAssets * amount) / remainAssets;
               await mergeAccountAsset({
                   address: memAssets.applyAddress,
                   height: currentBlockHeight
               }, {
                   sourceChainMagic: magic,
                   assetType,
                   assetNumber: -assets
               })
           ```
         - 发起账户累加链资产
           ```
               mergeAccontAsset({
                   address: tr.senderId,
                   height: currentBlockHeight
               }, {
                   sourceChainMagic: magic,
                   assetType,
                   assetNumber: assets
               })
           ```
         - 更行资产剩余数量
           ```
               await setMemData(tr.type, {
                   modMem_assets: {
                       sourceChainMagic,
                       assetType,
                       address: memAssets.address,
                       remainAssets: `-${amount}`,
                   },
                   height: currentBlockHeight
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - GIFT_ASSET -- AST-03 -- 发红包交易

         - 将红包信息发往资产冻结进程
           ```
               await frozenAsset("assetFrozen", {
                   transactionSignature: tr.signature,
                   address: tr.senderId,
                   remainUnfrozenTimes: totalGrabableTimes,
                   minEffectiveHeight,
                   maxEffectiveHeight,
                   frozenInfo: [
                       {
                           magic: sourceChainMagic,
                           assetType,
                           amount,
                       },
                   ],
               })
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - GRAB_ASSET -- AST-04 -- 抢红包交易

         - 将解冻信息发往资产冻结进程
           ```
               await unfrozenAsset("assetFrozen", {
                   transactionSignature: grabAsset.transactionSignature,
                   magic: giftAsset.sourceChainMagic,
                   assetType: giftAsset.assetType,
                   amount,
               });
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - TRUST_ASSET -- AST-05 -- 资产委托交易

         - 将委托信息发往资产冻结进程
           ```
               await frozenAsset("assetFrozen", {
                   transactionSignature: tr.signature,
                   address: tr.senderId,
                   minEffectiveHeight,
                   maxEffectiveHeight,
                   frozenInfo: [
                       {
                           magic: sourceChainMagic,
                           assetType,
                           amount,
                       },
                   ],
               });
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - SIGN_FOR_ASSET -- AST-06 -- 链外数字资产返回交易

         - 将解冻信息发往资产冻结进程
           ```
               await unfrozenAsset("assetFrozen", {
                   transactionSignature: transactionSignature,
                   magic: trustAsset.sourceChainMagic,
                   assetType: trustAsset.assetType,
                   amount: trustAsset.amount,
               });
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - EMIGRATE_ASSET -- AST-07 -- 资产迁出交易

         - 更改账户状态为 `禁止资产转入转出`
           ```
               await mergeAccountInfo({
                   address: tr.senderId,
                   publicKey: tr.senderPublicKey,
                   height: currentBlockHeight,
                   accountStatus: ACCOUNT_STATUS.FROZEN_IN_AND_OUT,
               });
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - IMMIGRATE_ASSET -- AST-08 -- 资产迁入交易(迁入时是否需要考虑迁出交易是否过期)

         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - TO_EXCHANGE_ASSET -- AST-09 -- 发起数字资产转换交易

         - 将冻结信息发往资产冻结进程
           ```
               await frozenAsset("assetFrozen", {
                   transactionSignature: tr.signature,
                   address: tr.senderId,
                   minEffectiveHeight,
                   maxEffectiveHeight,
                   frozenInfo: [
                       {
                           magic: toExchangeSource,
                           assetType: toExchangeAsset,
                           amount: toExchangeNumber,
                       },
                   ],
               });
           ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - BE_EXCHANGE_ASSET -- AST-10 -- 接收数字资产转换交易

         - 将解冻信息发往资产冻结进程
           await unfrozenAsset("assetFrozen", {
           transactionSignature: beExchangeAsset.transactionSignature,
           magic: exchangeAsset.toExchangeSource,
           assetType: exchangeAsset.toExchangeAsset,
           amount: beExchangeAsset.toExchangeNumber,
           });
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - TO_EXCHANGE_SPECIAL_ASSET -- AST-11 -- 发起特殊资产交换交易

         - 如果是求购特殊资产
           - 将冻结信息发往资产冻结进程
             ```
                 await frozenAsset("assetFrozen", {
                     transactionSignature: tr.signature,
                     address: tr.senderId,
                     minEffectiveHeight,
                     maxEffectiveHeight,
                     frozenInfo: [
                         {
                             magic: toExchangeSource,
                             assetType: toExchangeAsset,
                             amount: exchangeNumber,
                         },
                     ],
                 });
             ```
         - 如果是售出特殊资产
           - 更改特殊资产的状态为冻结
             ```
                 data = {
                     status: ASSET_STATUS.FROZEN,
                     height: currentBlockHeight
                 };
                 if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
                     data["modMem_dapp"] = {
                         dappid: toExchangeAsset,
                         sourceChainMagic: toExchangeSource,
                         maxFrozenBlockHeight: maxEffectiveHeight,
                     };
                 }
                 if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                     data["modMem_locationName"] = {
                         name: toExchangeAsset,
                         sourceChainMagic: toExchangeSource,
                         maxFrozenBlockHeight: maxEffectiveHeight,
                     };
                 }
                 await setMemData(tr.type, data);
             ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```

       - BE_EXCHANGE_SPECIAL_ASSET -- AST-12 -- 接收特殊资产交换交易

         - 如果是求购特殊资产
           - 将解冻信息发往资产冻结进程
             ```
                 await unfrozenAsset("assetFrozen", {
                     transactionSignature: beExchangeSpecialAsset.transactionSignature,
                     magic: toExchangeSource,
                     assetType: toExchangeAsset,
                     amount: exchangeNumber,
                 });
             ```
           - 更改特殊资产的拥有者账户为交易的接收账户(to 交易的发起账户)
             ```
                 data = {
                     status: ASSET_STATUS.NORMAL,
                     height: currentBlockHeight,
                 };
                 if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
                     // 更改 dappid 的拥有者地址
                     data["modMem_dapp"] = {
                         dappid: beExchangeAsset,
                         sourceChainMagic: beExchangeSource,
                         possessor: recipientId,
                         maxFrozenBlockHeight: 1,
                     };
                 } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                     // 更改域名的所有者地址
                     data["modMem_locationName"] = {
                         name: beExchangeAsset,
                         sourceChainMagic: beExchangeSource,
                         possessor: recipientId,
                         maxFrozenBlockHeight: 1,
                     };
                 }
                 await setMemData(tr.type, data);
             ```
         - 如果是售出特殊资产
           - 更改特殊资产的拥有者账户为交易的发起账户
             ```
                 if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
                     // 更改 dappid 的拥有者地址
                     data["modMem_dapp"] = {
                         dappid: toExchangeAsset,
                         sourceChainMagic: toExchangeSource,
                         possessor: tr.senderId,
                         maxFrozenBlockHeight: 1,
                     };
                 } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
                     // 更改域名的所有者地址
                     data["modMem_locationName"] = {
                         name: toExchangeAsset,
                         sourceChainMagic: toExchangeSource,
                         possessor: tr.senderId,
                         maxFrozenBlockHeight: 1,
                     };
                 }
             ```
         - 将交易信息发往权益计算进程
           ```
               同 SIGNATURE
           ```


            - LOCATION_NAME -- LNS-00 -- 申请链域名交易

                - 存储/删除链域名
                    ```
                       if (action === "+") {
                            data = {
                                mem_locationName: {
                                    action: "+",
                                    option: {
                                        name: lnsName,
                                        sourceChainName,
                                        sourceChainMagic,
                                        possessor: tr.senderId,
                                        manager: tr.senderId,
                                        recordValue: "",
                                        type: "",
                                        level,
                                        status: ASSET_STATUS.NORMAL,
                                    },
                                },
                                height: currentBlockHeight,
                            };
                        } else if (action === "-") {
                            data = {
                                mem_locationName: {
                                    action: "-",
                                    option: { name: lnsName, sourceChainMagic },
                                },
                                height: currentBlockHeight,
                            };
                        }
                        await setMemData(trs.type, data);
                    ```
                - 将交易信息发往权益计算进程
                    ```
                        同 SIGNATURE
                    ```

            - SET_LNS_RECORD_VALUE -- LNS-01 -- 设置链域名的解析值交易

                - 保存新的域名解析值
                    ```
                        await setMemData(tr.type, {
                            modMem_locationName: {
                                name: lnsRecordValue.name,
                                sourceChainMagic: lnsRecordValue.sourceChainMagic,
                                type: lnsRecordValue.recordType,
                                recordValue: lnsRecordValue.recordValue,
                            },
                            height: currentBlockHeight,
                        });
                    ```
                - 将交易信息发往权益计算进程
                    ```
                        同 SIGNATURE
                    ```

            - SET_LNS_MANAGER -- LNS-02 -- 设置链域名的管理员交易

                - 保存新的链域名管理员
                    ```
                        await setMemData(tr.type, {
                            modMem_locationName: {
                                name: lnsManager.name,
                                sourceChainMagic: lnsManager.sourceChainMagic,
                                manager: lnsManager.manager,
                            },
                            height: currentBlockHeight,
                        });
                    ```
                - 将交易信息发往权益计算进程
                    ```
                        同 SIGNATURE
                    ```
