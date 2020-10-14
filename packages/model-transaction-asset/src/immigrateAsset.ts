import { Message, Field, Type } from "@bfchain/protobuf";
// import { EmigrateAssetTransaction } from "@bfchain/core-model/src/transactionModel/emigrateAsset.transaction";
import { AccountSignatureModel } from "./accountSignature";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
const SIGNATURE_BUFFER_WM = new WeakMap<AccountSignatureModel, Uint8Array>();

/**
 * immigrateAsset 交易 asset 模型
 *
 */
@Type.d("ImmigrateAssetModel")
export class ImmigrateAssetModel
  extends Message<ImmigrateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetJSON> {
  static INC = 1;
  @Field.d(ImmigrateAssetModel.INC++, "bytes")
  genesisDelegateSignatureBuffer!: Uint8Array;
  get genesisDelegateSignature() {
    const { genesisDelegateSignatureBuffer } = this;
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
  /**完整的资产迁出交易 */
  @Field.d(ImmigrateAssetModel.INC++, "EmigrateAssetTransaction")
  emigrateAssetTransaction!: BFChainCore.JSONToModelType<BFChainCore.EmigrateAssetTransactionJSON>;
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
      emigrateAssetTransaction: this.emigrateAssetTransaction.toJSON(),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ImmigrateAssetModel>,
  ) {
    const res = super.fromObject(object) as ImmigrateAssetModel;
    if (res !== object) {
      object.genesisDelegateSignature &&
        (res.genesisDelegateSignature = AccountSignatureModel.fromObject(
          object.genesisDelegateSignature,
        ));
    }
    return (res as unknown) as T;
  }
}

/**
 * immigrateAsset 交易 asset 外层模型
 *
 */
@Type.d("ImmigrateAssetAssetModel")
export class ImmigrateAssetAssetModel
  extends Message<ImmigrateAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetAssetJSON> {
  @Field.d(1, ImmigrateAssetModel)
  immigrateAsset!: ImmigrateAssetModel;
  toJSON() {
    return {
      immigrateAsset: this.immigrateAsset.toJSON(),
    };
  }
}
