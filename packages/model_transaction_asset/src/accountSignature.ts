import { Message, Field, Type } from "@bfchain/protobuf";
import {
  parseHexToArrayBuffer,
  getHexFromArrayBuffer,
} from "@bfchain/util-encoding-hex";

@Type.d("AccountSignatureModel")
export class AccountSignatureModel extends Message<AccountSignatureModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.AccountSignatureJSON> {
  static INC = 1;
  @Field.d(AccountSignatureModel.INC++, "bytes")
  publicKeyBuffer!: Uint8Array;
  public get publicKey(): string {
    return getHexFromArrayBuffer(this.publicKeyBuffer);
  }
  public set publicKey(value: string) {
    this.publicKeyBuffer = parseHexToArrayBuffer(value);
  }
  @Field.d(AccountSignatureModel.INC++, "bytes")
  signatureBuffer!: Uint8Array;
  public get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  public set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }
  @Field.d(AccountSignatureModel.INC++, "bytes")
  secondPublicKeyBuffer?: Uint8Array;
  public get secondPublicKey() {
    return (
      (this.secondPublicKeyBuffer && getHexFromArrayBuffer(this.secondPublicKeyBuffer)) || undefined
    );
  }
  public set secondPublicKey(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.secondPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  @Field.d(AccountSignatureModel.INC++, "bytes")
  signSignatureBuffer?: Uint8Array;
  get signSignature() {
    return (
      (this.signSignatureBuffer && getHexFromArrayBuffer(this.signSignatureBuffer)) || undefined
    );
  }
  set signSignature(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.signSignatureBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    const res: BFChainCore.AccountSignatureJSON = {
      publicKey: this.publicKey,
      signature: this.signature,
    };
    this.secondPublicKey && (res.secondPublicKey = this.secondPublicKey);
    this.signSignature && (res.signSignature = this.signSignature);

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<AccountSignatureModel>,
  ) {
    const res = super.fromObject(object) as AccountSignatureModel;
    if (res !== object) {
      object.publicKey && (res.publicKey = object.publicKey);
      object.signature && (res.signature = object.signature);
      object.secondPublicKey && (res.secondPublicKey = object.secondPublicKey);
      object.signSignature && (res.signSignature = object.signSignature);
    }
    return (res as unknown) as T;
  }
}
