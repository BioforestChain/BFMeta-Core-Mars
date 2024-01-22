import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { BaseHelper } from "@bfchain/core-helper-type";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { ChainTimeHelper } from "@bfchain/core-helper-chain-time";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { CrossChainConverterFactory } from "./CrossChainConverterFactory";
import { Config } from "./config";
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
    public config: Config,
  ) {}

  private __checkVersion(version: any) {
    if (!version) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "version",
        target: "migrateCertificate",
      });
    }
    if (typeof version !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "version",
        target: "migrateCertificate",
      });
    }
  }

  private __checkTimestamp(timestamp: any) {
    if (!timestamp) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "timestamp",
        target: "migrateCertificate",
      });
    }
    if (!this.baseHelper.isPositiveInteger(timestamp)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "timestamp",
        target: "migrateCertificate",
      });
    }
  }

  private __checkAssets(assets: string) {
    if (!assets) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "assets",
        target: "migrateCertificate",
      });
    }
    if (!this.baseHelper.isValidAssetNumber(assets)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "assets",
        target: "migrateCertificate",
      });
    }
    if (assets === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: "assets",
        fueld: "0",
        target: "migrateCertificate",
      });
    }
  }

  getMigrateCertificateConverter(
    migrateCertificate?: BFChainCore.CrossChain.MigrateCertificateJSON,
  ) {
    return CrossChainConverterFactory(migrateCertificate);
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
        assetId: body.assetId,
        assetPrealnum: body.assetPrealnum,
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
    const { senderId, recipientId, toChainInfo, assetInfo, assetPrealnum } = args;
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
          assetId: converter.assetId.encode(assetInfo, true),
          /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
          assetPrealnum,
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
      migrateCertificate.fromAuthSignature = converter.fromAuthSignature.encode(fromAuthSignature);
    }
    if (toAuthSignature) {
      migrateCertificate.toAuthSignature = converter.toAuthSignature.encode(toAuthSignature);
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
    const { senderSecret, senderSecondSecret, recipientId, toChainInfo, assetInfo, assetPrealnum } =
      args;
    const converter = CrossChainConverterFactory();

    this.__checkAssets(assetPrealnum);

    const accountBaseHelper = this.accountBaseHelper;
    const keypair = await accountBaseHelper.createSecretKeypair(senderSecret);
    const address = await accountBaseHelper.getAddressFromPublicKey(keypair.publicKey);
    // 时间、地点、人物、起因、经过、结果
    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON = {
      body: {
        /**凭证版本 */
        version: this.config.version,
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
        /**迁出的权益：version/parentAssetType/assetType */
        assetId: converter.assetId.encode(assetInfo, true),
        /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
        assetPrealnum,
      },
      /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
      signature: "",
      /**迁出链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
      fromAuthSignature: "",
      /**迁入链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
      toAuthSignature: "",
    };

    if (senderSecret) {
      migrateCertificate = await converter.signature.generateSignature(
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
        asset: converter.assetId.decode(body.assetId),
        assetPrealnum: body.assetPrealnum,
      },
      signature: converter.signature.decode(signature),
      fromAuthSignature:
        fromAuthSignature && fromAuthSignature.includes("/")
          ? converter.fromAuthSignature.decode(fromAuthSignature)
          : undefined,
      toAuthSignature:
        toAuthSignature && toAuthSignature.includes("/")
          ? converter.toAuthSignature.decode(toAuthSignature)
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
    return converter.fromAuthSignature.generateSignature(
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
    return converter.toAuthSignature.generateSignature(
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
    return converter.signature.verifySignature(migrateCertificate, this.asymmetricHelper, opts);
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
    return converter.fromAuthSignature.verifySignature(
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
    return converter.toAuthSignature.verifySignature(
      migrateCertificate,
      this.asymmetricHelper,
      opts,
    );
  }

  private async __checkAuthAccount(
    key: string,
    config: BFChainCore.CrossChain.ChainBaseConfig,
    authSignature: BFChainCore.AccountSignatureJSON,
  ) {
    const address = await this.accountBaseHelper.getAddressFromPublicKeyString(
      authSignature.publicKey,
    );
    const genesisGenerators = config.genesisGenerators;
    const genesisAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      config.generatorPublicKey,
    );
    genesisGenerators.push(genesisAddress);
    if (!genesisGenerators.includes(address)) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `${key} auth signature address ${address}`,
        be_compare_prop: "genesis generator address",
        to_target: "migrateCertificate",
        be_target: "fromChain",
      });
    }
  }

  async checkChainInfo(
    key: string,
    chainInfo: BFChainCore.CrossChain.ChainBaseInfo,
    config: BFChainCore.CrossChain.ChainBaseConfig,
    authSignature?: BFChainCore.AccountSignatureJSON,
  ) {
    if (chainInfo.magic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `${key}.magic ${chainInfo.magic}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.magic,
      });
    }
    if (chainInfo.chainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `${key}.chainName ${chainInfo.chainName}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.chainName,
      });
    }
    if (chainInfo.genesisBlockSignature !== chainInfo.genesisBlockSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `${key}.genesisBlockSignature ${chainInfo.genesisBlockSignature}`,
        to_target: "migrateCertificate",
        be_compare_prop: chainInfo.genesisBlockSignature,
      });
    }

    if (authSignature) {
      await this.__checkAuthAccount(key, config, authSignature);
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
    const MigrateCertificate_Exception_Detail = {
      target: "migrateCertificate",
    } as const;

    const converter = CrossChainConverterFactory(migrateCertificate);

    const {
      forceCheckFromChainInfo,
      fromChainBaseConfig,
      forceCheckFromAuthSignature,
      forceCheckToChainInfo,
      toChainBaseConfig,
      forceCheckToAuthSignature,
    } = options;

    const { body, signature, fromAuthSignature, toAuthSignature } = migrateCertificate;

    this.__checkVersion(body.version);
    this.__checkTimestamp(body.timestamp);
    converter.fromChainId.checkDecodeArgs(body.fromChainId);
    converter.toChainId.checkDecodeArgs(body.toChainId);
    converter.fromId.checkDecodeArgs(body.fromId);
    converter.toId.checkDecodeArgs(body.toId);
    converter.assetId.checkDecodeArgs(body.assetId);
    this.__checkAssets(body.assetPrealnum);
    converter.signature.checkDecodeArgs(signature);

    const baseHelper = this.baseHelper;
    const accountSignature = converter.signature.decode(signature, true);
    if (!baseHelper.isValidAccountSignature(accountSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `signature ${signature}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }

    await converter.signature.verifySignature(migrateCertificate, this.asymmetricHelper);

    if (forceCheckFromChainInfo) {
      if (!fromChainBaseConfig) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "fromChainBaseConfig",
          target: "options",
        });
      }

      const fromChain = converter.fromChainId.decode(body.fromChainId);
      await this.checkChainInfo("fromChain", fromChain, fromChainBaseConfig);

      if (fromAuthSignature && fromAuthSignature.includes(KEY_SPLITTER)) {
        converter.fromAuthSignature.checkDecodeArgs(fromAuthSignature);
        const fromAuthAccountSignature = converter.fromAuthSignature.decode(
          fromAuthSignature,
          true,
        );
        if (!baseHelper.isValidAccountSignature(fromAuthAccountSignature)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `fromAuthSignature ${fromAuthSignature}`,
            ...MigrateCertificate_Exception_Detail,
          });
        }
        await this.__checkAuthAccount("fromChain", fromChainBaseConfig, fromAuthAccountSignature);
      }
    }

    if (forceCheckFromAuthSignature) {
      if (!fromAuthSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "fromAuthSignature",
          ...MigrateCertificate_Exception_Detail,
        });
      }
      await this.verifyMigrateCertificateFromAuthSignature(migrateCertificate);
    }

    if (forceCheckToChainInfo) {
      if (!toChainBaseConfig) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "toChainBaseConfig",
          target: "options",
        });
      }

      const toChain = converter.toChainId.decode(body.toChainId);
      await this.checkChainInfo("toChain", toChain, toChainBaseConfig);

      if (toAuthSignature && toAuthSignature.includes(KEY_SPLITTER)) {
        converter.toAuthSignature.checkDecodeArgs(toAuthSignature);
        const toAuthAccountSignature = converter.toAuthSignature.decode(toAuthSignature, true);
        if (!baseHelper.isValidAccountSignature(toAuthAccountSignature)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `toAuthSignature ${toAuthSignature}`,
            ...MigrateCertificate_Exception_Detail,
          });
        }
        await this.__checkAuthAccount("toChain", toChainBaseConfig, toAuthAccountSignature);
      }
    }

    if (forceCheckToAuthSignature) {
      if (!toAuthSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "toAuthSignature",
          ...MigrateCertificate_Exception_Detail,
        });
      }
      await this.verifyMigrateCertificateToAuthSignature(migrateCertificate);
    }

    return converter;
  }
}
