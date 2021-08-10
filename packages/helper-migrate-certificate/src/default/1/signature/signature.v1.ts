import type { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import type { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { ENCODING_TYPE, KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import {
  CoreExceptionGenerator,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  SHOULD_NOT_EXIST,
} from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class SignatureV1Converter implements BFChainCore.CrossChain.SignatureConverter {
  readonly version = "1" as const;

  checkEncodeArgs(accountSignature: BFChainCore.AccountSignatureJSON) {
    const { publicKey, signature, secondPublicKey, signSignature } = accountSignature;
    if (!publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
    if (typeof publicKey !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "publicKey",
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }

    if (!signature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "signature",
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
    if (typeof signature !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }

    if (secondPublicKey) {
      if (!secondPublicKey) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "secondPublicKey",
          target: "encodeArgs",
          function: "checkEncodeArgs",
        });
      }
      if (typeof secondPublicKey !== "string") {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "secondPublicKey",
          target: "encodeArgs",
          function: "checkEncodeArgs",
        });
      }
      if (!signSignature) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "signSignature",
          target: "encodeArgs",
          function: "checkEncodeArgs",
        });
      }
      if (typeof signSignature !== "string") {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "signSignature",
          target: "encodeArgs",
          function: "checkEncodeArgs",
        });
      }
    } else {
      if (signSignature) {
        throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
          prop: "signSignature",
          target: "encodeArgs",
          function: "checkEncodeArgs",
        });
      }
    }
  }

  checkDecodeArgs(signature: unknown) {
    if (!signature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (typeof signature !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    const signatures = signature.split("/");
    if (signatures.length !== 2 && signatures.length !== 3) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (signatures[1].split("-").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (signatures[2] && signatures[2].split("-").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
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
    if (skipVerify) {
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
   * 迁移凭证迁出签名
   *
   * @param args
   * @param accountBaseHelper
   * @param asymmetricHelper
   * @returns
   */
  async generateMigrateCertificateSignature(
    args: {
      secret: string;
      secondSecret?: string;
      migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    },
    accountBaseHelper: AccountBaseHelper,
    asymmetricHelper: AsymmetricHelper,
  ) {
    const { secret, secondSecret, migrateCertificate } = args;
    migrateCertificate.signature = this.version;

    const keypair = await accountBaseHelper.createSecretKeypair(secret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    const signatureBuffer = await asymmetricHelper.detachedSign(
      Buffer.from(
        JSON.stringify({
          body: migrateCertificate.body,
          signture: migrateCertificate.signature,
        }),
        ENCODING_TYPE,
      ),
      keypair.secretKey,
    );
    migrateCertificate.signature += `/${publicKey}-${getHexFromArrayBuffer(signatureBuffer)}`;
    if (secondSecret) {
      const secondKeypair = await accountBaseHelper.createSecondSecretKeypairV2(
        secret,
        secondSecret,
      );
      const secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
      const signSignatureBuffer = await asymmetricHelper.detachedSign(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signture: migrateCertificate.signature,
          }),
          ENCODING_TYPE,
        ),
        secondKeypair.secretKey,
      );
      migrateCertificate.signature += `/${secondPublicKey}-${getHexFromArrayBuffer(
        signSignatureBuffer,
      )}`;
    }

    return migrateCertificate;
  }

  /**
   * 迁移凭证迁出授权签名
   *
   * @param args
   * @param accountBaseHelper
   * @param asymmetricHelper
   * @returns
   */
  async generateMigrateCertificateFromAuthSignature(
    args: {
      authSecret: string;
      authSecondSecret?: string;
      migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    },
    accountBaseHelper: AccountBaseHelper,
    asymmetricHelper: AsymmetricHelper,
  ) {
    debugger;
    const { authSecret, authSecondSecret, migrateCertificate } = args;
    migrateCertificate.fromAuthSignature = this.version;

    const keypair = await accountBaseHelper.createSecretKeypair(authSecret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    const signatureBuffer = await asymmetricHelper.detachedSign(
      Buffer.from(
        JSON.stringify({
          body: migrateCertificate.body,
          signture: migrateCertificate.signature,
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
      const secondKeypair = await accountBaseHelper.createSecondSecretKeypairV2(
        authSecret,
        authSecondSecret,
      );
      const secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
      const signSignatureBuffer = await asymmetricHelper.detachedSign(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signture: migrateCertificate.signature,
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
   * 迁移凭证迁入授权签名
   *
   * @param args
   * @param accountBaseHelper
   * @param asymmetricHelper
   * @returns
   */
  async generateMigrateCertificateToAuthSignature(
    args: {
      authSecret: string;
      authSecondSecret?: string;
      migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON;
    },
    accountBaseHelper: AccountBaseHelper,
    asymmetricHelper: AsymmetricHelper,
  ) {
    const { authSecret, authSecondSecret, migrateCertificate } = args;
    migrateCertificate.toAuthSignature = this.version;

    const keypair = await accountBaseHelper.createSecretKeypair(authSecret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    const signatureBuffer = await asymmetricHelper.detachedSign(
      Buffer.from(
        JSON.stringify({
          body: migrateCertificate.body,
          signture: migrateCertificate.signature,
          fromAuthSignature: migrateCertificate.fromAuthSignature,
          toAuthSignature: migrateCertificate.toAuthSignature,
        }),
        ENCODING_TYPE,
      ),
      keypair.secretKey,
    );
    migrateCertificate.toAuthSignature += `/${publicKey}-${getHexFromArrayBuffer(signatureBuffer)}`;
    if (authSecondSecret) {
      const secondKeypair = await accountBaseHelper.createSecondSecretKeypairV2(
        authSecret,
        authSecondSecret,
      );
      const secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
      const signSignatureBuffer = await asymmetricHelper.detachedSign(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signture: migrateCertificate.signature,
            fromAuthSignature: migrateCertificate.fromAuthSignature,
            toAuthSignature: migrateCertificate.toAuthSignature,
          }),
          ENCODING_TYPE,
        ),
        secondKeypair.secretKey,
      );
      migrateCertificate.toAuthSignature += `/${secondPublicKey}-${getHexFromArrayBuffer(
        signSignatureBuffer,
      )}`;
    }
    return migrateCertificate;
  }

  /**
   * 验证迁移凭证签名
   *
   * @param migrateCertificate
   * @param asymmetricHelper
   * @param opts
   */
  async verifyMigrateCertificateSignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    asymmetricHelper: AsymmetricHelper,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "MigrateCertificate";
    const signature = migrateCertificate.signature;
    const accountSignature = this.decode(signature);
    // 验证 signature 与 publicKey
    if (
      !(await asymmetricHelper.detachedVeriy(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signture: this.splitSignature(signature),
          }),
          ENCODING_TYPE,
        ),
        parseHexToArrayBuffer(accountSignature.signature),
        parseHexToArrayBuffer(accountSignature.publicKey),
      ))
    ) {
      throw new ArgumentIllegalException(`Invalid ${taskLabel} signature`);
    }
    // 验证 signSignature 与 secondPublicKey
    if (accountSignature.secondPublicKey && accountSignature.signSignature) {
      if (
        !(await asymmetricHelper.detachedVeriy(
          Buffer.from(
            JSON.stringify({
              body: migrateCertificate.body,
              signture: this.splitSignSignature(signature),
            }),
            ENCODING_TYPE,
          ),
          parseHexToArrayBuffer(accountSignature.signSignature),
          parseHexToArrayBuffer(accountSignature.secondPublicKey),
        ))
      ) {
        throw new ArgumentIllegalException(`Invalid ${taskLabel} signSignature`);
      }
    }
  }

  /**
   * 验证迁移凭证迁出授权签名
   *
   * @param migrateCertificate
   * @param asymmetricHelper
   * @param opts
   */
  async verifyMigrateCertificateFromAuthSignature(
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
            signture: migrateCertificate.signature,
            fromAuthSignature: this.splitSignature(signature),
          }),
          ENCODING_TYPE,
        ),
        parseHexToArrayBuffer(accountSignature.signature),
        parseHexToArrayBuffer(accountSignature.publicKey),
      ))
    ) {
      throw new ArgumentIllegalException(`Invalid ${taskLabel} fromAuthSignature`);
    }
    // 验证 signSignature 与 secondPublicKey
    if (accountSignature.secondPublicKey && accountSignature.signSignature) {
      if (
        !(await asymmetricHelper.detachedVeriy(
          Buffer.from(
            JSON.stringify({
              body: migrateCertificate.body,
              signture: migrateCertificate.signature,
              fromAuthSignature: this.splitSignSignature(signature),
            }),
            ENCODING_TYPE,
          ),
          parseHexToArrayBuffer(accountSignature.signSignature),
          parseHexToArrayBuffer(accountSignature.secondPublicKey),
        ))
      ) {
        throw new ArgumentIllegalException(`Invalid ${taskLabel} fromAuthSignSignature`);
      }
    }
  }

  /**
   * 验证迁移凭证迁入授权签名
   *
   * @param migrateCertificate
   * @param asymmetricHelper
   * @param opts
   */
  async verifyMigrateCertificateToAuthSignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    asymmetricHelper: AsymmetricHelper,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "MigrateCertificate";
    const signature = migrateCertificate.toAuthSignature;
    const accountSignature = this.decode(signature);
    // 验证 signature 与 publicKey
    if (
      !(await asymmetricHelper.detachedVeriy(
        Buffer.from(
          JSON.stringify({
            body: migrateCertificate.body,
            signture: migrateCertificate.signature,
            fromAuthSignature: migrateCertificate.fromAuthSignature,
            toAuthSignature: this.splitSignature(signature),
          }),
          ENCODING_TYPE,
        ),
        parseHexToArrayBuffer(accountSignature.signature),
        parseHexToArrayBuffer(accountSignature.publicKey),
      ))
    ) {
      throw new ArgumentIllegalException(`Invalid ${taskLabel} toAuthSignature`);
    }
    // 验证 signSignature 与 secondPublicKey
    if (accountSignature.secondPublicKey && accountSignature.signSignature) {
      if (
        !(await asymmetricHelper.detachedVeriy(
          Buffer.from(
            JSON.stringify({
              body: migrateCertificate.body,
              signture: migrateCertificate.signature,
              fromAuthSignature: migrateCertificate.fromAuthSignature,
              toAuthSignature: this.splitSignSignature(signature),
            }),
            ENCODING_TYPE,
          ),
          parseHexToArrayBuffer(accountSignature.signSignature),
          parseHexToArrayBuffer(accountSignature.secondPublicKey),
        ))
      ) {
        throw new ArgumentIllegalException(`Invalid ${taskLabel} toAuthSignSignature`);
      }
    }
  }
}
