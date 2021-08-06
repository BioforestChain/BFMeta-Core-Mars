import { Message, Field, Type } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { ToExchangeSpecialAssetModel } from "./toExchangeSpecialAsset";
import { AccountSignatureModel } from "@bfchain/core-model-common";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * exchangeSpecialAsset 交易 asset 模型
 *
 */
@Type.d("BeExchangeSpecialAssetModel")
export class BeExchangeSpecialAssetModel
  extends Message<BeExchangeSpecialAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeSpecialAssetJSON>
{
  static INC = 1;
  /**要兑换的交易签名 */
  @Field.d(BeExchangeSpecialAssetModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }

  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(BeExchangeSpecialAssetModel.INC++, "bytes", "optional")
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

  /**交换的配置信息 */
  @Field.d(BeExchangeSpecialAssetModel.INC++, ToExchangeSpecialAssetModel)
  exchangeSpecialAsset!: ToExchangeSpecialAssetModel;

  toJSON() {
    const res: BFChainCore.BeExchangeSpecialAssetJSON = {
      transactionSignature: this.transactionSignature,
      exchangeSpecialAsset: this.exchangeSpecialAsset.toJSON(),
    };

    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BeExchangeSpecialAssetModel>,
  ) {
    const res = super.fromObject(object) as BeExchangeSpecialAssetModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return res as unknown as T;
  }
}

/**
 * exchangeSpecialAsset 交易 asset 外层模型
 *
 */
@Type.d("BeExchangeSpecialAssetAssetModel")
export class BeExchangeSpecialAssetAssetModel
  extends Message<BeExchangeSpecialAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeSpecialAssetAssetJSON>
{
  @Field.d(1, BeExchangeSpecialAssetModel)
  beExchangeSpecialAsset!: BeExchangeSpecialAssetModel;
  toJSON() {
    return {
      beExchangeSpecialAsset: this.beExchangeSpecialAsset.toJSON(),
    };
  }
}
