import { ConfigHelper } from "@bfchain/core-helper-config";
import { Base58Helper } from "./base58Helper";
import { Injectable, Inject } from "@bfchain/util";

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
  createSecretKeypair(secret: string) {
    return this.keypairHelperInterface.create(
      this.cryptoHelper
        .sha256()
        .update(secret, "utf8")
        .digest(),
    );
  }
  /**根据私钥获取公钥Buffer */
  getPublicKeyFromSecret(secret: string) {
    return this.createSecretKeypair(secret).publicKey;
  }
  /**根据私钥获取公钥String */
  getPublicKeyStringFromSecret(
    secret: string,
    encode: BFChainUtil.HexBase64Latin1Encoding = "hex",
  ) {
    return this.Buffer.from(this.getPublicKeyFromSecret(secret)).toString(encode);
  }
  /**根据公钥生成地址的二进制数据 */
  getBinaryAddressFromPublicKey(publicKey: Uint8Array) {
    const cachedResult = FROZEN_PK_ADD_WM.get(publicKey);
    if (cachedResult) return cachedResult;

    const h1 = this.cryptoHelper
      .sha256()
      .update(publicKey)
      .digest();
    const h2 = this.cryptoHelper
      .ripemd160()
      .update(h1)
      .digest();

    FROZEN_PK_ADD_WM.set(publicKey, h2);
    return h2;
  }
  /**根据公钥生成地址(base58) */
  getAddressFromPublicKey(publicKey: Uint8Array) {
    const address =
      this._prefix + this.base58Helper.encode(this.getBinaryAddressFromPublicKey(publicKey));
    return address;
  }
  /**根据公钥字符串生成地址(base58) */
  getAddressFromPublicKeyString(publicKey: string) {
    return this.getAddressFromPublicKey(this.Buffer.from(publicKey, "hex"));
  }
  /**
   * 根据主密码生成地址
   * @param secret 主密码
   */
  getAddressFromSecret(secret: string) {
    return this.getAddressFromPublicKey(this.getPublicKeyFromSecret(secret));
  }
  /**
   * 判断地址是否符合规范
   * @param address 地址
   */
  isAddress(address: any) {
    if (typeof address !== "string") {
      return false;
    }
    if (!/^[0-9]{1,20}$/g.test(address)) {
      if (address[0] !== this._prefix) {
        return false;
      }
      if (!this.base58Helper.decodeUnsafe(address.slice(1))) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  }
  /**
   * 根据主密码和二次密码生成密钥对
   *
   * @param secret 主密码
   * @param secondSecret 二次密码
   */
  createSecondSecretKeypair(secret: string, secondSecret: string) {
    const md5Second = `${secret}-${this.cryptoHelper
      .md5()
      .update(secondSecret)
      .digest("hex")}`;
    const secondHash = this.cryptoHelper
      .sha256()
      .update(md5Second, "utf8")
      .digest();
    return this.createSecretKeypair(secondHash.toString());
  }
  /**根据私钥获取公钥Buffer */
  getPublicKeyFromSecondSecret(secret: string, secondSecret: string) {
    return this.createSecondSecretKeypair(secret, secondSecret).publicKey;
  }
  /**根据私钥获取公钥String */
  getPublicKeyStringFromSecondSecret(
    secret: string,
    secondSecret: string,
    encode: BFChainUtil.HexBase64Latin1Encoding = "hex",
  ) {
    return this.getPublicKeyFromSecondSecret(secret, secondSecret).toString(encode);
  }
  /**
   * 校验二次密码公钥是否正确
   * @param secret 主密码
   * @param secondSecret 二次密码
   * @param secondPublicKey 二次密码公钥
   */
  checkSecondSecret(secret: string, secondSecret: string, secondPublicKey: string) {
    return this.getPublicKeyStringFromSecondSecret(secret, secondSecret) === secondPublicKey;
  }
}
