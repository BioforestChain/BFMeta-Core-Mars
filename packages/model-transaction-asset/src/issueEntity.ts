import { Message, Field, Type } from "@bfchain/protobuf";
import { IssueEntityFactoryModel } from "./issueEntityFactory";

/**
 * 发行非同质资产的交易 asset 模型
 *
 */
@Type.d("IssueEntityModel")
export class IssueEntityModel
  extends Message<IssueEntityModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityJSON>
{
  static INC = 1;
  /**非同质资产的所属链名 */
  @Field.d(IssueEntityModel.INC++, "string")
  sourceChainName!: string;
  /**非同质资产的所属链网络标识符 */
  @Field.d(IssueEntityModel.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产的 id */
  @Field.d(IssueEntityModel.INC++, "string")
  entityId!: string;
  /**非同质资产流通需要缴纳的版税 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  taxAssetPrealnum!: string;
  /**非同质资产模板的拥有者 */
  @Field.d(IssueEntityModel.INC++, "string")
  entityFactoryPossessor!: string;
  /**非同质资产模板 */
  @Field.d(IssueEntityModel.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.IssueEntityJSON = {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      entityId: this.entityId,
      taxAssetPrealnum: this.taxAssetPrealnum,
      entityFactoryPossessor: this.entityFactoryPossessor,
      entityFactory: this.entityFactory.toJSON(),
    };

    return res;
  }
}

/**
 * 发行非同质资产的交易 asset 外层模型
 *
 */
@Type.d("IssueEntityAssetModel")
export class IssueEntityAssetModel
  extends Message<IssueEntityAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityAssetJSON>
{
  @Field.d(1, IssueEntityModel)
  issueEntity!: IssueEntityModel;
  toJSON() {
    return {
      issueEntity: this.issueEntity.toJSON(),
    };
  }
}
