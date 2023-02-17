import type { RANGE_TYPE } from "@bfchain/core-model-constants";
import { Message, Type, Field, MapField } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { StringKeyMap } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { EasyWeakMap } from "@bfchain/util-extends-map";
import { decodeHex } from "@bfchain/util-encoding-hex";
const TrsRemarkMapWM = new EasyWeakMap((trs: Transaction) => new StringKeyMap(trs.remark));
const blobMapWM = new EasyWeakMap((trs: Transaction) => {
  const blob: { [key: string]: ["SHA256", string, Uint8Array, number] } = {};
  const blob_sha256_prefix = BLOB_IN_TRS_REMARK_PREFIX.SHA256;
  for (const key in trs.remark) {
    const value = trs.remark[key];
    if (value.startsWith(blob_sha256_prefix)) {
      const items = value.slice(blob_sha256_prefix.length).split("?");
      if (items.length !== 2) {
        continue;
      }
      try {
        const sha256 = decodeHex(items[0]);
        if (sha256.length === 32) {
          const subItems = items[1].split("=");
          if (subItems.length !== 2) {
            continue;
          }
          if (subItems[0] !== "size") {
            continue;
          }
          const value = Number(items[1]);
          // 不是正整数
          if (!(Number.isInteger(value) && value > 0)) {
            continue;
          }
          blob[key] = ["SHA256", items[0], sha256, value];
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
@Type.d("Transaction")
export class Transaction<AJ extends object = object>
  extends Message<Transaction<AJ>>
  implements BFChainCore.TransactionJSON<AJ>
{
  static INC = 1;
  ASSET_MODEL_TYPE!: BFChainCore.AssetJSONToModelType<AJ>;
  ASSET_JSON_TYPE!: AJ;
  asset!: BFChainCore.AssetJSONToModelType<AJ>;
  /*交易类型 */
  @Field.d(Transaction.INC++, "uint32")
  version!: number;
  /*交易类型 */
  @Field.d(Transaction.INC++, "string")
  type!: string;
  /**交易的发起账户地址 */
  @Field.d(Transaction.INC++, "string")
  senderId!: string;
  // get senderId() {
  //   const { accontHelper, Buffer } = this;
  //   return accontHelper.getAddressFromPublicKey(Buffer.from(this.senderPublicKeyBuffer));
  // }
  /**交易的发起账户公钥 */
  @Field.d(Transaction.INC++, "bytes")
  senderPublicKeyBuffer!: Uint8Array;
  public get senderPublicKey(): string {
    return getHexFromArrayBuffer(this.senderPublicKeyBuffer);
  }
  public set senderPublicKey(value: string) {
    this.senderPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  /**交易的发起账户公钥 */
  @Field.d(Transaction.INC++, "bytes", "optional")
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
  /**交易的接收账户地址 */
  @Field.d(Transaction.INC++, "string", "optional")
  recipientId?: string;
  /**交易的接收类型 */
  @Field.d(Transaction.INC++, "uint32")
  rangeType!: RANGE_TYPE;
  /**交易的接收账户地址 */
  @Field.d(Transaction.INC++, "string", "repeated")
  range!: string[];
  /**交易的手续费 */
  @Field.d(Transaction.INC++, "string")
  fee!: string;
  /**交易的时间戳 */
  @Field.d(Transaction.INC++, "uint32")
  timestamp!: number;
  /**交易所属的 dapp id */
  @Field.d(Transaction.INC++, "string", "optional")
  dappid?: string;
  /**交易所属的 域 */
  @Field.d(Transaction.INC++, "string", "optional")
  lns?: string;
  /**交易的来源 ip */
  @Field.d(Transaction.INC++, "string", "optional")
  sourceIP?: string;
  /**交易来源链的网络标识符 */
  @Field.d(Transaction.INC++, "string")
  fromMagic!: string;
  /**交易去往链的网络标识符 */
  @Field.d(Transaction.INC++, "string")
  toMagic!: string;
  /**交易的发起高度 */
  @Field.d(Transaction.INC++, "uint32")
  applyBlockHeight!: number;
  /**交易的有效区块高度 */
  @Field.d(Transaction.INC++, "uint32")
  effectiveBlockHeight!: number;
  /**交易POW的随机数
   * 放在`signature`的前面，方便同时修改二者 */
  @Field.d(Transaction.INC++, "fixed32", "required")
  nonce!: number;
  /**交易的发起者签名 */
  @Field.d(Transaction.INC++, "bytes")
  signatureBuffer!: Uint8Array;
  get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }

  /**查询用的索引存储 */
  @Field.d(Transaction.INC++, TransactionBaseStorageModel, "optional")
  storage?: TransactionBaseStorageModel;
  get storageKey() {
    return this.storage && this.storage.key;
  }
  get storageValue() {
    return this.storage && this.storage.value;
  }

  /**交易的发起者二次签名 */
  @Field.d(Transaction.INC++, "bytes", "optional")
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
  /**交易的备注信息 */
  @MapField.d(Transaction.INC++, "string", "string")
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
  get blobSize() {
    let totalSize = 0;
    const blobMap = this.blobMap.values();
    for (const items of blobMap) {
      totalSize += items[3];
    }
    return totalSize;
  }
  /* liveMap: 实时推流: live+id+hex:// */

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
      type: this.type,
      senderId: this.senderId,
      senderPublicKey: this.senderPublicKey,
      rangeType: this.rangeType,
      range: this.range,
      fee: this.fee,
      timestamp: this.timestamp,
      fromMagic: this.fromMagic,
      toMagic: this.toMagic,
      applyBlockHeight: this.applyBlockHeight,
      effectiveBlockHeight: this.effectiveBlockHeight,
      signature: this.signature,
      remark: this.remark,
      asset: this.asset.toJSON() as AJ,
      nonce: this.nonce,
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
      object.senderPublicKey && (res.senderPublicKey = object.senderPublicKey);
      object.senderSecondPublicKey && (res.senderSecondPublicKey = object.senderSecondPublicKey);
      object.signature && (res.signature = object.signature);
      object.signSignature && (res.signSignature = object.signSignature);
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
