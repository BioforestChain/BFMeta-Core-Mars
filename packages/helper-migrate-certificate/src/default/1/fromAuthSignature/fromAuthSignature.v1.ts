import type { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import type { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { ENCODING_TYPE, KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { BBuffer as Buffer } from "@bfchain/util-buffer";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class FromAuthSignatureV1Converter implements BFChainCore.CrossChain.AuthSignatureConverter {
  readonly version = "1" as const;

  checkEncodeArgs(accountSignature: BFChainCore.AccountSignatureJSON) {
    const { publicKey, signature, secondPublicKey, signSignature } = accountSignature;
    if (!publicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `publicKey ${publicKey}`,
        target: "encodeArgs",
      });
    }
    if (typeof publicKey !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `publicKey ${publicKey}`,
        target: "encodeArgs",
      });
    }

    if (!signature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `signature ${signature}`,
        target: "encodeArgs",
      });
    }
    if (typeof signature !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `signature ${signature}`,
        target: "encodeArgs",
      });
    }

    if (secondPublicKey) {
      if (!secondPublicKey) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `secondPublicKey ${secondPublicKey}`,
          target: "encodeArgs",
        });
      }
      if (typeof secondPublicKey !== "string") {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `secondPublicKey ${secondPublicKey}`,
          target: "encodeArgs",
        });
      }
      if (!signSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: `signSignature ${signSignature}`,
          target: "encodeArgs",
        });
      }
      if (typeof signSignature !== "string") {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `signSignature ${signSignature}`,
          target: "encodeArgs",
        });
      }
    } else {
      if (signSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `signSignature ${signSignature}`,
          target: "encodeArgs",
        });
      }
    }
  }

  checkDecodeArgs(signature: unknown) {
    if (!signature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `fromAuthSignature ${signature}`,
        target: "decodeArgs",
      });
    }

    if (typeof signature !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromAuthSignature ${signature}`,
        target: "decodeArgs",
      });
    }

    const fromAuthSignatures = signature.split("/");
    if (fromAuthSignatures.length !== 2 && fromAuthSignatures.length !== 3) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromAuthSignature ${signature}`,
        target: "decodeArgs",
      });
    }

    if (fromAuthSignatures[1].split("-").length !== 2) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromAuthSignature ${signature}`,
        target: "decodeArgs",
      });
    }

    if (fromAuthSignatures[2] && fromAuthSignatures[2].split("-").length !== 2) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromAuthSignature ${signature}`,
        target: "decodeArgs",
      });
    }
  }

  encode(accountSignature: BFChainCore.AccountSignatureJSON, skipVerify = false) {
    if (!skipVerify) {
      this.checkEncodeArgs(accountSignature);
    }
    let signature = `${this.version}${KEY_SPLITTER}${accountSignature.publicKey}-${accountSignature.signature}`;
    if (accountSignature.secondPublicKey && accountSignature.signSignature) {
      signature += `${KEY_SPLITTER}${accountSignature.secondPublicKey}-${accountSignature.signSignature}`;
    }
    return signature;
  }

  decode(signature: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(signature);
    }
    const items = signature.split(KEY_SPLITTER);
    const signatureKeyValue = items[1].split("-");
    const accountSignature: BFChainCore.AccountSignatureJSON = {
      publicKey: signatureKeyValue[0],
      signature: signatureKeyValue[1],
    };
    if (items[2]) {
      const signSignatureKeyValue = items[2].split("-");
      accountSignature.secondPublicKey = signSignatureKeyValue[0];
      accountSignature.signSignature = signSignatureKeyValue[1];
    }
    return accountSignature;
  }

  splitSignature(signature: string) {
    return signature.split("/")[0];
  }

  splitSignSignature(signature: string) {
    return signature.split("/").slice(0, 2).join(KEY_SPLITTER);
  }

  /**
   * 迁移凭证迁出授权签名
   *
   * @param args
   * @param accountBaseHelper
   * @param asymmetricHelper
   * @returns
   */
  async generateSignature(
    args: {
      authSecret: string;
      authSecondSecret?: string;
      migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    },
    accountBaseHelper: AccountBaseHelper,
    asymmetricHelper: AsymmetricHelper,
  ) {
    const { authSecret, authSecondSecret, migrateCertificate } = args;
    migrateCertificate.fromAuthSignature = this.version;

    const keypair = await accountBaseHelper.createSecretKeypair(authSecret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    const signatureBuffer = await asymmetricHelper.detachedSign(
      Buffer.from(
        JSON.stringify({
          body: migrateCertificate.body,
          signature: migrateCertificate.signature,
          fromAuthSignature: migrateCertificate.fromAuthSignature,
        }),
        ENCODING_TYPE,
      ),
      keypair.secretKey,
    );
    migrateCertificate.fromAuthSignature += `/${publicKey}-${getHexFromArrayBuffer(
      signatureBuffer,
    )}`;
    if (authSecondSecret) {
      const secondKeypair = await accountBaseHelper.createSecondSecretKeypair(
        authSecret,
        authSecondSecret,
      );
      const secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
      const signSignatureBuffer = await asymmetricHelper.detachedSign(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signature: migrateCertificate.signature,
            fromAuthSignature: migrateCertificate.fromAuthSignature,
          }),
          ENCODING_TYPE,
        ),
        secondKeypair.secretKey,
      );
      migrateCertificate.fromAuthSignature += `/${secondPublicKey}-${getHexFromArrayBuffer(
        signSignatureBuffer,
      )}`;
    }
    return migrateCertificate;
  }

  /**
   * 验证迁移凭证迁出授权签名
   *
   * @param migrateCertificate
   * @param asymmetricHelper
   * @param opts
   */
  async verifySignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    asymmetricHelper: AsymmetricHelper,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "MigrateCertificate";
    const signature = migrateCertificate.fromAuthSignature;
    const accountSignature = this.decode(signature);
    // 验证 signature 与 publicKey
    if (
      !(await asymmetricHelper.detachedVeriy(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signature: migrateCertificate.signature,
            fromAuthSignature: this.splitSignature(signature),
          }),
          ENCODING_TYPE,
        ),
        parseHexToArrayBuffer(accountSignature.signature),
        parseHexToArrayBuffer(accountSignature.publicKey),
      ))
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_FROMAUTHSIGNATURE, { taskLabel });
    }
    // 验证 signSignature 与 secondPublicKey
    if (accountSignature.secondPublicKey && accountSignature.signSignature) {
      if (
        !(await asymmetricHelper.detachedVeriy(
          Buffer.from(
            JSON.stringify({
              body: migrateCertificate.body,
              signature: migrateCertificate.signature,
              fromAuthSignature: this.splitSignSignature(signature),
            }),
            ENCODING_TYPE,
          ),
          parseHexToArrayBuffer(accountSignature.signSignature),
          parseHexToArrayBuffer(accountSignature.secondPublicKey),
        ))
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_FROMAUTHSIGNSIGNATURE, { taskLabel });
      }
    }
  }
}
