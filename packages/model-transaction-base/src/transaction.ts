import type { RANGE_TYPE } from "@bfchain/core-model-constants";
import { Message, Type, Field, MapField } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { StringKeyMap } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { EasyWeakMap } from "@bfchain/util-extends-map";
import { decodeHex } from "@bfchain/util-encoding-hex";
const TrsRemarkMapWM = new EasyWeakMap(
  (trs: TransactionSubjectiveModel) => new StringKeyMap(trs.remark),
);
const blobMapWM = new EasyWeakMap((trs: TransactionSubjectiveModel) => {
  const blob: { [key: string]: ["SHA256", string, Uint8Array] } = {};
  const blob_sha256_prefix = BLOB_IN_TRS_REMARK_PREFIX.SHA256;
  for (const key in trs.remark) {
    const value = trs.remark[key];
    if (value.startsWith(blob_sha256_prefix)) {
      const sha256_hex = value.slice(blob_sha256_prefix.length);
      try {
        const sha256 = decodeHex(sha256_hex);
        if (sha256.length === 32) {
          blob[key] = ["SHA256", sha256_hex, sha256];
        }
      } catch {}
    }
  }
  return new StringKeyMap(blob);
});

export const enum BLOB_IN_TRS_REMARK_PREFIX {
  SHA256 = "blob+sha256+hex://",
}

// 不放在前面模型找不到
@Type.d("TransactionBaseStorageModel")
export class TransactionBaseStorageModel
  extends Message<TransactionBaseStorageModel>
  implements
    BFChainCore.TransactionStorageJSON,
    BFChainUtil.JSONAble<BFChainCore.TransactionStorageJSON>
{
  static INC = 1;
  /// 'username'
  @Field.d(TransactionBaseStorageModel.INC++, "string")
  key!: string;
  @Field.d(TransactionBaseStorageModel.INC++, "string")
  value!: string;
  toJSON() {
    return {
      key: this.key,
      value: this.value,
    };
  }
}
@Type.d("SubEnvironmentParametersModel")
export class SubEnvironmentParametersModel
  extends Message<SubEnvironmentParametersModel>
  implements
    BFChainCore.SubEnvironmentParametersJSON,
    BFChainUtil.JSONAble<BFChainCore.SubEnvironmentParametersJSON>
{
  static INC = 1;

  /**事件的时间戳 */
  @Field.d(SubEnvironmentParametersModel.INC++, "uint32", "optional")
  timestamp!: number;
  /**事件的发起高度 */
  @Field.d(SubEnvironmentParametersModel.INC++, "uint32", "optional")
  applyBlockHeight!: number;
  /**事件的有效区块高度 */
  @Field.d(SubEnvironmentParametersModel.INC++, "uint32", "optional")
  effectiveBlockHeight!: number;
  /**事件的来源 ip */
  @Field.d(SubEnvironmentParametersModel.INC++, "string", "optional")
  sourceIP?: string;

  toJSON() {
    const res: BFChainCore.SubEnvironmentParametersJSON = {};

    this.timestamp !== undefined && (res.timestamp = this.timestamp);
    this.applyBlockHeight !== undefined && (res.applyBlockHeight = this.applyBlockHeight);
    this.effectiveBlockHeight !== undefined &&
      (res.effectiveBlockHeight = this.effectiveBlockHeight);
    this.sourceIP !== undefined && (res.sourceIP = this.sourceIP);

    return res;
  }
}

@Type.d("TransactionSubjectiveModel")
export class TransactionSubjectiveModel<AJ extends object = object>
  extends Message<TransactionSubjectiveModel<AJ>>
  implements
    BFChainCore.SubjectiveParametersJSON,
    BFChainUtil.JSONAble<BFChainCore.SubjectiveParametersJSON>
{
  static INC = 2;

  ASSET_MODEL_TYPE!: BFChainCore.AssetJSONToModelType<AJ>;
  ASSET_JSON_TYPE!: AJ;
  asset!: BFChainCore.AssetJSONToModelType<AJ>;

  /*事件类型 */
  @Field.d(TransactionSubjectiveModel.INC++, "string")
  type!: string;
  /**事件的发起者签名 */
  @Field.d(TransactionSubjectiveModel.INC++, "bytes")
  subIdBuffer!: Uint8Array;
  get subId(): string {
    return getHexFromArrayBuffer(this.subIdBuffer);
  }
  set subId(value: string) {
    this.subIdBuffer = parseHexToArrayBuffer(value);
  }
  /**事件的环境变量 */
  @Field.d(TransactionSubjectiveModel.INC++, SubEnvironmentParametersModel, "required")
  subEnvParams!: SubEnvironmentParametersModel;
  /**事件的发起账户地址 */
  @Field.d(TransactionSubjectiveModel.INC++, "string")
  senderId!: string;
  // get senderId() {
  //   const { accontHelper, Buffer } = this;
  //   return accontHelper.getAddressFromPublicKey(Buffer.from(this.senderPublicKeyBuffer));
  // }
  /**事件的发起账户公钥 */
  @Field.d(TransactionSubjectiveModel.INC++, "bytes")
  senderPublicKeyBuffer!: Uint8Array;
  public get senderPublicKey(): string {
    return getHexFromArrayBuffer(this.senderPublicKeyBuffer);
  }
  public set senderPublicKey(value: string) {
    this.senderPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  /**事件的发起账户公钥 */
  @Field.d(TransactionSubjectiveModel.INC++, "bytes", "optional")
  senderSecondPublicKeyBuffer?: Uint8Array;
  public get senderSecondPublicKey() {
    return (
      (this.senderSecondPublicKeyBuffer &&
        getHexFromArrayBuffer(this.senderSecondPublicKeyBuffer)) ||
      undefined
    );
  }
  public set senderSecondPublicKey(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.senderSecondPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  /**事件的接收账户地址 */
  @Field.d(TransactionSubjectiveModel.INC++, "string", "optional")
  recipientId?: string;
  /**事件的最大手续费 */
  @Field.d(TransactionSubjectiveModel.INC++, "string")
  maxFee!: string;
  /**事件的接收类型 */
  @Field.d(TransactionSubjectiveModel.INC++, "uint32")
  rangeType!: RANGE_TYPE;
  /**事件的接收账户地址 */
  @Field.d(TransactionSubjectiveModel.INC++, "string", "repeated")
  range!: string[];
  /**事件所属的 dapp id */
  @Field.d(TransactionSubjectiveModel.INC++, "string", "optional")
  dappid?: string;
  /**事件所属的 域 */
  @Field.d(TransactionSubjectiveModel.INC++, "string", "optional")
  lns?: string;
  /**事件的来源 ip */
  @Field.d(TransactionSubjectiveModel.INC++, "string", "optional")
  sourceIP?: string;
  /**事件来源链的网络标识符 */
  @Field.d(TransactionSubjectiveModel.INC++, "string")
  fromMagic!: string;
  /**事件去往链的网络标识符 */
  @Field.d(TransactionSubjectiveModel.INC++, "string")
  toMagic!: string;

  /**查询用的索引存储 */
  @Field.d(TransactionSubjectiveModel.INC++, TransactionBaseStorageModel, "optional")
  storage?: TransactionBaseStorageModel;
  get storageKey() {
    return this.storage && this.storage.key;
  }
  get storageValue() {
    return this.storage && this.storage.value;
  }
  /**事件的备注信息 */
  @MapField.d(TransactionSubjectiveModel.INC++, "string", "string")
  remark!: { [key: string]: string };
  get remarkMap() {
    // 直接 return TrsRemarkMapWM.forceGet(this) 类型识别错误
    const remarkMap = TrsRemarkMapWM.forceGet(this);
    return remarkMap;
  }
  get blobMap() {
    const blobMap = blobMapWM.forceGet(this);
    return blobMap;
  }
  /* liveMap: 实时推流: live+id+hex:// */

  static subFields = new Set<number | string | symbol>([
    "subEnvParams",
    "type",
    "senderId",
    "senderPublicKeyBuffer",
    "senderSecondPublicKeyBuffer",
    "recipientId",
    "maxFee",
    "rangeType",
    "range",
    "dappid",
    "lns",
    "fromMagic",
    "toMagic",
    "remark",
    "asset",
    "storage",
  ]);

  @cacheBytesGetter
  getSubBytes() {
    // proxy 无法代理冻结对象
    const subjectiveWrapper = new Proxy(Object.create(this), {
      get(t, p, r) {
        if (TransactionSubjectiveModel.subFields.has(p)) {
          return Reflect.get(t, p, r);
        }
      },
    });

    return this.$type.encode(subjectiveWrapper).finish();
  }

  toJSON() {
    const res: BFChainCore.SubjectiveParametersJSON<AJ> = {
      subId: this.subId,
      subEnvParams: this.subEnvParams.toJSON(),
      type: this.type,
      senderId: this.senderId,
      senderPublicKey: this.senderPublicKey,
      maxFee: this.maxFee,
      rangeType: this.rangeType,
      range: this.range,
      fromMagic: this.fromMagic,
      toMagic: this.toMagic,
      remark: this.remark,
      asset: this.asset.toJSON() as AJ,
    };

    this.recipientId && (res.recipientId = this.recipientId);
    this.dappid && (res.dappid = this.dappid);
    this.lns && (res.lns = this.lns);
    this.senderSecondPublicKey && (res.senderSecondPublicKey = this.senderSecondPublicKey);
    this.storageKey && (res.storageKey = this.storageKey);
    this.storageValue && (res.storageValue = this.storageValue);

    return res;
  }

  static fromObject<M extends Message>(
    this: BFChainProtobuf.Constructor<M>,
    object: BFChainProtobuf.ObjectFromType<
      BFChainCore.SubjectiveParametersJSON<BFChainCore.GetMessageAssetModel<M>>
    >,
  ) {
    const res = super.fromObject(object as any) as TransactionSubjectiveModel;
    if (res !== (object as unknown)) {
      object.subId && (res.subId = object.subId);

      object.senderPublicKey && (res.senderPublicKey = object.senderPublicKey);
      object.senderSecondPublicKey && (res.senderSecondPublicKey = object.senderSecondPublicKey);

      if (
        !res.storage &&
        typeof object.storageKey === "string" &&
        typeof object.storageValue === "string"
      ) {
        res.storage = new TransactionBaseStorageModel({
          key: object.storageKey,
          value: object.storageValue,
        });
      }
    }
    return res as unknown as M;
  }
}

@Type.d("Transaction")
export class Transaction<AJ extends object = object>
  extends TransactionSubjectiveModel<AJ>
  implements BFChainCore.TransactionJSON<AJ>
{
  /*事件类型 */
  @Field.d(1, "uint32")
  version!: number;
  /**事件的手续费 */
  @Field.d(Transaction.INC++, "string")
  fee!: string;

  /**事件的时间戳 */
  @Field.d(Transaction.INC++, "uint32")
  timestamp!: number;
  /**事件的发起高度 */
  @Field.d(Transaction.INC++, "uint32")
  applyBlockHeight!: number;
  /**事件的有效区块高度 */
  @Field.d(Transaction.INC++, "uint32")
  effectiveBlockHeight!: number;
  /**事件POW的随机数
   * 放在`signature`的前面，方便同时修改二者 */
  @Field.d(Transaction.INC++, "fixed32", "required")
  nonce!: number;

  /**事件的发起者签名 */
  @Field.d(Transaction.INC++, "bytes")
  signatureBuffer!: Uint8Array;
  get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }
  get trsId() {
    return this.signature;
  }
  get trsIdBuffer() {
    return this.signatureBuffer;
  }
  /**事件的发起者二次签名 */
  @Field.d(TransactionSubjectiveModel.INC++, "bytes", "optional")
  signSignatureBuffer?: Uint8Array;
  get signSignature() {
    return (
      (this.signSignatureBuffer && getHexFromArrayBuffer(this.signSignatureBuffer)) || undefined
    );
  }
  set signSignature(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.signSignatureBuffer = parseHexToArrayBuffer(value);
  }

  @cacheBytesGetter
  getFeeBytes() {
    const props: PropertyDescriptorMap = {};

    const pkBuffer = new Uint8Array(16);
    const signBuffer = new Uint8Array(32);

    const maxUint32 = 2 ** 32 - 1;
    props.applyBlockHeight = { value: maxUint32 };
    props.effectiveBlockHeight = { value: maxUint32 };
    props.timestamp = { value: maxUint32 };

    props.senderPublicKeyBuffer = { value: pkBuffer };
    props.senderSecondPublicKeyBuffer = { value: pkBuffer };
    props.signatureBuffer = { value: signBuffer };
    props.signSignatureBuffer = { value: signBuffer };

    props.fee = { value: this.maxFee };
    props.sourceIP = { value: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff" };

    const trsWrapper = Object.create(this, props);
    return this.$type.encode(trsWrapper).finish();
  }

  @cacheBytesGetter
  getBytes(skipSignature?: boolean, skipSignSignature?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      props.signatureBuffer = { value: null };
    }
    if (skipSignSignature) {
      props.signSignatureBuffer = { value: null };
    }
    const trsWrapper = Object.create(this, props);
    return this.$type.encode(trsWrapper).finish();
  }

  toJSON() {
    const res: BFChainCore.TransactionJSON<AJ> = {
      version: this.version,

      subId: this.subId,
      subEnvParams: this.subEnvParams.toJSON(),
      type: this.type,
      senderId: this.senderId,
      senderPublicKey: this.senderPublicKey,
      maxFee: this.maxFee,
      rangeType: this.rangeType,
      range: this.range,
      fromMagic: this.fromMagic,
      toMagic: this.toMagic,
      remark: this.remark,
      asset: this.asset.toJSON() as AJ,

      fee: this.fee,
      timestamp: this.timestamp,
      applyBlockHeight: this.applyBlockHeight,
      effectiveBlockHeight: this.effectiveBlockHeight,
      nonce: this.nonce,

      trsId: this.trsId,
      signature: this.signature,
    };

    this.recipientId && (res.recipientId = this.recipientId);
    this.dappid && (res.dappid = this.dappid);
    this.lns && (res.lns = this.lns);
    this.sourceIP && (res.sourceIP = this.sourceIP);
    this.senderSecondPublicKey && (res.senderSecondPublicKey = this.senderSecondPublicKey);
    this.signSignature && (res.signSignature = this.signSignature);
    this.storageKey && (res.storageKey = this.storageKey);
    this.storageValue && (res.storageValue = this.storageValue);

    return res;
  }
  static fromObject<M extends Message>(
    this: BFChainProtobuf.Constructor<M>,
    object: BFChainProtobuf.ObjectFromType<
      BFChainCore.TransactionJSON<BFChainCore.GetMessageAssetModel<M>>
    >,
  ) {
    const res = super.fromObject(object as any) as Transaction;
    if (res !== (object as unknown)) {
      object.signature && (res.signature = object.signature);
      object.signSignature && (res.signSignature = object.signSignature);
    }
    return res as unknown as M;
  }
}
