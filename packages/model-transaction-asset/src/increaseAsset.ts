import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * increaseAsset 交易 asset 模型
 *
 */
@Type.d("IncreaseAssetModel")
export class IncreaseAssetModel
  extends Message<IncreaseAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IncreaseAssetJSON>
{
  /**权益发行账户 */
  @Field.d(1, "string")
  applyAddress!: string;
  /**发行的资产所属的链名 */
  @Field.d(2, "string")
  sourceChainName!: string;
  /**发行的资产所属的链网络标识符 */
  @Field.d(3, "string")
  sourceChainMagic!: string;
  /**发行的资产的缩写 */
  @Field.d(4, "string")
  assetType!: string;
  /**增发的资产数量 */
  @Field.d(5, "string")
  increasedAssetPrealnum!: string;
  /**冻结的主权益数量 */
  @Field.d(6, "string")
  frozenMainAssetPrealnum!: string;
  toJSON() {
    return {
      applyAddress: this.applyAddress,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      increasedAssetPrealnum: this.increasedAssetPrealnum,
      frozenMainAssetPrealnum: this.frozenMainAssetPrealnum,
    };
  }
}

/**
 * increaseAsset 交易 asset 外层模型
 *
 */
@Type.d("IncreaseAssetAssetModel")
export class IncreaseAssetAssetModel
  extends Message<IncreaseAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IncreaseAssetAssetJSON>
{
  @Field.d(1, IncreaseAssetModel)
  increaseAsset!: IncreaseAssetModel;
  toJSON() {
    return {
      increaseAsset: this.increaseAsset.toJSON(),
    };
  }
}
