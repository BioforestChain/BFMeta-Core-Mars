import { Injectable } from "@bfchain/util-dep-inject";
import {
  CoreExceptionGenerator,
  NOT_MATCH,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  PROP_SHOULD_GT_FIELD,
  SHOULD_BE,
} from "@bfchain/core-util-exception";
import { BaseHelper } from "@bfchain/core-helper-type";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { ChainTimeHelper } from "@bfchain/core-helper-chain-time";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { CrossChainConverterFactory } from "./CrossChainConverterFactory";
import { KEY_SPLITTER } from "./constants";

const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class MigrateCertificateHelper {
  constructor(
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainTimeHelper: ChainTimeHelper,
    public asymmetricHelper: AsymmetricHelper,
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
  ) {}

  getMigrateCertificateConverter(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
  ) {
    return CrossChainConverterFactory(migrateCertificate);
  }

  checkVersion(version: any) {
    if (!version) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "version",
        target: "migrateCertificate",
        function: "checkVersion",
      });
    }
    if (typeof version !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "version",
        target: "migrateCertificate",
        function: "checkVersion",
      });
    }
  }

  checkTimestamp(timestamp: any) {
    if (!timestamp) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "timestamp",
        target: "migrateCertificate",
        function: "checkTimestamp",
      });
    }
    if (!this.baseHelper.isPositiveInteger(timestamp)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "timestamp",
        target: "migrateCertificate",
        function: "checkTimestamp",
      });
    }
  }

  checkAssets(assets: string) {
    if (!assets) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assets",
        target: "migrateCertificate",
        function: "checkAssets",
      });
    }
    if (!this.baseHelper.isValidAssetNumber(assets)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assets",
        target: "migrateCertificate",
        function: "checkAssets",
      });
    }
    if (assets === "0") {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: "assets",
        fueld: "0",
        target: "migrateCertificate",
        function: "checkAssets",
      });
    }
  }

  /**
   * 格式化凭证信息
   *
   * @param json
   * @returns
   */
  formatMigrateCertificate(json: BFChainCore.CrossChain.MigrateCertificateJSON) {
    const { body, signature, fromAuthSignature, toAuthSignature } = json;
    const migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON = {
      body: {
        version: body.version,
        timestamp: body.timestamp,
        fromChainId: body.fromChainId,
        toChainId: body.toChainId,
        fromId: body.fromId,
        toId: body.toId,
        assetTypeId: body.assetTypeId,
        assets: body.assets,
      },
      signature: signature || "",
      fromAuthSignature: fromAuthSignature || "",
      toAuthSignature: toAuthSignature || "",
    };
    return migrateCertificate;
  }

  combineMigrateCertificateBody(
    args: BFChainCore.CrossChain.CombineMigrateCertificateBodyArgs,
    config = this.configHelper,
  ) {
    const converter = CrossChainConverterFactory();
    const { senderId, recipientId, toChainInfo, assets } = args;
    const migrateCertificate: BFChainCore.CrossChain.MigrateCertificateWithoutFromAuthSignatureJSON =
      {
        body: {
          /**凭证版本 */
          version: config.version.toString(),
          /**迁出凭证生成时间 Date.now().getTimes() */
          timestamp: this.chainTimeHelper.now(true),
          /**迁出链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
          fromChainId: converter.fromChainId.encode(
            {
              magic: config.magic,
              chainName: config.chainName,
              genesisBlockSignature: config.signature,
            },
            true,
          ),
          /**迁入链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
          toChainId: converter.toChainId.encode(toChainInfo),
          /**发起账户的唯一标识 version/address */
          fromId: converter.fromId.encode(senderId, true),
          /**接收账户的唯一标识 version/address */
          toId: converter.toId.encode(recipientId, true),
          /**迁出的权益：version/assetType */
          assetTypeId: converter.assetTypeId.encode(config.assetType, true),
          /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
          assets,
        },
        /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
        signature: converter.signature.version,
      };
    return migrateCertificate;
  }

  combineMigrateCertificateSignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    opts: {
      signature?: BFChainCore.AccountSignatureJSON;
      fromAuthSignature?: BFChainCore.AccountSignatureJSON;
      toAuthSignature?: BFChainCore.AccountSignatureJSON;
    },
  ) {
    const converter = CrossChainConverterFactory(migrateCertificate);
    const { signature, fromAuthSignature, toAuthSignature } = opts;
    if (signature) {
      migrateCertificate.signature = converter.signature.encode(signature);
    }
    if (fromAuthSignature) {
      migrateCertificate.fromAuthSignature = converter.signature.encode(fromAuthSignature);
    }
    if (toAuthSignature) {
      migrateCertificate.toAuthSignature = converter.signature.encode(toAuthSignature);
    }
    return migrateCertificate;
  }

  /**
   * 生成迁移凭证信息
   *
   * @param args
   * @param config
   * @returns
   */
  async generateMigrateCertificate(
    args: BFChainCore.CrossChain.GenerateMigrateCertificateArgs,
    config = this.configHelper,
  ) {
    const { senderSecret, senderSecondSecret, recipientId, toChainInfo, assets } = args;
    const converter = CrossChainConverterFactory();

    this.checkAssets(assets);

    const accountBaseHelper = this.accountBaseHelper;
    const keypair = await accountBaseHelper.createSecretKeypair(senderSecret);
    const address = await accountBaseHelper.getAddressFromPublicKey(keypair.publicKey);
    // 时间、地点、人物、起因、经过、结果
    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON = {
      body: {
        /**凭证版本 */
        version: config.version.toString(),
        /**迁出凭证生成时间 Date.now().getTimes() */
        timestamp: this.chainTimeHelper.now(true),
        /**迁出链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
        fromChainId: converter.fromChainId.encode(
          {
            magic: config.magic,
            chainName: config.chainName,
            genesisBlockSignature: config.signature,
          },
          true,
        ),
        /**迁入链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
        toChainId: converter.toChainId.encode(toChainInfo),
        /**发起账户的唯一标识 version/address */
        fromId: converter.fromId.encode(address, true),
        /**接收账户的唯一标识 version/address */
        toId: converter.toId.encode(recipientId, true),
        /**迁出的权益：version/assetType */
        assetTypeId: converter.assetTypeId.encode(config.assetType, true),
        /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
        assets,
      },
      /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
      signature: "",
      /**迁出链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
      fromAuthSignature: "",
      /**迁入链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
      toAuthSignature: "",
    };

    if (senderSecret) {
      migrateCertificate = await converter.signature.generateMigrateCertificateSignature(
        { secret: senderSecret, secondSecret: senderSecondSecret, migrateCertificate },
        accountBaseHelper,
        this.asymmetricHelper,
      );
    }

    return migrateCertificate;
  }

  parseMigrateCertificateToJson(migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON) {
    const { body, signature, fromAuthSignature, toAuthSignature } = migrateCertificate;

    const converter = CrossChainConverterFactory(migrateCertificate);
    const migrateCertificateJson: BFChainCore.CrossChain.MigrateCertificate = {
      body: {
        version: body.version,
        senderId: converter.fromId.decode(body.fromId),
        recipientId: converter.toId.decode(body.toId),
        timestamp: body.timestamp,
        fromChain: converter.fromChainId.decode(body.fromChainId),
        toChain: converter.toChainId.decode(body.toChainId),
        assetType: converter.assetTypeId.decode(body.assetTypeId),
        assets: body.assets,
      },
      signature: converter.signature.decode(signature),
      fromAuthSignature:
        fromAuthSignature && fromAuthSignature.includes("/")
          ? converter.signature.decode(fromAuthSignature)
          : undefined,
      toAuthSignature:
        toAuthSignature && toAuthSignature.includes("/")
          ? converter.signature.decode(toAuthSignature)
          : undefined,
    };
    return migrateCertificateJson;
  }

  /**
   * 迁移凭证迁出授权签名
   *
   * @param args
   */
  async fromAuthSignMigrateCertificate(
    args: BFChainCore.CrossChain.AuthSignMigrateCertificateArgs,
  ) {
    const converter = CrossChainConverterFactory(args.migrateCertificate);
    return converter.signature.generateMigrateCertificateFromAuthSignature(
      args,
      this.accountBaseHelper,
      this.asymmetricHelper,
    );
  }

  /**
   * 迁移凭证迁入授权签名
   *
   * @param args
   */
  async toAuthSignMigrateCertificate(args: BFChainCore.CrossChain.AuthSignMigrateCertificateArgs) {
    const converter = CrossChainConverterFactory(args.migrateCertificate);
    return converter.signature.generateMigrateCertificateToAuthSignature(
      args,
      this.accountBaseHelper,
      this.asymmetricHelper,
    );
  }

  /**
   * 验证迁移凭证签名
   *
   * @param migrateCertificate
   * @param opts
   */
  async verifyMigrateCertificateSignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const converter = CrossChainConverterFactory(migrateCertificate);
    return converter.signature.verifyMigrateCertificateSignature(
      migrateCertificate,
      this.asymmetricHelper,
      opts,
    );
  }

  /**
   * 验证迁移凭证迁出授权签名
   *
   * @param migrateCertificate
   * @param opts
   */
  async verifyMigrateCertificateFromAuthSignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const converter = CrossChainConverterFactory(migrateCertificate);
    return converter.signature.verifyMigrateCertificateFromAuthSignature(
      migrateCertificate,
      this.asymmetricHelper,
      opts,
    );
  }

  /**
   * 验证迁移凭证迁入授权签名
   *
   * @param migrateCertificate
   * @param opts
   */
  async verifyMigrateCertificateToAuthSignature(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const converter = CrossChainConverterFactory(migrateCertificate);
    return converter.signature.verifyMigrateCertificateToAuthSignature(
      migrateCertificate,
      this.asymmetricHelper,
      opts,
    );
  }

  async checkAuthAccount(
    config: BFChainCore.CrossChain.ChainBaseConfig,
    authSignature: BFChainCore.AccountSignatureJSON,
  ) {
    const address = await this.accountBaseHelper.getAddressFromPublicKeyString(
      authSignature.publicKey,
    );
    const genesisDelegates = config.genesisDelegates;
    const genesisAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      config.generatorPublicKey,
    );
    genesisDelegates.push(genesisAddress);
    if (!genesisDelegates.includes(address)) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `signature address ${address}`,
        be_compare_prop: "genesis delegate address",
        to_target: "migrateCertificate",
        be_target: "fromChain",
        function: "checkAuthAccount",
      });
    }
  }

  async checkChainInfo(
    key: string,
    chainInfo: BFChainCore.CrossChain.ChainBaseInfo,
    config: BFChainCore.CrossChain.ChainBaseConfig,
    authSignature?: BFChainCore.AccountSignatureJSON,
  ) {
    const Function_Exception_Detail = {
      function: "checkChainInfo",
    } as const;

    if (chainInfo.magic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `${key}.magic ${chainInfo.magic}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.magic,
        ...Function_Exception_Detail,
      });
    }
    if (chainInfo.chainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `${key}.chainName ${chainInfo.chainName}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.chainName,
        ...Function_Exception_Detail,
      });
    }
    if (chainInfo.genesisBlockSignature !== chainInfo.genesisBlockSignature) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `${key}.genesisBlockSignature ${chainInfo.genesisBlockSignature}`,
        to_target: "migrateCertificate",
        be_compare_prop: chainInfo.genesisBlockSignature,
        ...Function_Exception_Detail,
      });
    }

    if (authSignature) {
      await this.checkAuthAccount(config, authSignature);
    }
  }

  /**
   * 验证迁移凭证
   *
   * @param migrateCertificate
   * @param options
   * @returns
   */
  async verifyMigrateCertificate(
    migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
    options: BFChainCore.CrossChain.MigrateCertificateVerifyOptions,
  ) {
    const Function_Exception_Detail = {
      function: "verifyMigrateCertificate",
    } as const;

    const MigrateCertificate_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "migrateCertificate",
    } as const;

    const converter = CrossChainConverterFactory(migrateCertificate);

    const { forceCheckFrom, fromChainBaseConfig, forceCheckTo, toChainBaseConfig } = options;

    const { body, signature, fromAuthSignature, toAuthSignature } = migrateCertificate;

    this.checkVersion(body.version);
    this.checkTimestamp(body.timestamp);
    converter.fromChainId.checkDecodeArgs(body.fromChainId);
    converter.toChainId.checkDecodeArgs(body.toChainId);
    converter.fromId.checkDecodeArgs(body.fromId);
    converter.toId.checkDecodeArgs(body.toId);
    converter.assetTypeId.checkDecodeArgs(body.assetTypeId);
    this.checkAssets(body.assets);
    converter.signature.checkDecodeArgs(signature, "signature");

    const baseHelper = this.baseHelper;
    const accountSignature = converter.signature.decode(signature, true);
    if (!baseHelper.isValidAccountSignature(accountSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `signature ${signature}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }

    await converter.signature.verifyMigrateCertificateSignature(
      migrateCertificate,
      this.asymmetricHelper,
    );

    if (forceCheckFrom) {
      if (!fromChainBaseConfig) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "fromChainBaseConfig",
          target: "options",
          ...Function_Exception_Detail,
        });
      }

      const fromChain = converter.fromChainId.decode(body.fromChainId);
      await this.checkChainInfo("fromChain", fromChain, fromChainBaseConfig);

      if (fromAuthSignature && fromAuthSignature.includes(KEY_SPLITTER)) {
        converter.signature.checkDecodeArgs(fromAuthSignature, "fromAuthSignature");
        const fromAuthAccountSignature = converter.signature.decode(fromAuthSignature, true);
        if (!baseHelper.isValidAccountSignature(fromAuthAccountSignature)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: `fromAuthSignature ${fromAuthSignature}`,
            ...MigrateCertificate_Exception_Detail,
          });
        }
        await this.checkAuthAccount(fromChainBaseConfig, fromAuthAccountSignature);
        await this.verifyMigrateCertificateFromAuthSignature(migrateCertificate);
      }
    }

    if (forceCheckTo) {
      if (!toChainBaseConfig) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "toChainBaseConfig",
          target: "options",
          ...Function_Exception_Detail,
        });
      }

      const toChain = converter.toChainId.decode(body.toChainId);
      await this.checkChainInfo("toChain", toChain, toChainBaseConfig);

      if (toAuthSignature && toAuthSignature.includes(KEY_SPLITTER)) {
        converter.signature.checkDecodeArgs(toAuthSignature, "toAuthSignature");
        const toAuthAccountSignature = converter.signature.decode(toAuthSignature, true);
        if (!baseHelper.isValidAccountSignature(toAuthAccountSignature)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: `toAuthSignature ${toAuthSignature}`,
            ...MigrateCertificate_Exception_Detail,
          });
        }
        await this.checkAuthAccount(toChainBaseConfig, toAuthAccountSignature);
        await this.verifyMigrateCertificateToAuthSignature(migrateCertificate);
      }
    }

    return converter;
  }
}
