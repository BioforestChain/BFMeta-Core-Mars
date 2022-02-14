import { Message, Field, Type } from "@bfchain/protobuf";
import { IssueEntityFactoryModel } from "./issueEntityFactory";

/**
 * 发行非同质资产的交易 asset 模型
 *
 */
@Type.d("IssueEntityV1Model")
export class IssueEntityV1Model
  extends Message<IssueEntityV1Model>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityV1JSON>
{
  static INC = 1;
  /**非同质资产的所属链名 */
  @Field.d(IssueEntityV1Model.INC++, "string")
  sourceChainName!: string;
  /**非同质资产的所属链网络标识符 */
  @Field.d(IssueEntityV1Model.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产的 id */
  @Field.d(IssueEntityV1Model.INC++, "string")
  entityId!: string;
  /**非同质资产流通需要缴纳的版税 */
  @Field.d(IssueEntityFactoryModel.INC++, "string")
  taxAssetPrealnum!: string;
  /**非同质资产模板的拥有者 */
  @Field.d(IssueEntityV1Model.INC++, "string")
  entityFactoryPossessor!: string;
  /**非同质资产模板 */
  @Field.d(IssueEntityV1Model.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.IssueEntityV1JSON = {
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
@Type.d("IssueEntityAssetV1Model")
export class IssueEntityAssetV1Model
  extends Message<IssueEntityAssetV1Model>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityAssetV1JSON>
{
  @Field.d(1, IssueEntityV1Model)
  issueEntity!: IssueEntityV1Model;
  toJSON() {
    return {
      issueEntity: this.issueEntity.toJSON(),
    };
  }
}
