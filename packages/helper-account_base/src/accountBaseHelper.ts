import { ConfigHelper } from "@bfchain/core-helper-config";
import { Base58Helper } from "./base58Helper";
import { utf8Slice } from "./oldBuffer";
import { Injectable, Inject, encodeUTF8ToBinary, encodeHexToBinary } from "@bfchain/util";

const FROZEN_PK_ADD_WM = new WeakMap<Uint8Array, BFChainUtil.Buffer>();
/**账户辅助模块
 * 公私钥对的生成
 * 地址的生成
 */
@Injectable()
export class AccountBaseHelper {
  constructor(
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("keypairHelper") public keypairHelperInterface: BFChainCore.KeypairHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
    public base58Helper: Base58Helper,
    public config: ConfigHelper,
  ) {}
  private get _prefix() {
    return this.config.initials;
  }

  /**通用的密钥检查规则 */
  checkSecret(secret: string) {
    if (/^\s|\s$/.test(secret)) {
      throw new SyntaxError("Main Secret cannot contain spaces at the beginning or end");
    }
    if (/[\cA-\cZ]/.test(secret)) {
      throw new SyntaxError("Main Secret cannot contain Special Characters");
    }
    return true;
  }
  /**
   * 根据主密码生成密钥对
   *
   * @param secret 主密码
   */
  async createSecretKeypair(secret: string) {
    return await this.keypairHelperInterface.create(
      await this.cryptoHelper.sha256(encodeUTF8ToBinary(secret)),
    );
  }
  /**根据私钥获取公钥Buffer */
  async getPublicKeyFromSecret(secret: string) {
    return (await this.createSecretKeypair(secret)).publicKey;
  }
  /**根据私钥获取公钥String */
  async getPublicKeyStringFromSecret(
    secret: string,
    encode: BFChainUtil.HexBase64Latin1Encoding = "hex",
  ) {
    return (await this.getPublicKeyFromSecret(secret)).toString(encode);
  }
  /**根据公钥生成地址的二进制数据 */
  async getBinaryAddressFromPublicKey(publicKey: Uint8Array) {
    const cachedResult = FROZEN_PK_ADD_WM.get(publicKey);
    if (cachedResult) return cachedResult;

    const h1 = await this.cryptoHelper.sha256(publicKey);
    const h2 = await this.cryptoHelper.ripemd160(h1);

    FROZEN_PK_ADD_WM.set(publicKey, h2);
    return h2;
  }
  /**根据公钥生成地址(base58) */
  async getAddressFromPublicKey(publicKey: Uint8Array, prefix = this._prefix) {
    const address =
      prefix +
      (await this.base58Helper.encode(await this.getBinaryAddressFromPublicKey(publicKey)));
    return address;
  }
  /**根据公钥字符串生成地址(base58) */
  getAddressFromPublicKeyString(publicKey: string, prefix?: BFChainCore.BNID_TYPE) {
    return this.getAddressFromPublicKey(encodeHexToBinary(publicKey), prefix);
  }
  /**
   * 根据主密码生成地址
   * @param secret 主密码
   */
  async getAddressFromSecret(secret: string, prefix?: BFChainCore.BNID_TYPE) {
    return this.getAddressFromPublicKey(await this.getPublicKeyFromSecret(secret), prefix);
  }
  /**
   * 判断地址是否符合规范
   * @param address 地址
   */
  async isAddress(address: any) {
    if (typeof address !== "string") {
      return false;
    }
    if (!/^[0-9]{1,20}$/g.test(address)) {
      if (address[0] !== this._prefix) {
        return false;
      }
      if (!(await this.base58Helper.decodeUnsafe(address.slice(1)))) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  }
  /**
   * 根据主密码和二次密码生成密钥对
   * 这里虽然用了md5,当因为sha256后,所以还算安全,不过也许可以换一种更加友好的方式
   *
   * @param secret 主密码
   * @param secondSecret 二次密码
   */
  async createSecondSecretKeypair(secret: string, secondSecret: string) {
    const md5Second = `${secret}-${(
      await this.cryptoHelper.md5(encodeUTF8ToBinary(secondSecret))
    ).toString("hex")}`;
    const secondHash = await this.cryptoHelper.sha256(encodeUTF8ToBinary(md5Second));
    return this.createSecretKeypair(utf8Slice(secondHash, 0, secondHash.length));
  }
  /**根据私钥获取公钥Buffer */
  async getPublicKeyFromSecondSecret(secret: string, secondSecret: string) {
    return (await this.createSecondSecretKeypair(secret, secondSecret)).publicKey;
  }
  /**根据私钥获取公钥String */
  async getPublicKeyStringFromSecondSecret(
    secret: string,
    secondSecret: string,
    encode: BFChainUtil.HexBase64Latin1Encoding = "hex",
  ) {
    return (await this.getPublicKeyFromSecondSecret(secret, secondSecret)).toString(encode);
  }
  /**
   * 校验二次密码公钥是否正确
   * @param secret 主密码
   * @param secondSecret 二次密码
   * @param secondPublicKey 二次密码公钥
   */
  async checkSecondSecret(secret: string, secondSecret: string, secondPublicKey: string) {
    return (
      (await this.getPublicKeyStringFromSecondSecret(secret, secondSecret)) === secondPublicKey
    );
  }
  //#region 新版

  async createSecondSecretKeypairV2(secret: string, secondSecret: string) {
    const fullSecondSecret = `v2:${secret}-${secondSecret}`;
    return this.createSecretKeypair(fullSecondSecret);
  }
  /**根据私钥获取公钥Buffer */
  async getPublicKeyFromSecondSecretV2(secret: string, secondSecret: string) {
    return (await this.createSecondSecretKeypairV2(secret, secondSecret)).publicKey;
  }

  /**根据私钥获取公钥String */
  async getPublicKeyStringFromSecondSecretV2(
    secret: string,
    secondSecret: string,
    encode: BFChainUtil.HexBase64Latin1Encoding = "hex",
  ) {
    return (await this.getPublicKeyFromSecondSecretV2(secret, secondSecret)).toString(encode);
  }
  /**
   * 校验二次密码公钥是否正确
   * @param secret 主密码
   * @param secondSecret 二次密码
   * @param secondPublicKey 二次密码公钥
   */
  async checkSecondSecretV2(secret: string, secondSecret: string, secondPublicKey: string) {
    return (
      (await this.getPublicKeyStringFromSecondSecretV2(secret, secondSecret)) === secondPublicKey
    );
  }
  //#endregion
}
