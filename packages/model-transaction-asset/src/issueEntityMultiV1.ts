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
  toJSON() {
    const res: BFChainCore.EntityStructJSON = {
      entityId: this.entityId,
      taxAssetPrealnum: this.taxAssetPrealnum,
    };
    return res;
  }
}

/**
 * 批量发行非同质资产的交易 asset 模型
 *
 */
@Type.d("IssueEntityMultiV1Model")
export class IssueEntityMultiV1Model
  extends Message<IssueEntityMultiV1Model>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityMultiV1JSON>
{
  static INC = 1;
  /**非同质资产的所属链名 */
  @Field.d(IssueEntityMultiV1Model.INC++, "string")
  sourceChainName!: string;
  /**非同质资产的所属链网络标识符 */
  @Field.d(IssueEntityMultiV1Model.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产的 id 列表 */
  @Field.d(IssueEntityMultiV1Model.INC++, EntityStructModel, "repeated")
  entityStructList!: EntityStructModel[];
  /**非同质资产模板的拥有者 */
  @Field.d(IssueEntityMultiV1Model.INC++, "string")
  entityFactoryPossessor!: string;
  /**非同质资产模板 */
  @Field.d(IssueEntityMultiV1Model.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.IssueEntityMultiV1JSON = {
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
@Type.d("IssueEntityMultiAssetV1Model")
export class IssueEntityMultiAssetV1Model
  extends Message<IssueEntityMultiAssetV1Model>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityMultiAssetV1JSON>
{
  @Field.d(1, IssueEntityMultiV1Model)
  issueEntityMulti!: IssueEntityMultiV1Model;
  toJSON() {
    return {
      issueEntityMulti: this.issueEntityMulti.toJSON(),
    };
  }
}
