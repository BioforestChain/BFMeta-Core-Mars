import { Message, Field, Type } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { cacheGetter } from "@bfchain/util-decorator";
import { ToExchangeAssetModel } from "./toExchangeAsset";
import { AccountSignatureModel } from "@bfchain/core-model-common";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * exchangeAsset 交易 asset 模型
 *
 */
@Type.d("BeExchangeAssetModel")
export class BeExchangeAssetModel
  extends Message<BeExchangeAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAssetJSON>
{
  static INC = 1;
  /**要兑换的交易签名 */
  @Field.d(BeExchangeAssetModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }

  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(BeExchangeAssetModel.INC++, "bytes", "optional")
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

  /**希望交换得到的资产数量 */
  @Field.d(BeExchangeAssetModel.INC++, "string")
  toExchangeNumber!: string;
  /**用于交换的资产数量 */
  @Field.d(BeExchangeAssetModel.INC++, "string")
  beExchangeNumber!: string;

  /**交换的配置信息 */
  @Field.d(BeExchangeAssetModel.INC++, ToExchangeAssetModel)
  exchangeAsset!: ToExchangeAssetModel;

  @cacheGetter
  get to() {
    return {
      magic: this.exchangeAsset.toExchangeSource,
      chainName: this.exchangeAsset.toExchangeChainName,
      assetType: this.exchangeAsset.toExchangeAsset,
      amount: this.toExchangeNumber,
    };
  }
  get be() {
    return {
      magic: this.exchangeAsset.beExchangeSource,
      chainName: this.exchangeAsset.beExchangeChainName,
      assetType: this.exchangeAsset.beExchangeAsset,
      amount: this.beExchangeNumber,
    };
  }
  get exchangeRate() {
    return this.exchangeAsset.exchangeRate;
  }
  toJSON() {
    const res: BFChainCore.BeExchangeAssetJSON = {
      transactionSignature: this.transactionSignature,
      toExchangeNumber: this.toExchangeNumber,
      beExchangeNumber: this.beExchangeNumber,
      exchangeAsset: this.exchangeAsset.toJSON(),
    };

    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BeExchangeAssetModel>,
  ) {
    const res = super.fromObject(object) as BeExchangeAssetModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return res as unknown as T;
  }
}

/**
 * exchangeAsset 交易 asset 外层模型
 *
 */
@Type.d("BeExchangeAssetAssetModel")
export class BeExchangeAssetAssetModel
  extends Message<BeExchangeAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAssetAssetJSON>
{
  @Field.d(1, BeExchangeAssetModel)
  beExchangeAsset!: BeExchangeAssetModel;
  toJSON() {
    return {
      beExchangeAsset: this.beExchangeAsset.toJSON(),
    };
  }
}
