import { cacheGetter } from "@bfchain/util-decorator";
import { Message, Field, Type } from "@bfchain/protobuf";
import { AccountSignatureModel } from "./accountSignature.model";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

/**
 * 迁移凭证信息
 *
 */
@Type.d("MigrateCertificateBodyModel")
export class MigrateCertificateBodyModel
  extends Message<MigrateCertificateBodyModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MigrateCertificateBodyJSON>
{
  static INC = 1;
  /**凭证版本 */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  version!: string;
  /**发起账户的唯一标识 version/address */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  fromUserId!: string;
  @cacheGetter
  get fromUser() {
    return this.fromUserId.split("/")[1];
  }
  /**接收账户的唯一标识 version/address */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  toUserId!: string;
  @cacheGetter
  get toUser() {
    return this.toUserId.split("/")[1];
  }
  /**迁出凭证生成时间 Date.now().getTimes() */
  @Field.d(MigrateCertificateBodyModel.INC++, "uint32")
  timestamp!: number;
  /**迁出链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  fromChainId!: string;
  @cacheGetter
  get fromChain() {
    const items = this.fromChainId.split("/");
    return {
      magic: items[1],
      chainName: items[2],
      genesisBlockSignature: items[3],
    };
  }
  /**迁入链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  toChainId!: string;
  @cacheGetter
  get toChain() {
    const items = this.toChainId.split("/");
    return {
      magic: items[1],
      chainName: items[2],
      genesisBlockSignature: items[3],
    };
  }
  /**迁出的权益：version/assetType */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  assetTypeId!: string;
  @cacheGetter
  get assetType() {
    return this.assetTypeId.split("/")[1];
  }
  /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
  @Field.d(MigrateCertificateBodyModel.INC++, "string")
  assets!: string;

  toJSON() {
    const res: BFChainCore.MigrateCertificateBodyJSON = {
      version: this.version,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      timestamp: this.timestamp,
      fromChainId: this.fromChainId,
      toChainId: this.toChainId,
      assetTypeId: this.assetTypeId,
      assets: this.assets,
    };
    return res;
  }
}

/**
 * 迁移凭证模型
 *
 */
@Type.d("MigrateCertificateModel")
export class MigrateCertificateModel
  extends Message<MigrateCertificateModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MigrateCertificateJSON>
{
  static INC = 1;
  /**迁移信息 */
  @Field.d(MigrateCertificateModel.INC++, MigrateCertificateBodyModel)
  body!: MigrateCertificateBodyModel;
  /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
  @Field.d(MigrateCertificateModel.INC++, "string")
  signature!: string;
  @cacheGetter
  get signatureJson() {
    const items = this.signature.split("/");
    const signatureKeyValue = items[1].split("-");
    const res: BFChainCore.AccountSignatureJSON = {
      publicKey: signatureKeyValue[0],
      signature: signatureKeyValue[1],
    };
    if (items[2]) {
      const signSignatureKeyValue = items[2].split("-");
      res.secondPublicKey = signSignatureKeyValue[0];
      res.signSignature = signSignatureKeyValue[1];
    }
    return res;
  }
  @cacheGetter
  get signatureBuffer() {
    return AccountSignatureModel.fromObject(this.signatureJson);
  }
  /**迁出链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
  @Field.d(MigrateCertificateModel.INC++, "string")
  fromAuthSignature!: string;
  @cacheGetter
  get fromAuthSignatureJson() {
    const items = this.fromAuthSignature.split("/");
    const signatureKeyValue = items[1].split("-");
    const res: BFChainCore.AccountSignatureJSON = {
      publicKey: signatureKeyValue[0],
      signature: signatureKeyValue[1],
    };
    if (items[2]) {
      const signSignatureKeyValue = items[2].split("-");
      res.secondPublicKey = signSignatureKeyValue[0];
      res.signSignature = signSignatureKeyValue[1];
    }
    return res;
  }
  @cacheGetter
  get fromAuthSignatureBuffer() {
    return AccountSignatureModel.fromObject(this.fromAuthSignatureJson);
  }
  /**迁入链的授权签名 version/publicKey-signature/secondPublicKey-signSignature */
  @Field.d(MigrateCertificateModel.INC++, "string")
  toAuthSignature!: string;
  @cacheGetter
  get toAuthSignatureJson() {
    const items = this.toAuthSignature.split("/");
    const signatureKeyValue = items[1].split("-");
    const res: BFChainCore.AccountSignatureJSON = {
      publicKey: signatureKeyValue[0],
      signature: signatureKeyValue[1],
    };
    if (items[2]) {
      const signSignatureKeyValue = items[2].split("-");
      res.secondPublicKey = signSignatureKeyValue[0];
      res.signSignature = signSignatureKeyValue[1];
    }
    return res;
  }
  @cacheGetter
  get toAuthSignatureBuffer() {
    return AccountSignatureModel.fromObject(this.toAuthSignatureJson);
  }

  @cacheBytesGetter
  getBytes(skipSignature?: boolean, skipSignSignature?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      const items = this.signature.split("/");
      props.signature = { value: items[0] };
    }
    if (!skipSignature && skipSignSignature) {
      const items = this.signature.split("/");
      if (items[1]) {
        props.signature = { value: items[0] + "/" + items[1] };
      }
    }
    props.fromAuthSignature = { value: null };
    props.toAuthSignature = { value: null };
    const certificateWrapper = Object.create(this, props);
    return this.$type.encode(certificateWrapper).finish();
  }

  @cacheBytesGetter
  getFromAuthBytes(skipSignature?: boolean, skipSignSignature?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      const items = this.fromAuthSignature.split("/");
      props.fromAuthSignature = { value: items[0] };
    }
    if (!skipSignature && skipSignSignature) {
      const items = this.fromAuthSignature.split("/");
      if (items[1]) {
        props.fromAuthSignature = { value: items[0] + "/" + items[1] };
      }
    }
    props.toAuthSignature = { value: null };
    const certificateWrapper = Object.create(this, props);
    return this.$type.encode(certificateWrapper).finish();
  }

  @cacheBytesGetter
  getToAuthBytes(skipSignature?: boolean, skipSignSignature?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      const items = this.toAuthSignature.split("/");
      props.toAuthSignature = { value: items[0] };
    }
    if (!skipSignature && skipSignSignature) {
      const items = this.toAuthSignature.split("/");
      if (items[1]) {
        props.toAuthSignature = { value: items[0] + "/" + items[1] };
      }
    }
    const certificateWrapper = Object.create(this, props);
    return this.$type.encode(certificateWrapper).finish();
  }

  toJSON() {
    const res: BFChainCore.MigrateCertificateJSON = {
      body: this.body.toJSON(),
      signature: this.signature,
      fromAuthSignature: this.fromAuthSignature,
      toAuthSignature: this.toAuthSignature,
    };
    return res;
  }
}
