import { Message, Field, Type } from "@bfchain/protobuf";
import { AccountSignatureModel } from "@bfchain/core-model-common";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { BeExchangeAssetV2Model, ToExchangeAssetV2Model } from "./toExchangeAnyMultiAll";

const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * beExchangeAnyMultiAll 交易 asset 模型
 *
 */
@Type.d("BeExchangeAnyMultiAllModel")
export class BeExchangeAnyMultiAllModel
  extends Message<BeExchangeAnyMultiAllModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAnyMultiAllJSON>
{
  static INC = 1;
  /**要兑换的交易签名 */
  @Field.d(BeExchangeAnyMultiAllModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }

  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(BeExchangeAnyMultiAllModel.INC++, "bytes", "optional")
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
  @Field.d(BeExchangeAnyMultiAllModel.INC++, ToExchangeAssetV2Model, "repeated")
  toExchangeAssets!: ToExchangeAssetV2Model[];
  /**收税信息 */
  @Field.d(BeExchangeAnyMultiAllModel.INC++, BeExchangeAssetV2Model, "repeated")
  beExchangeAssets!: BeExchangeAssetV2Model[];

  toJSON() {
    const res: BFChainCore.BeExchangeAnyMultiAllJSON = {
      transactionSignature: this.transactionSignature,
      toExchangeAssets: this.toExchangeAssets.map((item) => item.toJSON()),
      beExchangeAssets: this.beExchangeAssets.map((item) => item.toJSON()),
    };

    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BeExchangeAnyMultiAllModel>,
  ) {
    const res = super.fromObject(object) as BeExchangeAnyMultiAllModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return res as unknown as T;
  }
}

/**
 * beExchangeAnyMultiAll 交易 asset 外层模型
 *
 */
@Type.d("BeExchangeAnyMultiAllAssetModel")
export class BeExchangeAnyMultiAllAssetModel
  extends Message<BeExchangeAnyMultiAllAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAnyMultiAllAssetJSON>
{
  @Field.d(1, BeExchangeAnyMultiAllModel)
  beExchangeAnyMultiAll!: BeExchangeAnyMultiAllModel;
  toJSON() {
    return {
      beExchangeAnyMultiAll: this.beExchangeAnyMultiAll.toJSON(),
    };
  }
}
