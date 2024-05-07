import { Message, Field, Type } from "@bfchain/protobuf";
import { IssueEntityFactoryModel } from "./issueEntityFactory";

@Type.d("EntityStructModel")
export class EntityStructModel
  extends Message<EntityStructModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.EntityStructJSON>
{
  /**非同质资产的 id */
  @Field.d(1, "string")
  entityId!: string;
  /**非同质资产流通需要缴纳的版税 */
  @Field.d(2, "string")
  taxAssetPrealnum!: string;
  /**非同质资产流通需要缴纳的版税 */
  @Field.d(3, "string", "optional")
  taxAssetRecipientId?: string;
  toJSON() {
    const res: BFChainCore.EntityStructJSON = {
      entityId: this.entityId,
      taxAssetPrealnum: this.taxAssetPrealnum,
    };
    this.taxAssetRecipientId && (res.taxAssetRecipientId = this.taxAssetRecipientId);
    return res;
  }
}

/**
 * 批量发行非同质资产的交易 asset 模型
 *
 */
@Type.d("IssueEntityMultiModel")
export class IssueEntityMultiModel
  extends Message<IssueEntityMultiModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityMultiJSON>
{
  static INC = 1;
  /**非同质资产的所属链名 */
  @Field.d(IssueEntityMultiModel.INC++, "string")
  sourceChainName!: string;
  /**非同质资产的所属链网络标识符 */
  @Field.d(IssueEntityMultiModel.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产的 id 列表 */
  @Field.d(IssueEntityMultiModel.INC++, EntityStructModel, "repeated")
  entityStructList!: EntityStructModel[];
  /**非同质资产模板的拥有者 */
  @Field.d(IssueEntityMultiModel.INC++, "string")
  entityFactoryPossessor!: string;
  /**非同质资产模板 */
  @Field.d(IssueEntityMultiModel.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.IssueEntityMultiJSON = {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      entityStructList: this.entityStructList.map((entityStruct) => entityStruct.toJSON()),
      entityFactoryPossessor: this.entityFactoryPossessor,
      entityFactory: this.entityFactory.toJSON(),
    };
    return res;
  }
}

/**
 * 批量发行非同质资产的交易 asset 外层模型
 *
 */
@Type.d("IssueEntityMultiAssetModel")
export class IssueEntityMultiAssetModel
  extends Message<IssueEntityMultiAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityMultiAssetJSON>
{
  @Field.d(1, IssueEntityMultiModel)
  issueEntityMulti!: IssueEntityMultiModel;
  toJSON() {
    return {
      issueEntityMulti: this.issueEntityMulti.toJSON(),
    };
  }
}
