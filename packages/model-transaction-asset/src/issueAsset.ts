import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * issueAsset 交易 asset 模型
 *
 */
@Type.d("IssueAssetModel")
export class IssueAssetModel
  extends Message<IssueAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueAssetJSON> {
  /**发行的资产所属的链名 */
  @Field.d(1, "string")
  sourceChainName!: string;
  /**发行的资产所属的链网络标识符 */
  @Field.d(2, "string")
  sourceChainMagic!: string;
  /**发行的数字资产的缩写 */
  @Field.d(3, "string")
  assetType!: string;
  /**计划发行的数字资产数量 */
  @Field.d(4, "string")
  expectedIssuedAssets!: string;
  /**发行的数字资产的创世账户地址 */
  @Field.d(5, "string")
  genesisAddress!: string;
  toJSON() {
    return {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      expectedIssuedAssets: this.expectedIssuedAssets,
      genesisAddress: this.genesisAddress,
    };
  }
}

/**
 * issueAsset 交易 asset 外层模型
 *
 */
@Type.d("IssueAssetAssetModel")
export class IssueAssetAssetModel
  extends Message<IssueAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueAssetAssetJSON> {
  @Field.d(1, IssueAssetModel)
  issueAsset!: IssueAssetModel;
  toJSON() {
    return {
      issueAsset: this.issueAsset.toJSON(),
    };
  }
}
