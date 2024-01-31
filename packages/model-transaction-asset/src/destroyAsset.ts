import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * destroyAsset 交易 asset 模型
 *
 */
@Type.d("DestroyAssetModel")
export class DestroyAssetModel
  extends Message<DestroyAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestroyAssetJSON>
{
  /**欲销毁的同质资产来源链名 */
  @Field.d(1, "string")
  sourceChainName!: string;
  /**欲销毁的同质资产来源链网络标识符 */
  @Field.d(2, "string")
  sourceChainMagic!: string;
  /**欲销毁的同质资产名 */
  @Field.d(3, "string")
  assetType!: string;
  /**欲销毁的同质资产数量 */
  @Field.d(4, "string")
  amount!: string;
  toJSON() {
    return {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      amount: this.amount,
    };
  }
}

/**
 * destroyAsset 交易 asset 外层模型
 *
 */
@Type.d("DestroyAssetAssetModel")
export class DestroyAssetAssetModel
  extends Message<DestroyAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestroyAssetAssetJSON>
{
  @Field.d(1, DestroyAssetModel)
  destroyAsset!: DestroyAssetModel;
  toJSON() {
    return {
      destroyAsset: this.destroyAsset.toJSON(),
    };
  }
}
