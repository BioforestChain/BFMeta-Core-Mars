import { Message, Field, Type } from "@bfchain/protobuf";
import { IssueEntityFactoryModel } from "./issueEntityFactory";

/**
 * 发行资产权益的交易 asset 模型
 *
 */
@Type.d("IssueEntityModel")
export class IssueEntityModel
  extends Message<IssueEntityModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueEntityJSON>
{
  static INC = 1;
  /**资产权益的所属链名 */
  @Field.d(IssueEntityModel.INC++, "string")
  sourceChainName!: string;
  /**资产权益的所属链网络标识符 */
  @Field.d(IssueEntityModel.INC++, "string")
  sourceChainMagic!: string;
  /**资产权益的 id */
  @Field.d(IssueEntityModel.INC++, "string")
  entityId!: string;
  /**资产权益模板 */
  @Field.d(IssueEntityModel.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.IssueEntityJSON = {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      entityId: this.entityId,
      entityFactory: this.entityFactory.toJSON(),
    };

    return res;
  }
}

/**
 * 发行资产权益的交易 asset 外层模型
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
