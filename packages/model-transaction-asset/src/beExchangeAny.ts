import { Message, Field, Type } from "@bfchain/protobuf";
import { AccountSignatureModel, TaxInformationModel } from "@bfchain/core-model-common";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { ToExchangeAnyModel } from "./toExchangeAny";

const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * beExchangeAny 交易 asset 模型
 *
 */
@Type.d("BeExchangeAnyModel")
export class BeExchangeAnyModel
  extends Message<BeExchangeAnyModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAnyJSON>
{
  static INC = 1;
  /**要兑换的交易签名 */
  @Field.d(BeExchangeAnyModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }

  /**用于校验身份的密文签名，如果需要的话 */
  @Field.d(BeExchangeAnyModel.INC++, "bytes", "optional")
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
  @Field.d(BeExchangeAnyModel.INC++, "string")
  toExchangeAssetPrealnum!: string;
  /**用于交换的资产数量 */
  @Field.d(BeExchangeAnyModel.INC++, "string")
  beExchangeAssetPrealnum!: string;

  /**交换的配置信息 */
  @Field.d(BeExchangeAnyModel.INC++, ToExchangeAnyModel)
  exchangeAny!: ToExchangeAnyModel;

  /**收税信息 */
  @Field.d(ToExchangeAnyModel.INC++, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;

  toJSON() {
    const res: BFChainCore.BeExchangeAnyJSON = {
      transactionSignature: this.transactionSignature,
      toExchangeAssetPrealnum: this.toExchangeAssetPrealnum,
      beExchangeAssetPrealnum: this.beExchangeAssetPrealnum,
      exchangeAny: this.exchangeAny.toJSON(),
    };

    this.ciphertextSignature && (res.ciphertextSignature = this.ciphertextSignature.toJSON());
    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BeExchangeAnyModel>,
  ) {
    const res = super.fromObject(object) as BeExchangeAnyModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
      object.ciphertextSignature &&
        (res.ciphertextSignature = AccountSignatureModel.fromObject(object.ciphertextSignature));
    }
    return res as unknown as T;
  }
}

/**
 * beExchangeAny 交易 asset 外层模型
 *
 */
@Type.d("BeExchangeAnyAssetModel")
export class BeExchangeAnyAssetModel
  extends Message<BeExchangeAnyAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAnyAssetJSON>
{
  @Field.d(1, BeExchangeAnyModel)
  beExchangeAny!: BeExchangeAnyModel;
  toJSON() {
    return {
      beExchangeAny: this.beExchangeAny.toJSON(),
    };
  }
}
