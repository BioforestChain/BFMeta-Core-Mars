import { Message, Field, Type } from "@bfchain/protobuf";
import {
  parseHexToArrayBuffer,
  getHexFromArrayBuffer,
} from "@bfchain/util-encoding-hex";

/**
 * Delegate 交易 asset 模型
 *
 */
@Type.d("DelegateModel")
export class DelegateModel extends Message<DelegateModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateJSON> {
  /**欲注册为受托人的账户的用户名 */
  @Field.d(1, "string")
  username!: string;
  /**欲注册为受托人的账户的公钥 */
  @Field.d(2, "bytes")
  publicKeyBuffer!: Uint8Array;
  public get publicKey(): string {
    return getHexFromArrayBuffer(this.publicKeyBuffer);
  }
  public set publicKey(value: string) {
    this.publicKeyBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    return {
      username: this.username,
      publicKey: this.publicKey,
    };
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<DelegateModel>,
  ) {
    const res = super.fromObject(object) as DelegateModel;
    if (res !== object) {
      object.publicKey && (res.publicKey = object.publicKey);
    }
    return (res as unknown) as T;
  }
}

/**
 * Delegate 交易 asset 外层模型
 */
@Type.d("DelegateAssetModel")
export class DelegateAssetModel extends Message<DelegateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateAssetJSON> {
  @Field.d(1, DelegateModel)
  delegate!: DelegateModel;
  toJSON() {
    return {
      delegate: this.delegate.toJSON(),
    };
  }
}
