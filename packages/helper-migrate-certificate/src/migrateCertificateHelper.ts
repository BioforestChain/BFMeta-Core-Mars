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

const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class MigrateCertificateHelper {
  readonly version = "1";

  constructor(
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainTimeHelper: ChainTimeHelper,
    public asymmetricHelper: AsymmetricHelper,
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
  ) {}

  getConverter(migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON) {
    return CrossChainConverterFactory(migrateCertificate);
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
    const version = this.version;
    const { senderSecret, senderSecondSecret, recipientId, toChainInfo, assets } = args;
    const converter = CrossChainConverterFactory();

    this.checkAssets(assets);

    const accountBaseHelper = this.accountBaseHelper;
    const keypair = await accountBaseHelper.createSecretKeypair(senderSecret);
    const address = await accountBaseHelper.getAddressFromPublicKey(keypair.publicKey);
    let migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON = {
      body: {
        /**凭证版本 */
        version,
        /**发起账户的唯一标识 version/address */
        fromId: converter.fromId.encode(address, true),
        /**接收账户的唯一标识 version/address */
        toId: converter.toId.encode(recipientId, true),
        /**迁出凭证生成时间 Date.now().getTimes() */
        timestamp: this.chainTimeHelper.now(),
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

    migrateCertificate = await converter.signature.generateMigrateCertificateSignature(
      { secret: senderSecret, secondSecret: senderSecondSecret, migrateCertificate },
      accountBaseHelper,
      this.asymmetricHelper,
    );

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
          ...Function_Exception_Detail,
        });
      }
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

    converter.fromChainId.checkDecodeArgs(body.fromChainId);
    converter.toChainId.checkDecodeArgs(body.toChainId);
    converter.fromId.checkDecodeArgs(body.fromId);
    converter.toId.checkDecodeArgs(body.toId);
    converter.assetTypeId.checkDecodeArgs(body.assetTypeId);
    this.checkAssets(body.assets);
    converter.signature.checkDecodeArgs(signature);

    const baseHelper = this.baseHelper;
    const accountSignature = converter.signature.decode(signature);
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
      converter.signature.checkDecodeArgs(fromAuthSignature);

      if (!fromChainBaseConfig) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "fromChainBaseConfig",
          target: "options",
          ...Function_Exception_Detail,
        });
      }

      const fromAuthAccountSignature = converter.signature.decode(fromAuthSignature);
      if (!baseHelper.isValidAccountSignature(fromAuthAccountSignature)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `fromAuthSignature ${fromAuthSignature}`,
          ...MigrateCertificate_Exception_Detail,
        });
      }

      const fromChain = converter.fromChainId.decode(body.fromChainId);
      await this.checkChainInfo(
        "fromChain",
        fromChain,
        fromChainBaseConfig,
        fromAuthAccountSignature,
      );

      if (fromAuthSignature) {
        await this.verifyMigrateCertificateFromAuthSignature(migrateCertificate);
      }
    }

    if (forceCheckTo) {
      converter.signature.checkDecodeArgs(toAuthSignature);

      if (!toChainBaseConfig) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "toChainBaseConfig",
          target: "options",
          ...Function_Exception_Detail,
        });
      }

      const toAuthAccountSignature = converter.signature.decode(toAuthSignature);
      if (!baseHelper.isValidAccountSignature(toAuthAccountSignature)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `toAuthSignature ${toAuthSignature}`,
          ...MigrateCertificate_Exception_Detail,
        });
      }

      const toChain = converter.toChainId.decode(body.toChainId);
      await this.checkChainInfo("toChain", toChain, toChainBaseConfig, toAuthAccountSignature);

      if (toAuthSignature) {
        await this.verifyMigrateCertificateToAuthSignature(migrateCertificate);
      }
    }

    return converter;
  }
}
