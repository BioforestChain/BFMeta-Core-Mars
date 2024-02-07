import { Message, Field, Type } from "@bfchain/protobuf";
import { StakeAssetModel } from "./stakeAsset";

/**
 * unstakeAsset 交易 asset 模型
 *
 */
@Type.d("UnstakeAssetModel")
export class UnstakeAssetModel
  extends Message<UnstakeAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.UnstakeAssetJSON>
{
  static INC = 1;
  /**质押的唯一索引：1-30个 小写字母 + 数字 */
  @Field.d(UnstakeAssetModel.INC++, "string")
  stakeId!: string;
  /**质押的同质资产所属链名，小写字母组成，5-20 位 */
  @Field.d(UnstakeAssetModel.INC++, "string")
  sourceChainName!: string;
  /**质押的同质资产所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
  @Field.d(UnstakeAssetModel.INC++, "string")
  sourceChainMagic!: string;
  /**质押的同质资产名称，大写字母组成，3-10 个字符 */
  @Field.d(UnstakeAssetModel.INC++, "string")
  assetType!: string;
  /**解质押的同质资产数量，0-9 组成并且不包含小数点，必须大于0 */
  @Field.d(UnstakeAssetModel.INC++, "string")
  assetPrealnum!: string;
  toJSON() {
    return {
      stakeId: this.stakeId,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      assetPrealnum: this.assetPrealnum,
    };
  }
}

/**
 * unstakeAsset 交易 asset 外层模型
 *
 */
@Type.d("UnstakeAssetAssetModel")
export class UnstakeAssetAssetModel
  extends Message<UnstakeAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.UnstakeAssetAssetJSON>
{
  @Field.d(1, UnstakeAssetModel)
  unstakeAsset!: UnstakeAssetModel;
  toJSON() {
    return {
      unstakeAsset: this.unstakeAsset.toJSON(),
    };
  }
}
