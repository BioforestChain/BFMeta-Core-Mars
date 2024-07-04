import { Message, Field, Type } from "@bfchain/protobuf";
import { AccountSignatureModel } from "@bfchain/core-model-common";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { BeExchangeAssetV1Model, ToExchangeAssetV1Model } from "./toExchangeAnyMulti";

const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * beExchangeAny 交易 asset 模型
 *
 */
@Type.d("BeExchangeAnyMultiModel")
export class BeExchangeAnyMultiModel
  extends Message<BeExchangeAnyMultiModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAnyMultiJSON>
{
  static INC = 1;
  /**要兑换的交易签名 */
  @Field.d(BeExchangeAnyMultiModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }

  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(BeExchangeAnyMultiModel.INC++, "bytes", "optional")
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

  // /**希望交换得到的资产数量 */
  // @Field.d(BeExchangeAnyMultiModel.INC++, "string")
  // toExchangeAssetPrealnum!: string;
  // /**用于交换的资产数量 */
  // @Field.d(BeExchangeAnyMultiModel.INC++, "string")
  // beExchangeAssetPrealnum!: string;

  /**交换的配置信息 */
  @Field.d(BeExchangeAnyMultiModel.INC++, ToExchangeAssetV1Model, "repeated")
  toExchangeAssets!: ToExchangeAssetV1Model[];
  /**收税信息 */
  @Field.d(BeExchangeAnyMultiModel.INC++, BeExchangeAssetV1Model)
  beExchangeAsset!: BeExchangeAssetV1Model;
  /**有效区块数 */
  @Field.d(BeExchangeAnyMultiModel.INC++, "uint32", "optional")
  numberOfEffectiveBlocks?: number;

  toJSON() {
    const res: BFChainCore.BeExchangeAnyMultiJSON = {
      transactionSignature: this.transactionSignature,
      toExchangeAssets: this.toExchangeAssets.map((item) => item.toJSON()),
      beExchangeAsset: this.beExchangeAsset.toJSON(),
    };

    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());
    this.numberOfEffectiveBlocks !== undefined &&
      (res.numberOfEffectiveBlocks = this.numberOfEffectiveBlocks);

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BeExchangeAnyMultiModel>,
  ) {
    const res = super.fromObject(object) as BeExchangeAnyMultiModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return res as unknown as T;
  }
}

/**
 * beExchangeAnyMulti 交易 asset 外层模型
 *
 */
@Type.d("BeExchangeAnyMultiAssetModel")
export class BeExchangeAnyMultiAssetModel
  extends Message<BeExchangeAnyMultiAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAnyMultiAssetJSON>
{
  @Field.d(1, BeExchangeAnyMultiModel)
  beExchangeAnyMulti!: BeExchangeAnyMultiModel;
  toJSON() {
    return {
      beExchangeAnyMulti: this.beExchangeAnyMulti.toJSON(),
    };
  }
}
