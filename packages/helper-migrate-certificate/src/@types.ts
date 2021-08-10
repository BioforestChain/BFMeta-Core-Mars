declare namespace BFChainCore {
  type AccountBaseHelper = import("@bfchain/core-helper-account-base").AccountBaseHelper;
  type AsymmetricHelper = import("@bfchain/core-helper-asymmetric").AsymmetricHelper;

  // #region converter

  namespace CrossChain {
    interface ChainBaseInfo {
      /**链名 */
      chainName: string;
      /**链网络标识符 */
      magic: string;
      /**链创世块签名 */
      genesisBlockSignature: string;
    }

    type GetConverterType<C> = C extends Converter<infer T> ? T : never;
    type Item<K extends string = string, C extends Converter = Converter> = readonly [K, C];
    type GetValue<T> = T extends Item<infer _, infer V> ? V : never;
    type GetKeys<T> = T extends Item<infer K, infer _> ? K : never;
    type GetValueByKey<K, T> = T extends Item<infer Key, infer V>
      ? K extends Key
        ? V
        : never
      : never;

    interface Converter<T = unknown> {
      encode(args: T, skipVerify?: boolean): string;
      decode(args: string, skipVerify?: boolean): T;
      checkDecodeArgs(args: unknown): void;
      checkEncodeArgs(args: T): void;
    }
    interface ChainIdConverter extends Converter<ChainBaseInfo> {}
    interface IdConverter extends Converter<string> {}
    interface AssetTypeIdConverter extends Converter<string> {}

    interface SignatureConverter extends Converter<BFChainCore.AccountSignatureJSON> {
      splitSignature(args: string): string;
      splitSignSignature(args: string): string;

      generateMigrateCertificateSignature(
        args: {
          secret: string;
          secondSecret?: string;
          migrateCertificate: MigrateCertificateJSON;
        },
        accountBaseHelper: AccountBaseHelper,
        asymmetricHelper: AsymmetricHelper,
      ): Promise<MigrateCertificateJSON>;
      generateMigrateCertificateFromAuthSignature(
        args: {
          authSecret: string;
          authSecondSecret?: string;
          migrateCertificate: MigrateCertificateJSON;
        },
        accountBaseHelper: AccountBaseHelper,
        asymmetricHelper: AsymmetricHelper,
      ): Promise<MigrateCertificateJSON>;
      generateMigrateCertificateToAuthSignature(
        args: {
          authSecret: string;
          authSecondSecret?: string;
          migrateCertificate: MigrateCertificateJSON;
        },
        accountBaseHelper: AccountBaseHelper,
        asymmetricHelper: AsymmetricHelper,
      ): Promise<MigrateCertificateJSON>;

      verifyMigrateCertificateSignature(
        migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
        asymmetricHelper: AsymmetricHelper,
        opts?: {
          taskLabel?: string;
        },
      ): Promise<void>;
      verifyMigrateCertificateFromAuthSignature(
        migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
        asymmetricHelper: AsymmetricHelper,
        opts?: {
          taskLabel?: string;
        },
      ): Promise<void>;
      verifyMigrateCertificateToAuthSignature(
        migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
        asymmetricHelper: AsymmetricHelper,
        opts?: {
          taskLabel?: string;
        },
      ): Promise<void>;
    }

    interface CrossChainConverter {
      fromChainId: ChainIdConverter;
      toChainId: ChainIdConverter;
      fromId: IdConverter;
      toId: IdConverter;
      assetTypeId: AssetTypeIdConverter;
      signature: SignatureConverter;
      getUUID: (migrateCertificate: MigrateCertificateJSON) => string;
    }

    interface CrossChainFieldConverterOptions<
      FromChainVersion = string,
      BodyVersion = string,
      FieldName = string,
      FieldNameVersion = string,
    > {
      fromChainVersion: FromChainVersion;
      bodyVersion: BodyVersion;
      fieldName: FieldName;
      fieldNameVersion: FieldNameVersion;
    }

    interface CrossChainConverterOptions {
      fromChainVersion: string;
      bodyVersion: string;
      fields: {
        fieldName: string;
        fieldNameVersion: string;
      }[];
    }

    // type $KC<K extends string = string, C extends Converter = Converter> = readonly [K, C];
    // type GetKeys<T> = T extends [infer K, infer _] ? K : never;
    // type GetValueByKey<K, T> = T extends [infer Key, infer V] ? (K extends Key ? V : never) : never;

    interface MigrateCertificateBodyJSON {
      /**凭证版本 */
      version: string;
      /**发起人的唯一标识 version/address */
      fromId: string;
      /**接收人的唯一标识 version/address */
      toId: string;
      /**迁出凭证生成时间 Date.now().getTimes() */
      timestamp: number;
      /**迁出链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
      fromChainId: string;
      /**迁入链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
      toChainId: string;
      /**迁出的权益：version/assetType */
      assetTypeId: string;
      /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
      assets: string;
    }

    interface MigrateCertificateJSON {
      /**凭证信息 */
      body: MigrateCertificateBodyJSON;
      /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
      signature: string;
      /**迁出链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
      fromAuthSignature: string;
      /**迁入链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
      toAuthSignature: string;
    }

    interface MigrateCertificate {
      /**迁移信息 */
      body: {
        /**凭证版本 */
        version: string;
        /**发起账户 */
        senderId: string;
        /**接受账户 */
        recipientId: string;
        /**迁出凭证生成时间 Date.now().getTimes() */
        timestamp: number;
        /**迁出链信息 */
        fromChain: ChainBaseInfo;
        /**迁入链信息 */
        toChain: ChainBaseInfo;
        /**迁出的权益名 */
        assetType: string;
        /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
        assets: string;
      };
      /**发起账户签名 */
      signature: BFChainCore.AccountSignatureJSON;
      /**迁出链的授权签名 */
      fromAuthSignature?: BFChainCore.AccountSignatureJSON;
      /**迁入链的授权签名 */
      toAuthSignature?: BFChainCore.AccountSignatureJSON;
    }

    interface GenerateMigrateCertificateArgs {
      /**申请账户密钥 */
      senderSecret: string;
      /**申请账户安全密钥 */
      senderSecondSecret?: string;
      /**接收账户 */
      recipientId: string;
      /**去往链信息 */
      toChainInfo: ChainBaseInfo;
      /**迁移的数量 */
      assets: string;
    }

    interface AuthSignMigrateCertificateArgs {
      /**授权账户密钥 */
      authSecret: string;
      /**授权账户安全密钥 */
      authSecondSecret?: string;
      /**签名版本号 */
      version?: string;
      /**迁移凭证 */
      migrateCertificate: MigrateCertificateJSON;
    }

    interface ChainBaseConfig extends ChainBaseInfo {
      generatorPublicKey: string;
      genesisDelegates: string[];
    }

    interface MigrateCertificateVerifyOptions {
      /**验证迁出信息 */
      forceCheckFrom?: boolean;
      /**验证迁入信息 */
      forceCheckTo?: boolean;
      /**迁出链的基础配置信息 */
      fromChainBaseConfig?: ChainBaseConfig;
      /**迁入链的基础配置信息 */
      toChainBaseConfig?: ChainBaseConfig;
    }
  }
  // #endregion
}
