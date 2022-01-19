import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * 发行非同质资产模板的交易 asset 模型
 *
 */
@Type.d("IssueEntityFactoryModel")
export class IssueEntityFactoryModel
  extends Message<IssueEntityFactoryModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityFactoryJSON>
{
  static INC = 1;
  /**非同质资产模板的所属链名 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  sourceChainName!: string;
  /**非同质资产模板的所属链网络标识符 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产模板的 id */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  factoryId!: string;
  /**非同质资产模板的允许创建数量 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  entityPrealnum!: string;
  /**非同质资产发行时冻结的主权益数量 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  entityFrozenAssetPrealnum!: string;
  /**指定购买资产和数量 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  purchaseAssetPrealnum!: string;
  toJSON() {
    return {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      factoryId: this.factoryId,
      entityPrealnum: this.entityPrealnum,
      entityFrozenAssetPrealnum: this.entityFrozenAssetPrealnum,
      purchaseAssetPrealnum: this.purchaseAssetPrealnum,
    };
  }
}

/**
 * 发行非同质资产模板的交易 asset 外层模型
 *
 */
@Type.d("IssueEntityFactoryAssetModel")
export class IssueEntityFactoryAssetModel
  extends Message<IssueEntityFactoryAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityFactoryAssetJSON>
{
  @Field.d(1, IssueEntityFactoryModel)
  issueEntityFactory!: IssueEntityFactoryModel;
  toJSON() {
    return {
      issueEntityFactory: this.issueEntityFactory.toJSON(),
    };
  }
}
