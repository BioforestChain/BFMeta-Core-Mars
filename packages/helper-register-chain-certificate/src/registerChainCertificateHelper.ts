import { Injectable, getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { BaseHelper } from "@bfchain/core-helper-type";
import { ChainTimeHelper } from "@bfchain/core-helper-chain-time";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { Config } from "./config";
import { ENCODING_TYPE } from "./constants";

const { ArgumentIllegalException } = CoreExceptionGenerator(
  "HELPER",
  "RegisterChainCertificateHelper",
);

@Injectable()
export class RegisterChainCertificateHelper {
  constructor(
    public baseHelper: BaseHelper,
    public chainTimeHelper: ChainTimeHelper,
    public asymmetricHelper: AsymmetricHelper,
    public accountBaseHelper: AccountBaseHelper,
    public config: Config,
  ) {}

  private __checkVersion(version: any) {
    if (!version) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "version",
        target: "registerChainCertificate",
      });
    }
    if (typeof version !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "version",
        target: "registerChainCertificate",
      });
    }
  }

  private __checkTimestamp(timestamp: any) {
    if (!timestamp) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "timestamp",
        target: "registerChainCertificate",
      });
    }
    if (!this.baseHelper.isPositiveInteger(timestamp)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "timestamp",
        target: "registerChainCertificate",
      });
    }
  }

  private __checkPublicKey(publicKey: string) {
    if (!publicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "publicKey",
        target: "registerChainCertificate",
      });
    }
    if (!this.baseHelper.isValidPublicKey(publicKey)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "publicKey",
        target: "registerChainCertificate",
      });
    }
  }

  private __checkSignature(signature: string) {
    if (!signature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "signature",
        target: "registerChainCertificate",
      });
    }
    if (!this.baseHelper.isValidSignature(signature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "signature",
        target: "registerChainCertificate",
      });
    }
  }

  /**
   * 生成跨链凭证信息
   *
   * @param args
   * @returns
   */
  async generateRegisterChainCertificate(
    args: BFChainCore.RegisterChain.GenerateRegisterChainCertificateArgs,
  ) {
    const { generatorSecret, generatorSecondSecret, genesisBlockInfo, version, timestamp } = args;
    const accountBaseHelper = this.accountBaseHelper;
    const keypair = await accountBaseHelper.createSecretKeypair(generatorSecret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    let secondKeypair: BFChainCore.Keypair | undefined;
    const registerChainCertificateJson: BFChainCore.RegisterChain.RegisterChainCertificateWithoutSignatureJSON =
      {
        body: {
          /**凭证版本 */
          version: version || this.config.version,
          /**迁出凭证生成时间 Date.now().getTimes() */
          timestamp: timestamp === undefined ? this.chainTimeHelper.now(true) : timestamp,
          /**创世块信息 */
          genesisBlockInfo: {
            genesisAccount: {
              address: await accountBaseHelper.getAddressFromPublicKey(keypair.publicKey),
              publicKey,
            },
            ...genesisBlockInfo,
          },
        },
        publicKey,
      };
    if (generatorSecondSecret) {
      secondKeypair = await accountBaseHelper.createSecretKeypair(generatorSecret);
      registerChainCertificateJson.secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
    }
    const signatureBuffer = await this.asymmetricHelper.detachedSign(
      Buffer.from(JSON.stringify(registerChainCertificateJson), ENCODING_TYPE),
      keypair.secretKey,
    );
    const registerChainCertificate: BFChainCore.RegisterChain.RegisterChainCertificateJSON = {
      ...registerChainCertificateJson,
      signature: getHexFromArrayBuffer(signatureBuffer),
    };
    if (secondKeypair) {
      const signSignatureBuffer = await this.asymmetricHelper.detachedSign(
        Buffer.from(JSON.stringify(registerChainCertificateJson), ENCODING_TYPE),
        secondKeypair.secretKey,
      );
      registerChainCertificate.signSignature = getHexFromArrayBuffer(signSignatureBuffer);
    }
    return registerChainCertificate;
  }

  /**
   * 验证跨链凭证签名
   *
   * @param registerChainCertificate
   * @param opts
   */
  async verifyRegisterChainCertificateSignature(
    registerChainCertificate: BFChainCore.RegisterChain.RegisterChainCertificateJSON,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "RegisterChainCertificate";
    const { body, publicKey, signature, secondPublicKey, signSignature } = registerChainCertificate;
    // 验证 signature 与 publicKey
    if (
      !(await this.asymmetricHelper.detachedVeriy(
        Buffer.from(
          JSON.stringify({
            body,
            publicKey: publicKey,
          }),
          ENCODING_TYPE,
        ),
        parseHexToArrayBuffer(signature),
        parseHexToArrayBuffer(publicKey),
      ))
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_SIGNATURE, { taskLabel });
    }
    // 验证 signSignature 与 secondPublicKey
    if (secondPublicKey && signSignature) {
      if (
        !(await this.asymmetricHelper.detachedVeriy(
          Buffer.from(
            JSON.stringify({
              body: body,
              publicKey,
              secondPublicKey,
              signature,
            }),
            ENCODING_TYPE,
          ),
          parseHexToArrayBuffer(signSignature),
          parseHexToArrayBuffer(secondPublicKey),
        ))
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_SIGNSIGNATURE, { taskLabel });
      }
    }
  }

  /**
   * 验证跨链凭证
   *
   * @param registerChainCertificate
   * @param options
   * @returns
   */
  async verifyRegisterChainCertificate(
    registerChainCertificate: BFChainCore.RegisterChain.RegisterChainCertificateJSON,
  ) {
    const { body, publicKey, signature, secondPublicKey, signSignature } = registerChainCertificate;
    if (publicKey !== body.genesisBlockInfo.genesisAccount.publicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `publicKey ${publicKey}`,
        be_compare_prop: `generatorPublicKey ${body.genesisBlockInfo.genesisAccount.publicKey}`,
        to_target: "registerChainCertificate",
        be_target: "registerChainCertificate.body.genesisBlockInfo",
      });
    }
    this.__checkVersion(body.version);
    this.__checkTimestamp(body.timestamp);
    this.__checkPublicKey(publicKey);
    this.__checkSignature(signature);
    if (secondPublicKey && signSignature) {
      this.__checkPublicKey(secondPublicKey);
      this.__checkSignature(signSignature);
    } else if (secondPublicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: `secondPublicKey ${secondPublicKey}`,
        target: "registerChainCertificate",
      });
    } else if (signSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: `signSignature ${signSignature}`,
        target: "registerChainCertificate",
      });
    }
    await this.verifyRegisterChainCertificateSignature(registerChainCertificate);
    return true;
  }

  encode(registerChainCertificate: BFChainCore.RegisterChain.RegisterChainCertificateJSON) {
    return JSON.stringify(registerChainCertificate);
  }

  decode(registerChainCertificate: string): BFChainCore.RegisterChain.RegisterChainCertificateJSON {
    return JSON.parse(registerChainCertificate);
  }
}
