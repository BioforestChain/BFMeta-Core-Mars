/// <reference types="node" />
import { ConfigHelper } from "@bfchain/core-helper-config";
import { Base58Helper } from "./base58Helper";
/**账户辅助模块
 * 公私钥对的生成
 * 地址的生成
 */
export declare class AccountBaseHelper {
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    KeypairHelperInterface: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    base58Helper: Base58Helper;
    config: ConfigHelper;
    constructor(cryptoHelper: BFChainCore.CryptoHelperInterface, KeypairHelperInterface: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, base58Helper: Base58Helper, config: ConfigHelper);
    private get _prefix();
    /**通用的密钥检查规则 */
    checkSecret(secret: string): boolean;
    /**
     * 根据主密码生成密钥对
     *
     * @param secret 主密码
     */
    createSecretKeypair(secret: string): BFChainCore.Keypair;
    /**根据私钥获取公钥Buffer */
    getPublicKeyFromSecret(secret: string): Buffer;
    /**根据私钥获取公钥String */
    getPublicKeyStringFromSecret(secret: string, encode?: BFChainUtil.HexBase64Latin1Encoding): string;
    /**根据公钥生成地址的二进制数据 */
    getBinaryAddressFromPublicKey(publicKey: Uint8Array): BFChainUtil.Buffer;
    /**根据公钥生成地址(base58) */
    getAddressFromPublicKey(publicKey: Uint8Array): string;
    /**根据公钥字符串生成地址(base58) */
    getAddressFromPublicKeyString(publicKey: string): string;
    /**
     * 根据主密码生成地址
     * @param secret 主密码
     */
    getAddressFromSecret(secret: string): string;
    /**
     * 判断地址是否符合规范
     * @param address 地址
     */
    isAddress(address: any): boolean;
    /**
     * 根据主密码和二次密码生成密钥对
     *
     * @param secret 主密码
     * @param secondSecret 二次密码
     */
    createSecondSecretKeypair(secret: string, secondSecret: string): BFChainCore.Keypair;
    /**根据私钥获取公钥Buffer */
    getPublicKeyFromSecondSecret(secret: string, secondSecret: string): Buffer;
    /**根据私钥获取公钥String */
    getPublicKeyStringFromSecondSecret(secret: string, secondSecret: string, encode?: BFChainUtil.HexBase64Latin1Encoding): string;
    /**
     * 校验二次密码公钥是否正确
     * @param secret 主密码
     * @param secondSecret 二次密码
     * @param secondPublicKey 二次密码公钥
     */
    checkSecondSecret(secret: string, secondSecret: string, secondPublicKey: string): boolean;
}
//# sourceMappingURL=accountHelper.d.ts.map