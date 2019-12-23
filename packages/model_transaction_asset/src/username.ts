import { Message, Field, Type } from "@bfchain/protobuf";
import {
  parseHexToArrayBuffer,
  getHexFromArrayBuffer,
} from "@bfchain/util-encoding-hex";

/**
 * username 交易 asset 模型
 *
 */
@Type.d("UsernameModel")
export class UsernameModel extends Message<UsernameModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameJSON> {
  /**新的用户名 */
  @Field.d(1, "string")
  alias!: string;
  /**欲设置用户名的账户公钥 */
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
      alias: this.alias,
      publicKey: this.publicKey,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<UsernameModel>,
  ) {
    const res = super.fromObject(object) as UsernameModel;
    if (res !== object) {
      object.publicKey && (res.publicKey = object.publicKey);
    }
    return (res as unknown) as T;
  }
}

/**
 * username 交易 asset 外层模型
 *
 */
@Type.d("UsernameAssetModel")
export class UsernameAssetModel extends Message<UsernameAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameAssetJSON> {
  @Field.d(1, UsernameModel)
  username!: UsernameModel;
  toJSON() {
    return {
      username: this.username.toJSON(),
    };
  }
}
