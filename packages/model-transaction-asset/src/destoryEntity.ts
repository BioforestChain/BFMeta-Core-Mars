import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { IssueEntityFactoryModel } from "./issueEntityFactory";

/**
 * 销毁非同质资产的交易 asset 模型
 *
 */
@Type.d("DestoryEntityModel")
export class DestoryEntityModel
  extends Message<DestoryEntityModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryEntityJSON>
{
  static INC = 1;
  /**要抢的红包交易的签名 */
  @Field.d(DestoryEntityModel.INC++, "bytes")
  transactionSubIdBuffer!: Uint8Array;
  public get transactionSubId(): string {
    return getHexFromArrayBuffer(this.transactionSubIdBuffer);
  }
  public set transactionSubId(value: string) {
    this.transactionSubIdBuffer = parseHexToArrayBuffer(value);
  }
  /**非同质资产的所属链名 */
  @Field.d(DestoryEntityModel.INC++, "string")
  sourceChainName!: string;
  /**非同质资产的所属链网络标识符 */
  @Field.d(DestoryEntityModel.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产的 id */
  @Field.d(DestoryEntityModel.INC++, "string")
  entityId!: string;
  /**非同质资产模板的申请者 */
  @Field.d(DestoryEntityModel.INC++, "string")
  entityFactoryApplicant!: string;
  /**非同质资产模板的拥有者 */
  @Field.d(DestoryEntityModel.INC++, "string")
  entityFactoryPossessor!: string;
  /**非同质资产模板 */
  @Field.d(DestoryEntityModel.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.DestoryEntityJSON = {
      transactionSubId: this.transactionSubId,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      entityId: this.entityId,
      entityFactoryApplicant: this.entityFactoryApplicant,
      entityFactoryPossessor: this.entityFactoryPossessor,
      entityFactory: this.entityFactory.toJSON(),
    };

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<DestoryEntityModel>,
  ) {
    const res = super.fromObject(object) as DestoryEntityModel;
    if (res !== object) {
      object.transactionSubId && (res.transactionSubId = object.transactionSubId);
    }
    return res as unknown as T;
  }
}

/**
 * 销毁非同质资产的交易 asset 外层模型
 *
 */
@Type.d("DestoryEntityAssetModel")
export class DestoryEntityAssetModel
  extends Message<DestoryEntityAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryEntityAssetJSON>
{
  @Field.d(1, DestoryEntityModel)
  destoryEntity!: DestoryEntityModel;
  toJSON() {
    return {
      destoryEntity: this.destoryEntity.toJSON(),
    };
  }
}
