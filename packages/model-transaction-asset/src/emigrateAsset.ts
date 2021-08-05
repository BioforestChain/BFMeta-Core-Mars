import { Message, Field, Type } from "@bfchain/protobuf";
import { AccountSignatureModel } from "./accountSignature";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * emigrateAsset 交易 asset 模型
 *
 */
@Type.d("EmigrateAssetModel")
export class EmigrateAssetModel
  extends Message<EmigrateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetJSON>
{
  static INC = 1;
  @Field.d(EmigrateAssetModel.INC++, "bytes")
  genesisDelegateSignatureBuffer!: Uint8Array;
  get genesisDelegateSignature() {
    const { genesisDelegateSignatureBuffer: genesisDelegateSignatureBuffer } = this;
    const signature = AccountSignatureModel.decode(genesisDelegateSignatureBuffer);
    SIGNATURE_BUFFER_WM.set(signature, genesisDelegateSignatureBuffer);
    return signature;
  }
  set genesisDelegateSignature(signature: AccountSignatureModel) {
    let buf = SIGNATURE_BUFFER_WM.get(signature);
    if (!buf) {
      buf = AccountSignatureModel.encode(signature).finish();
      SIGNATURE_BUFFER_WM.set(signature, buf);
    }
    this.genesisDelegateSignatureBuffer = buf;
  }
  /**欲销毁的数字资产来源链名 */
  @Field.d(EmigrateAssetModel.INC++, "string")
  sourceChainName!: string;
  /**欲销毁的数字资产来源链网络标识符 */
  @Field.d(EmigrateAssetModel.INC++, "string")
  sourceChainMagic!: string;
  /**欲销毁的数字资产名 */
  @Field.d(EmigrateAssetModel.INC++, "string")
  assetType!: string;
  /**欲销毁的数字资产数量 */
  @Field.d(EmigrateAssetModel.INC++, "string")
  amount!: string;
  @cacheBytesGetter
  getBytes() {
    const props: PropertyDescriptorMap = {
      genesisDelegateSignatureBuffer: { value: null },
    };
    const assetWrapper = Object.create(this, props);
    return this.$type.encode(assetWrapper).finish();
  }
  toJSON() {
    return {
      genesisDelegateSignature: this.genesisDelegateSignature.toJSON(),
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      amount: this.amount,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<EmigrateAssetModel>,
  ) {
    const res = super.fromObject(object) as EmigrateAssetModel;
    if (res !== object) {
      object.genesisDelegateSignature &&
        (res.genesisDelegateSignature = AccountSignatureModel.fromObject(
          object.genesisDelegateSignature,
        ));
    }
    return res as unknown as T;
  }
}

/**
 * emigrateAsset 交易 asset 外层模型
 *
 */
@Type.d("EmigrateAssetAssetModel")
export class EmigrateAssetAssetModel
  extends Message<EmigrateAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetAssetJSON>
{
  @Field.d(1, EmigrateAssetModel)
  emigrateAsset!: EmigrateAssetModel;
  toJSON() {
    return {
      emigrateAsset: this.emigrateAsset.toJSON(),
    };
  }
}
