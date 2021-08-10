import { FieldConverter } from "./1";
import { Injectable } from "@bfchain/util-dep-inject";

const fieldConverter = FieldConverter();
type DefaultType = typeof fieldConverter["$TYPE"];
type DefaultKeys = DefaultType[0];
type SomeFieldNameVersion<K, N> = K extends `${infer _}/${infer FieldName}/${infer K}`
  ? N extends FieldName
    ? K
    : never
  : never;

@Injectable()
export class CrossChainV1DefaultConverter implements BFChainCore.CrossChain.CrossChainConverter {
  protected fieldConverter = fieldConverter;
  protected __fromChainId!: BFChainCore.CrossChain.ChainIdConverter;
  protected __toChainId!: BFChainCore.CrossChain.ChainIdConverter;
  protected __fromId!: BFChainCore.CrossChain.IdConverter;
  protected __toId!: BFChainCore.CrossChain.IdConverter;
  protected __assetTypeId!: BFChainCore.CrossChain.AssetTypeIdConverter;
  protected __signature!: BFChainCore.CrossChain.SignatureConverter;

  get fromChainId() {
    return this.__fromChainId;
  }
  get toChainId() {
    return this.__toChainId;
  }
  get fromId() {
    return this.__fromId;
  }
  get toId() {
    return this.__toId;
  }
  get assetTypeId() {
    return this.__assetTypeId;
  }
  get signature() {
    return this.__signature;
  }

  getUUID(migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON) {
    return this.signature.decode(migrateCertificate.fromAuthSignature, true).signature;
  }

  constructor(
    readonly config?: {
      fromChainIdVersion: SomeFieldNameVersion<DefaultKeys, "fromChainId">;
      toChainIdVersion: SomeFieldNameVersion<DefaultKeys, "toChainId">;
      fromIdVersion: SomeFieldNameVersion<DefaultKeys, "fromId">;
      toIdVersion: SomeFieldNameVersion<DefaultKeys, "toId">;
      assetTypeIdVersion: SomeFieldNameVersion<DefaultKeys, "assetTypeId">;
      signatureVersion: SomeFieldNameVersion<DefaultKeys, "signature">;
    },
  ) {
    this._init();
    this._check();
  }
  protected _init() {
    if (!this.config) {
      this.__fromChainId = fieldConverter.get(`1/fromChainId/1`);
      this.__toChainId = fieldConverter.get(`1/toChainId/1`);
      this.__fromId = fieldConverter.get(`1/fromId/1`);
      this.__toId = fieldConverter.get(`1/toId/1`);
      this.__assetTypeId = fieldConverter.get(`1/assetTypeId/1`);
      this.__signature = fieldConverter.get(`1/signature/1`);
      return;
    }

    const {
      fromChainIdVersion,
      toChainIdVersion,
      fromIdVersion,
      toIdVersion,
      assetTypeIdVersion,
      signatureVersion,
    } = this.config;
    this.__fromChainId = fieldConverter.get(`1/fromChainId/${fromChainIdVersion}` as never);
    this.__toChainId = fieldConverter.get(`1/toChainId/${toChainIdVersion}` as never);
    this.__fromId = fieldConverter.get(`1/fromId/${fromIdVersion}` as never);
    this.__toId = fieldConverter.get(`1/toId/${toIdVersion}` as never);
    this.__assetTypeId = fieldConverter.get(`1/assetTypeId/${assetTypeIdVersion}` as never);
    this.__signature = fieldConverter.get(`1/signature/${signatureVersion}` as never);
  }

  private _check() {
    if (!this.config) {
      return;
    }
    if (!this.__fromChainId) {
      throw new SyntaxError(`unknown fromChainId version ${this.config.fromChainIdVersion}`);
    }
    if (!this.__toChainId) {
      throw new SyntaxError(`unknown toChainId version ${this.config.toChainIdVersion}`);
    }
    if (!this.__fromId) {
      throw new SyntaxError(`unknown fromId version ${this.config.fromIdVersion}`);
    }
    if (!this.__toId) {
      throw new SyntaxError(`unknown toId version ${this.config.toIdVersion}`);
    }
    if (!this.__assetTypeId) {
      throw new SyntaxError(`unknown assetTypeId version ${this.config.assetTypeIdVersion}`);
    }
    if (!this.__signature) {
      throw new SyntaxError(`unknown signature version ${this.config.signatureVersion}`);
    }
  }
}
