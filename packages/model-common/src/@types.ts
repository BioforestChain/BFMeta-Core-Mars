declare namespace BFChainCore {
  interface FractionJSON<T extends number | bigint | string = number> {
    /**分子 */
    numerator: T;
    /**分母 */
    denominator: T;
  }
  interface RangeJSON {
    start: number;
    end: number;
  }
  interface RateJSON<T extends number | bigint | string = number> {
    /**前部权重 */
    prevWeight: T;
    /**后部权重 */
    nextWeight: T;
  }

  interface AccountSignatureJSON {
    /**账户密钥生成的公钥 */
    publicKey: string;
    /**账户公钥生成的签名 */
    signature: string;
    /**账户安全密钥生成的公钥 */
    secondPublicKey?: string;
    /**账户安全公钥生成的签名 */
    signSignature?: string;
  }
}
