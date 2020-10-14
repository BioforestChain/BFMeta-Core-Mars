import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { TrustAssetModel } from "./trustAsset";
import { AccountSignatureModel } from "./accountSignature";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

/**缓存thirdSignatureList解析结果 */
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * signForAsset 交易 asset 模型
 *
 */
@Type.d("SignForAssetModel")
export class SignForAssetModel extends Message<SignForAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SignForAssetJSON> {
  static INC = 1;
  /**要签收的委托交易的签名 */
  @Field.d(SignForAssetModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }
  /**第三方账户签名 */
  @Field.d(SignForAssetModel.INC++, "bytes")
  thirdPartySignatureBuffer!: Uint8Array;
  public get thirdPartySignature() {
    const { thirdPartySignatureBuffer } = this;
    const signature = AccountSignatureModel.decode(thirdPartySignatureBuffer);
    SIGNATURE_BUFFER_WM.set(signature, thirdPartySignatureBuffer);
    return signature;
  }
  public set thirdPartySignature(signature: AccountSignatureModel) {
    let buf = SIGNATURE_BUFFER_WM.get(signature);
    if (!buf) {
      buf = AccountSignatureModel.encode(signature).finish();
      SIGNATURE_BUFFER_WM.set(signature, buf);
    }
    this.thirdPartySignatureBuffer = buf;
  }

  /**委托交易的发起账户地址 */
  @Field.d(SignForAssetModel.INC++, "string")
  trustSenderId!: string;
  /**委托交易的接收账户地址 */
  @Field.d(SignForAssetModel.INC++, "string")
  trustRecipientId!: string;
  /**红包的配置信息 */
  @Field.d(SignForAssetModel.INC++, TrustAssetModel)
  trustAsset!: TrustAssetModel;
  @cacheBytesGetter
  getBytes() {
    const props: PropertyDescriptorMap = {
      signatureBufferList: { value: null },
    };
    const assetWrapper = Object.create(this, props);
    return this.$type.encode(assetWrapper).finish();
  }
  toJSON() {
    const res: BFChainCore.SignForAssetJSON = {
      transactionSignature: this.transactionSignature,
      trustSenderId: this.trustSenderId,
      trustRecipientId: this.trustRecipientId,
      thirdPartySignature: this.thirdPartySignature.toJSON(),
      trustAsset: this.trustAsset.toJSON(),
    };
    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<SignForAssetModel>,
  ) {
    const res = super.fromObject(object) as SignForAssetModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.thirdPartySignature &&
        (res.thirdPartySignature = AccountSignatureModel.fromObject(object.thirdPartySignature));
    }
    return (res as unknown) as T;
  }
}

/**
 * signForAsset 交易 asset 外层模型
 *
 */
@Type.d("SignForAssetAssetModel")
export class SignForAssetAssetModel extends Message<SignForAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SignForAssetAssetJSON> {
  @Field.d(1, SignForAssetModel)
  signForAsset!: SignForAssetModel;
  toJSON() {
    return {
      signForAsset: this.signForAsset.toJSON(),
    };
  }
}
