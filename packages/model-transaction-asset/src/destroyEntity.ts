import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { IssueEntityFactoryModel } from "./issueEntityFactory";

/**
 * 销毁非同质资产的交易 asset 模型
 *
 */
@Type.d("DestroyEntityModel")
export class DestroyEntityModel
  extends Message<DestroyEntityModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestroyEntityJSON>
{
  static INC = 1;
  /**要抢的红包交易的签名 */
  @Field.d(DestroyEntityModel.INC++, "bytes")
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }
  /**非同质资产的所属链名 */
  @Field.d(DestroyEntityModel.INC++, "string")
  sourceChainName!: string;
  /**非同质资产的所属链网络标识符 */
  @Field.d(DestroyEntityModel.INC++, "string")
  sourceChainMagic!: string;
  /**非同质资产的 id */
  @Field.d(DestroyEntityModel.INC++, "string")
  entityId!: string;
  /**非同质资产模板的申请者 */
  @Field.d(DestroyEntityModel.INC++, "string")
  entityFactoryApplicant!: string;
  /**非同质资产模板的拥有者 */
  @Field.d(DestroyEntityModel.INC++, "string")
  entityFactoryPossessor!: string;
  /**非同质资产模板 */
  @Field.d(DestroyEntityModel.INC++, IssueEntityFactoryModel)
  entityFactory!: IssueEntityFactoryModel;
  toJSON() {
    const res: BFChainCore.DestroyEntityJSON = {
      transactionSignature: this.transactionSignature,
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
    object: BFChainProtobuf.ObjectFromType<DestroyEntityModel>,
  ) {
    const res = super.fromObject(object) as DestroyEntityModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
    }
    return res as unknown as T;
  }
}

/**
 * 销毁非同质资产的交易 asset 外层模型
 *
 */
@Type.d("DestroyEntityAssetModel")
export class DestroyEntityAssetModel
  extends Message<DestroyEntityAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestroyEntityAssetJSON>
{
  @Field.d(1, DestroyEntityModel)
  destroyEntity!: DestroyEntityModel;
  toJSON() {
    return {
      destroyEntity: this.destroyEntity.toJSON(),
    };
  }
}
