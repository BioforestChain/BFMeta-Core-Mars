import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * stakeAsset 交易 asset 模型
 *
 */
@Type.d("StakeAssetModel")
export class StakeAssetModel
  extends Message<StakeAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.StakeAssetJSON>
{
  static INC = 1;
  /**质押的唯一索引：1-30个 小写字母 + 数字 */
  @Field.d(StakeAssetModel.INC++, "string")
  stakeId!: string;
  /**质押的同质资产所属链名，小写字母组成，5-20 位 */
  @Field.d(StakeAssetModel.INC++, "string")
  sourceChainName!: string;
  /**质押的同质资产所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
  @Field.d(StakeAssetModel.INC++, "string")
  sourceChainMagic!: string;
  /**质押的同质资产名称，大写字母组成，3-10 个字符 */
  @Field.d(StakeAssetModel.INC++, "string")
  assetType!: string;
  /**质押的同质资产数量，0-9 组成并且不包含小数点，必须大于0 */
  @Field.d(StakeAssetModel.INC++, "string")
  assetPrealnum!: string;
  /**解除质押的区块高度 */
  @Field.d(StakeAssetModel.INC++, "uint32")
  unstakeHeight!: number;
  toJSON() {
    return {
      stakeId: this.stakeId,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      assetPrealnum: this.assetPrealnum,
      unstakeHeight: this.unstakeHeight,
    };
  }
}

/**
 * stakeAsset 交易 asset 外层模型
 *
 */
@Type.d("StakeAssetAssetModel")
export class StakeAssetAssetModel
  extends Message<StakeAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.StakeAssetAssetJSON>
{
  @Field.d(1, StakeAssetModel)
  stakeAsset!: StakeAssetModel;
  toJSON() {
    return {
      stakeAsset: this.stakeAsset.toJSON(),
    };
  }
}
