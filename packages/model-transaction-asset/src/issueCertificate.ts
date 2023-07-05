import type { CERTIFICATE_TYPE } from "@bfchain/core-model-constants";
import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * issueCertificate 交易 asset 模型
 *
 */
@Type.d("IssueCertificateModel")
export class IssueCertificateModel
  extends Message<IssueCertificateModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueCertificateJSON>
{
  static INC = 1;
  /**发行的凭证来源链名 */
  @Field.d(IssueCertificateModel.INC++, "string")
  sourceChainName!: string;
  /**发行的凭证来源链网络标识符 */
  @Field.d(IssueCertificateModel.INC++, "string")
  sourceChainMagic!: string;
  /**发行的凭证 */
  @Field.d(IssueCertificateModel.INC++, "string")
  certificateId!: string;
  /**发行的凭证类型 */
  @Field.d(IssueCertificateModel.INC++, "uint32")
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
 * issueCertificate 交易 asset 外层模型
 *
 */
@Type.d("IssueCertificateAssetModel")
export class IssueCertificateAssetModel
  extends Message<IssueCertificateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueCertificateAssetJSON>
{
  @Field.d(1, IssueCertificateModel)
  issueCertificate!: IssueCertificateModel;
  toJSON() {
    return {
      issueCertificate: this.issueCertificate.toJSON(),
    };
  }
}
