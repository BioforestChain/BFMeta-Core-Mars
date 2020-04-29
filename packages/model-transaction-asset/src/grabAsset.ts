import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { GiftAssetModel } from "./giftAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * grabAsset 交易 asset 模型
 *
 */
@Type.d("GrabAssetModel")
export class GrabAssetModel extends Message<GrabAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetJSON> {
  static INC = 1;
  /**赠送交易所在的区块签名 */
  @Field.d(GrabAssetModel.INC++, "bytes")
  blockSignatureBuffer!: Uint8Array;
  public get blockSignature(): string {
    return getHexFromArrayBuffer(this.blockSignatureBuffer);
  }
  public set blockSignature(value: string) {
    this.blockSignatureBuffer = parseHexToArrayBuffer(value);
  }
  /**要抢的红包交易的签名 */
  @Field.d(GrabAssetModel.INC++, "bytes")
  giftTransactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.giftTransactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.giftTransactionSignatureBuffer = parseHexToArrayBuffer(value);
  }
  /**抢到的资产数量 */
  @Field.d(GrabAssetModel.INC++, "string")
  amount!: string;
  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(GrabAssetModel.INC++, "bytes", "optional")
  ciphertextSignatureBuffer!: Uint8Array;
  get ciphertextSignature() {
    const { ciphertextSignatureBuffer } = this;
    const signature = AccountSignatureModel.decode(ciphertextSignatureBuffer);
    SIGNATURE_BUFFER_WM.set(signature, ciphertextSignatureBuffer);
    return signature;
  }
  set ciphertextSignature(signature: AccountSignatureModel) {
    let buf = SIGNATURE_BUFFER_WM.get(signature);
    if (!buf) {
      buf = AccountSignatureModel.encode(signature).finish();
      SIGNATURE_BUFFER_WM.set(signature, buf);
    }
    this.ciphertextSignatureBuffer = buf;
  }

  /**红包的配置信息 */
  @Field.d(GrabAssetModel.INC++, GiftAssetModel)
  giftAsset!: GiftAssetModel;
  toJSON() {
    const res: BFChainCore.GrabAssetJSON = {
      blockSignature: this.blockSignature,
      transactionSignature: this.transactionSignature,
      amount: this.amount,
      giftAsset: this.giftAsset.toJSON(),
    };
    this.ciphertextSignatureBuffer && (res.ciphertextSignature = this.ciphertextSignature.toJSON());

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<GrabAssetModel>,
  ) {
    const res = super.fromObject(object) as GrabAssetModel;
    if (res !== object) {
      object.blockSignature && (res.blockSignature = object.blockSignature);
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return (res as unknown) as T;
  }
}

/**
 * grabAsset 交易 asset 外层模型
 *
 */
@Type.d("GrabAssetAssetModel")
export class GrabAssetAssetModel extends Message<GrabAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetAssetJSON> {
  @Field.d(1, GrabAssetModel)
  grabAsset!: GrabAssetModel;
  toJSON() {
    return {
      grabAsset: this.grabAsset.toJSON(),
    };
  }
}
