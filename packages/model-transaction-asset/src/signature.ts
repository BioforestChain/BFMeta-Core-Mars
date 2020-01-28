import { Message, Field, Type } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";

/**
 * signature 交易 asset 模型
 *
 */
@Type.d("SignatureModel")
export class SignatureModel extends Message<SignatureModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SignatureJSON> {
  /**二次密码生成的公钥 */
  @Field.d(1, "bytes")
  publicKeyBuffer!: Uint8Array;
  public get publicKey(): string {
    return getHexFromArrayBuffer(this.publicKeyBuffer);
  }
  public set publicKey(value: string) {
    this.publicKeyBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    return {
      publicKey: this.publicKey,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<SignatureModel>,
  ) {
    const res = super.fromObject(object) as SignatureModel;
    if (res !== object) {
      object.publicKey && (res.publicKey = object.publicKey);
    }
    return (res as unknown) as T;
  }
}

/**
 * signature 交易 asset 外层模型
 *
 */
@Type.d("SignatureAssetModel")
export class SignatureAssetModel extends Message<SignatureAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SignatureAssetJSON> {
  @Field.d(1, SignatureModel)
  signature!: SignatureModel;
  toJSON() {
    return {
      signature: this.signature.toJSON(),
    };
  }
}
