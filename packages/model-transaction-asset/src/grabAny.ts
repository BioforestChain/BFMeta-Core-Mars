import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { GiftAnyModel } from "./giftAny";
import { AccountSignatureModel } from "@bfchain/core-model-common";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * grabAny 交易 asset 模型
 *
 */
@Type.d("GrabAnyModel")
export class GrabAnyModel
  extends Message<GrabAnyModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAnyJSON>
{
  static INC = 1;
  /**赠送交易所在的区块 id */
  @Field.d(GrabAnyModel.INC++, "bytes")
  blockIdBuffer!: Uint8Array;
  public get blockId(): string {
    return getHexFromArrayBuffer(this.blockIdBuffer);
  }
  public set blockId(value: string) {
    this.blockIdBuffer = parseHexToArrayBuffer(value);
  }
  /**要抢的红包交易的签名 */
  @Field.d(GrabAnyModel.INC++, "bytes")
  transactionSubIdBuffer!: Uint8Array;
  public get transactionSubId(): string {
    return getHexFromArrayBuffer(this.transactionSubIdBuffer);
  }
  public set transactionSubId(value: string) {
    this.transactionSubIdBuffer = parseHexToArrayBuffer(value);
  }
  /**抢到的资产数量 */
  @Field.d(GrabAnyModel.INC++, "string")
  amount!: string;
  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(GrabAnyModel.INC++, "bytes", "optional")
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
  @Field.d(GrabAnyModel.INC++, GiftAnyModel)
  giftAny!: GiftAnyModel;
  toJSON() {
    const res: BFChainCore.GrabAnyJSON = {
      blockId: this.blockId,
      transactionSubId: this.transactionSubId,
      amount: this.amount,
      giftAny: this.giftAny.toJSON(),
    };
    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<GrabAnyModel>,
  ) {
    const res = super.fromObject(object) as GrabAnyModel;
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
 * grabAny 交易 asset 外层模型
 *
 */
@Type.d("GrabAnyAssetModel")
export class GrabAnyAssetModel
  extends Message<GrabAnyAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAnyAssetJSON>
{
  @Field.d(1, GrabAnyModel)
  grabAny!: GrabAnyModel;
  toJSON() {
    return {
      grabAny: this.grabAny.toJSON(),
    };
  }
}
