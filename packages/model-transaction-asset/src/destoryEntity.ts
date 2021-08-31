import { Message, Field, Type } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";

/**
 * 销毁资产权益的交易 asset 模型
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
  transactionSignatureBuffer!: Uint8Array;
  public get transactionSignature(): string {
    return getHexFromArrayBuffer(this.transactionSignatureBuffer);
  }
  public set transactionSignature(value: string) {
    this.transactionSignatureBuffer = parseHexToArrayBuffer(value);
  }
  /**资产权益的所属链名 */
  @Field.d(DestoryEntityModel.INC++, "string")
  sourceChainName!: string;
  /**资产权益的所属链网络标识符 */
  @Field.d(DestoryEntityModel.INC++, "string")
  sourceChainMagic!: string;
  /**资产权益的 id */
  @Field.d(DestoryEntityModel.INC++, "string")
  entityId!: string;
  /**资产权益发行时冻结的主权益数量 */
  @Field.d(DestoryEntityModel.INC++, "string")
  entityFrozenAssetPrealnum!: string;
  toJSON() {
    const res: BFChainCore.DestoryEntityJSON = {
      transactionSignature: this.transactionSignature,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      entityId: this.entityId,
      entityFrozenAssetPrealnum: this.entityFrozenAssetPrealnum,
    };

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<DestoryEntityModel>,
  ) {
    const res = super.fromObject(object) as DestoryEntityModel;
    if (res !== object) {
      object.transactionSignature && (res.transactionSignature = object.transactionSignature);
    }
    return res as unknown as T;
  }
}

/**
 * 销毁资产权益的交易 asset 外层模型
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
