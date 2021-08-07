import { Injectable, Inject } from "@bfchain/util-dep-inject";
import {
  CoreExceptionGenerator,
  NOT_MATCH,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  PROP_SHOULD_GT_FIELD,
  SHOULD_BE,
} from "@bfchain/core-util-exception";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { BaseHelper } from "@bfchain/core-helper-type";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { ChainTimeHelper } from "@bfchain/core-helper-chain-time";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { MigrateCertificateModel } from "@bfchain/core-model-common";

const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class MigrateCertificateHelper {
  readonly version = "1";

  constructor(
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainTimeHelper: ChainTimeHelper,
    public asymmetricHelper: AsymmetricHelper,
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
  ) {}

  recombineMigrateCertificate(migrateCertificateJson: BFChainCore.MigrateCertificateJSON) {
    return MigrateCertificateModel.fromObject<MigrateCertificateModel>(migrateCertificateJson);
  }
  fromJSON = this.recombineMigrateCertificate;

  getChainId(chainInfo: BFChainCore.ChainBaseInfo) {
    return `${this.version}/${chainInfo.magic}/${chainInfo.chainName}/${chainInfo.genesisBlockSignature}`;
  }

  /**
   * 生成迁移凭证信息
   *
   * @param args
   * @param config
   * @returns
   */
  async generateMigrateCertificate(
    args: BFChainCore.GenerateMigrateCertificateArgs,
    config = this.configHelper,
  ) {
    const version = this.version;
    const prefix = version + "/";
    const accountBaseHelper = this.accountBaseHelper;
    const { senderSecret, senderSecondSecret, recipientId, toChainInfo, assets } = args;
    const keypair = await accountBaseHelper.createSecretKeypair(senderSecret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    const address = await accountBaseHelper.getAddressFromPublicKey(keypair.publicKey);

    const certificate = this.fromJSON({
      /**凭证版本 */
      version,
      /**发起账户的唯一标识 version/address */
      fromUserId: prefix + address,
      /**接收账户的唯一标识 version/address */
      toUserId: prefix + recipientId,
      /**迁出凭证生成时间 Date.now().getTimes() */
      timestamp: this.chainTimeHelper.now(),
      /**迁出链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
      fromChainId: this.getChainId({
        magic: config.magic,
        chainName: config.chainName,
        genesisBlockSignature: config.signature,
      }),
      /**迁入链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
      toChainId: this.getChainId(toChainInfo),
      /**迁出的权益：version/assetType */
      assetTypeId: prefix + config.assetType,
      /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
      assets,
      /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
      signature: version,
      /**创世受托人签名 version/publicKey-signature/secondPublicKey-signSignature */
      authSignature: version,
    });
    const signatureBuffer = await this.asymmetricHelper.detachedSign(
      certificate.getBytes(true, true),
      keypair.secretKey,
    );
    certificate.signature += `/${publicKey}-${getHexFromArrayBuffer(signatureBuffer)}`;
    if (senderSecondSecret) {
      const secondKeypair = await accountBaseHelper.createSecondSecretKeypairV2(
        senderSecret,
        senderSecondSecret,
      );
      const secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
      const signSignatureBuffer = await this.asymmetricHelper.detachedSign(
        certificate.getBytes(false, true),
        secondKeypair.secretKey,
      );
      certificate.signature += `/${secondPublicKey}-${getHexFromArrayBuffer(signSignatureBuffer)}`;
    }
    return certificate;
  }

  /**
   * 给迁移凭证授权
   *
   * @param args
   */
  async authSignMigrateCertificate(args: BFChainCore.AuthSignMigrateCertificateArgs) {
    const asymmetricHelper = this.asymmetricHelper;
    const accountBaseHelper = this.accountBaseHelper;
    const { authSecret, authSecondSecret, migrateCertificate } = args;
    const keypair = await accountBaseHelper.createSecretKeypair(authSecret);
    const publicKey = getHexFromArrayBuffer(keypair.publicKey);
    const signatureBuffer = await asymmetricHelper.detachedSign(
      migrateCertificate.getAuthBytes(false, false),
      keypair.secretKey,
    );
    migrateCertificate.authSignature += `/${publicKey}-${getHexFromArrayBuffer(signatureBuffer)}`;
    if (authSecondSecret) {
      const secondKeypair = await accountBaseHelper.createSecondSecretKeypairV2(
        authSecret,
        authSecondSecret,
      );
      const secondPublicKey = getHexFromArrayBuffer(secondKeypair.publicKey);
      const signSignatureBuffer = await asymmetricHelper.detachedSign(
        migrateCertificate.getAuthBytes(false, true),
        secondKeypair.secretKey,
      );
      migrateCertificate.authSignature += `/${secondPublicKey}-${getHexFromArrayBuffer(
        signSignatureBuffer,
      )}`;
    }
    return migrateCertificate;
  }

  getAddressFromUserId(userId: string): string {
    return userId.split("/")[1];
  }

  getChainInfoFromChainId(chainId: string): BFChainCore.ChainBaseInfo {
    const items = chainId.split("/");
    return {
      magic: items[1],
      chainName: items[2],
      genesisBlockSignature: items[3],
    };
  }

  getAccountSignatureFromSignature(signature: string) {
    const items = signature.split("/");
    const signatureKeyValue = items[1].split("-");
    const accountSignature: BFChainCore.AccountSignatureJSON = {
      publicKey: signatureKeyValue[0],
      signature: signatureKeyValue[1],
    };
    if (items[2]) {
      const signSignatureKeyValue = items[1].split("-");
      accountSignature.secondPublicKey = signSignatureKeyValue[0];
      accountSignature.signSignature = signSignatureKeyValue[1];
    }
    return accountSignature;
  }

  getAssetTypeFromAssetTypeId(assetTypeId: string) {
    return assetTypeId.split("/")[1];
  }

  parseMigrateCertificateToJson(
    migrateCertificate: MigrateCertificateModel | BFChainCore.MigrateCertificateJSON,
  ) {
    const migrateCertificateJson: BFChainCore.MigrateCertificate = {
      version: migrateCertificate.version,
      senderId: this.getAddressFromUserId(migrateCertificate.fromUserId),
      recipientId: this.getAddressFromUserId(migrateCertificate.toUserId),
      timestamp: migrateCertificate.timestamp,
      fromChain: this.getChainInfoFromChainId(migrateCertificate.fromChainId),
      toChain: this.getChainInfoFromChainId(migrateCertificate.toChainId),
      assetType: this.getAssetTypeFromAssetTypeId(migrateCertificate.assetTypeId),
      assets: migrateCertificate.assets,
      signature: this.getAccountSignatureFromSignature(migrateCertificate.signature),
      authSignature: this.getAccountSignatureFromSignature(migrateCertificate.authSignature),
    };
    return migrateCertificateJson;
  }

  /**
   * 验证迁移凭证签名
   *
   * @param migrateCertificate
   * @param opts
   */
  async verifyMigrateCertificateSignature(
    migrateCertificate: MigrateCertificateModel,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "MigrateCertificate";
    const asymmetricHelper = this.asymmetricHelper;
    const items = migrateCertificate.signature.split("/");
    const signatureKeyValue = items[1].split("-");
    // 验证 signature 与 publicKey
    if (
      !(await asymmetricHelper.detachedVeriy(
        migrateCertificate.getBytes(true, true),
        parseHexToArrayBuffer(signatureKeyValue[1]),
        parseHexToArrayBuffer(signatureKeyValue[0]),
      ))
    ) {
      throw new ArgumentIllegalException(`Invalid ${taskLabel} signature`);
    }
    // 验证 signSignature 与 secondPublicKey
    if (items[2]) {
      const signSignatureKeyValue = items[2].split("-");
      if (
        !(await asymmetricHelper.detachedVeriy(
          migrateCertificate.getBytes(false, true),
          parseHexToArrayBuffer(signSignatureKeyValue[1]),
          parseHexToArrayBuffer(signSignatureKeyValue[0]),
        ))
      ) {
        throw new ArgumentIllegalException(`Invalid ${taskLabel} signSignature`);
      }
    }
  }

  /**
   * 验证迁移凭证授权签名
   *
   * @param migrateCertificate
   * @param opts
   */
  async verifyMigrateCertificateAuthSignature(
    migrateCertificate: MigrateCertificateModel,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "MigrateCertificate";
    const asymmetricHelper = this.asymmetricHelper;
    const items = migrateCertificate.authSignature.split("/");
    const signatureKeyValue = items[1].split("-");
    // 验证 signature 与 publicKey
    if (
      !(await asymmetricHelper.detachedVeriy(
        migrateCertificate.getAuthBytes(true, true),
        parseHexToArrayBuffer(signatureKeyValue[1]),
        parseHexToArrayBuffer(signatureKeyValue[0]),
      ))
    ) {
      throw new ArgumentIllegalException(`Invalid ${taskLabel} authSignature`);
    }
    // 验证 signSignature 与 secondPublicKey
    if (items[2]) {
      const signSignatureKeyValue = items[2].split("-");
      if (
        !(await asymmetricHelper.detachedVeriy(
          migrateCertificate.getAuthBytes(false, true),
          parseHexToArrayBuffer(signSignatureKeyValue[1]),
          parseHexToArrayBuffer(signSignatureKeyValue[0]),
        ))
      ) {
        throw new ArgumentIllegalException(`Invalid ${taskLabel} authSignSignature`);
      }
    }
  }

  verifyFromChainId(fromChainId: string) {
    const MigrateCertificate_Exception_Detail = {
      target: "migrateCertificate",
      function: "verifyMigrateCertificate",
    } as const;

    if (!fromChainId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "fromChainId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!this.baseHelper.isString(fromChainId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "fromChainId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (fromChainId.split("/").length !== 4) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "fromChainId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
  }

  async verifyMigrateCertificate(
    migrateCertificate: BFChainCore.MigrateCertificateJSON,
    config = this.configHelper,
  ) {
    const Function_Exception_Detail = {
      function: "verifyMigrateCertificate",
    } as const;

    const MigrateCertificate_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "migrateCertificate",
    } as const;

    const {
      version,
      fromUserId,
      toUserId,
      timestamp,
      toChainId,
      assetTypeId,
      assets,
      signature,
      authSignature,
    } = migrateCertificate;

    const baseHelper = this.baseHelper;

    if (!version) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "version",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (version !== this.version) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `version ${version}`,
        be_compare_prop: `version ${this.version}`,
        to_target: "migrateCertificate",
        be_target: "blockChain.migrateCertificate",
        ...Function_Exception_Detail,
      });
    }

    if (!fromUserId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "fromUserId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isString(fromUserId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "fromUserId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (fromUserId.split("/").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "fromUserId",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!toUserId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "toUserId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isString(toUserId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toUserId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (toUserId.split("/").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toUserId",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!timestamp) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "timestamp",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isPositiveInteger(timestamp)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "timestamp",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    this.verifyFromChainId(migrateCertificate.fromChainId);

    if (!toChainId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "toChainId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isString(toChainId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toChainId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (toChainId.split("/").length !== 4) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toChainId",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!assetTypeId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetTypeId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isString(assetTypeId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assetTypeId",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (assetTypeId.split("/").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assetTypeId",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!assets) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assets",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(assets)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assets",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (assets === "0") {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: "assets",
        fueld: "0",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!signature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "signature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isString(signature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    const signatures = signature.split("/");
    if (signatures.length !== 2 && signatures.length !== 3) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (signatures[1].split("-").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (signatures[2] && signatures[2].split("-").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!authSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "authSignature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isString(authSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "authSignature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    const authSignatures = signature.split("/");
    if (authSignatures.length !== 2 && authSignatures.length !== 3) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "authSignature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (authSignatures[1].split("-").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "authSignature",
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (authSignatures[2] && authSignatures[2].split("-").length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "authSignature",
        ...MigrateCertificate_Exception_Detail,
      });
    }

    const migrateCertificateJson = this.parseMigrateCertificateToJson(migrateCertificate);
    const {
      fromChain,
      toChain,
      assetType,
      signature: acccountSignature,
      authSignature: authAccountSignature,
    } = migrateCertificateJson;
    if (fromChain.magic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromChain.magic ${fromChain.magic}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.magic,
        ...Function_Exception_Detail,
      });
    }
    if (fromChain.chainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromChain.chainName ${fromChain.chainName}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.chainName,
        ...Function_Exception_Detail,
      });
    }
    if (fromChain.genesisBlockSignature !== config.signature) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromChain.genesisBlockSignature ${fromChain.genesisBlockSignature}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.signature,
        ...Function_Exception_Detail,
      });
    }
    if (assetType !== config.assetType) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `assetType ${assetType}`,
        to_target: "migrateCertificate",
        be_compare_prop: config.assetType,
        ...Function_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(toChain.magic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `toChain.magic ${toChain.magic}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainName(toChain.chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `toChain.chainName ${toChain.chainName}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }
    if (!baseHelper.isValidBlockSignature(toChain.genesisBlockSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `toChain.genesisBlockSignature ${toChain.genesisBlockSignature}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAccountSignature(acccountSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `signature ${signature}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAccountSignature(authAccountSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `authSignature ${authSignature}`,
        ...MigrateCertificate_Exception_Detail,
      });
    }
    const address = await this.accountBaseHelper.getAddressFromPublicKeyString(
      authAccountSignature.publicKey,
    );
    const genesisDelegates = this.transactionHelper.genesisDelegates(config);
    const genesisAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      config.generatorPublicKey,
    );
    genesisDelegates.push(genesisAddress);
    if (!genesisDelegates.includes(address)) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `signature address ${address}`,
        be_compare_prop: "genesis delegate address",
        to_target: "migrateCertificate",
        be_target: "config",
        ...Function_Exception_Detail,
      });
    }

    const migrateCertificateModel = this.fromJSON(migrateCertificate);
    await this.verifyMigrateCertificateSignature(migrateCertificateModel);
    await this.verifyMigrateCertificateAuthSignature(migrateCertificateModel);

    return migrateCertificateModel;
  }
}
