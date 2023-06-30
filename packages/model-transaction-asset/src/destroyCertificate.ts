import type { CERTIFICATE_TYPE } from "@bfchain/core-model-constants";
import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * destroyCertificate 交易 asset 模型
 *
 */
@Type.d("DestroyCertificateModel")
export class DestroyCertificateModel
  extends Message<DestroyCertificateModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestroyCertificateJSON>
{
  static INC = 1;
  /**要销毁的凭证来源链名 */
  @Field.d(DestroyCertificateModel.INC++, "string")
  sourceChainName!: string;
  /**要销毁的凭证来源链网络标识符 */
  @Field.d(DestroyCertificateModel.INC++, "string")
  sourceChainMagic!: string;
  /**要销毁的凭证凭证 */
  @Field.d(DestroyCertificateModel.INC++, "string")
  certificateId!: string;
  /**要销毁的凭证凭证类型 */
  @Field.d(DestroyCertificateModel.INC++, "uint32")
  type!: CERTIFICATE_TYPE;
  toJSON() {
    return {
      sourceChainMagic: this.sourceChainMagic,
      sourceChainName: this.sourceChainName,
      certificateId: this.certificateId,
      type: this.type,
    };
  }
}

/**
 * destroyCertificate 交易 asset 外层模型
 *
 */
@Type.d("DestroyCertificateAssetModel")
export class DestroyCertificateAssetModel
  extends Message<DestroyCertificateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DestroyCertificateAssetJSON>
{
  @Field.d(1, DestroyCertificateModel)
  destroyCertificate!: DestroyCertificateModel;
  toJSON() {
    return {
      destroyCertificate: this.destroyCertificate.toJSON(),
    };
  }
}
