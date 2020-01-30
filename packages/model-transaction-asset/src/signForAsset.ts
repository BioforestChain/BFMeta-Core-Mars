import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { TrustAssetModel } from "./trustAsset";
import { AccountSignatureModel } from "./accountSignature";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

/**缓存thirdSignatureList解析结果 */
const BUFFER_LIST_SIGNATURE_LIST_WM = new WeakMap<Uint8Array[], AccountSignatureModel[]>();
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
  @Field.d(SignForAssetModel.INC++, "bytes", "repeated")
  signatureBufferList!: Uint8Array[];
  public get thirdPartySignatures() {
    const { signatureBufferList } = this;
    let signatureList = BUFFER_LIST_SIGNATURE_LIST_WM.get(signatureBufferList);
    if (!signatureList) {
      signatureList = this.signatureBufferList.map(buf => {
        const signature = AccountSignatureModel.decode(buf);
        SIGNATURE_BUFFER_WM.set(signature, buf);
        return signature;
      });
    }
    return signatureList;
  }
  public set thirdPartySignatures(signatureList: AccountSignatureModel[]) {
    const bufList = signatureList.map(signature => {
      let buf = SIGNATURE_BUFFER_WM.get(signature);
      if (!buf) {
        buf = AccountSignatureModel.encode(signature).finish();
        SIGNATURE_BUFFER_WM.set(signature, buf);
      }
      return buf;
    });
    BUFFER_LIST_SIGNATURE_LIST_WM.set(bufList, signatureList);
    this.signatureBufferList = bufList;
  }

  /**委托交易的发起账户地址 */
  @Field.d(SignForAssetModel.INC++, "string")
  trustSenderId!: string;
  /**委托交易的接收账户地址 */
  @Field.d(SignForAssetModel.INC++, "string")
  trustRecipientId!: string;
  /**交易有效签名数 */
  @Field.d(SignForAssetModel.INC++, "uint32")
  trustNumberOfSignFor!: number;
  /**委托交易发起高度 */
  @Field.d(SignForAssetModel.INC++, "uint32")
  applyBlockHeight!: number;
  // /**委托交易允许被签收的区块高度 */
  // @Field.d(SignForAssetModel.INC++, "uint32", "optional")
  // numberOfBeginUnfrozenBlocks?: number;
  /**委托交易的有效区块高度 */
  @Field.d(SignForAssetModel.INC++, "uint32")
  numberOfEffectiveBlocks!: number;
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
      thirdPartySignatures: this.thirdPartySignatures.map(thirdPartySignature =>
        thirdPartySignature.toJSON(),
      ),
      trustSenderId: this.trustSenderId,
      trustRecipientId: this.trustRecipientId,
      trustNumberOfSignFor: this.trustNumberOfSignFor,
      applyBlockHeight: this.applyBlockHeight,
      numberOfEffectiveBlocks: this.numberOfEffectiveBlocks,
      trustAsset: this.trustAsset.toJSON(),
    };
    // this.numberOfBeginUnfrozenBlocks &&
    //   (res.numberOfBeginUnfrozenBlocks = this.numberOfBeginUnfrozenBlocks);
    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<SignForAssetModel>,
  ) {
    const res = super.fromObject(object) as SignForAssetModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      const results: AccountSignatureModel[] = [];
      if (object.thirdPartySignatures) {
        const thirdPartySignatures = object.thirdPartySignatures;
        for (const thirdPartySignature of thirdPartySignatures) {
          results[results.length] = AccountSignatureModel.fromObject(thirdPartySignature);
        }
      }
      res.thirdPartySignatures = results;
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
