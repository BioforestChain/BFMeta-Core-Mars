import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * destoryAsset 交易 asset 模型
 *
 */
@Type.d("DestoryAssetModel")
export class DestoryAssetModel
  extends Message<DestoryAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryAssetJSON> {
  /**欲销毁的数字资产来源链名 */
  @Field.d(1, "string")
  sourceChainName!: string;
  /**欲销毁的数字资产来源链网络标识符 */
  @Field.d(2, "string")
  sourceChainMagic!: string;
  /**欲销毁的数字资产名 */
  @Field.d(3, "string")
  assetType!: string;
  /**欲销毁的数字资产数量 */
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
 * destoryAsset 交易 asset 外层模型
 *
 */
@Type.d("DestoryAssetAssetModel")
export class DestoryAssetAssetModel
  extends Message<DestoryAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryAssetAssetJSON> {
  @Field.d(1, DestoryAssetModel)
  destoryAsset!: DestoryAssetModel;
  toJSON() {
    return {
      destoryAsset: this.destoryAsset.toJSON(),
    };
  }
}
