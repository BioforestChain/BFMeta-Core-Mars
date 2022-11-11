import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { GiftAssetModel } from "./giftAsset";
import { AccountSignatureModel } from "@bfchain/core-model-common";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * grabAsset 交易 asset 模型
 *
 */
@Type.d("GrabAssetModel")
export class GrabAssetModel
  extends Message<GrabAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetJSON>
{
  static INC = 1;
  /**赠送交易所在的区块 id */
  @Field.d(GrabAssetModel.INC++, "bytes")
  blockIdBuffer!: Uint8Array;
  public get blockId(): string {
    return getHexFromArrayBuffer(this.blockIdBuffer);
  }
  public set blockId(value: string) {
    this.blockIdBuffer = parseHexToArrayBuffer(value);
  }
  /**要抢的红包事件的唯一标识 */
  @Field.d(GrabAssetModel.INC++, "bytes")
  transactionSubIdBuffer!: Uint8Array;
  public get transactionSubId(): string {
    return getHexFromArrayBuffer(this.transactionSubIdBuffer);
  }
  public set transactionSubId(value: string) {
    this.transactionSubIdBuffer = parseHexToArrayBuffer(value);
  }
  /**抢到的资产数量 */
  @Field.d(GrabAssetModel.INC++, "string")
  amount!: string;
  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(GrabAssetModel.INC++, "bytes", "optional")
  ciphertextSignatureBuffer?: Uint8Array;
  get ciphertextSignature() {
    const { ciphertextSignatureBuffer } = this;
    if (!ciphertextSignatureBuffer) {
      return undefined;
    }
    const signature = AccountSignatureModel.decode(ciphertextSignatureBuffer);
    SIGNATURE_BUFFER_WM.set(signature, ciphertextSignatureBuffer);
    return signature;
  }
  set ciphertextSignature(signature: AccountSignatureModel | undefined) {
    if (signature) {
      let buf = SIGNATURE_BUFFER_WM.get(signature);
      if (!buf) {
        buf = AccountSignatureModel.encode(signature).finish();
        SIGNATURE_BUFFER_WM.set(signature, buf);
      }
      this.ciphertextSignatureBuffer = buf;
    } else {
      this.ciphertextSignatureBuffer = undefined;
    }
  }

  /**红包的配置信息 */
  @Field.d(GrabAssetModel.INC++, GiftAssetModel)
  giftAsset!: GiftAssetModel;
  toJSON() {
    const res: BFChainCore.GrabAssetJSON = {
      blockId: this.blockId,
      transactionSubId: this.transactionSubId,
      amount: this.amount,
      giftAsset: this.giftAsset.toJSON(),
    };
    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<GrabAssetModel>,
  ) {
    const res = super.fromObject(object) as GrabAssetModel;
    if (res !== object) {
      object.blockId && (res.blockId = object.blockId);
      object.transactionSubId && (res.transactionSubId = object.transactionSubId);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return res as unknown as T;
  }
}

/**
 * grabAsset 交易 asset 外层模型
 *
 */
@Type.d("GrabAssetAssetModel")
export class GrabAssetAssetModel
  extends Message<GrabAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetAssetJSON>
{
  @Field.d(1, GrabAssetModel)
  grabAsset!: GrabAssetModel;
  toJSON() {
    return {
      grabAsset: this.grabAsset.toJSON(),
    };
  }
}
