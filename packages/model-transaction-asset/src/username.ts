import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * username 交易 asset 模型
 *
 */
@Type.d("UsernameModel")
export class UsernameModel
  extends Message<UsernameModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameJSON>
{
  /**新的用户名 */
  @Field.d(1, "string")
  alias!: string;
  toJSON() {
    return {
      alias: this.alias,
    };
  }
}

/**
 * username 交易 asset 外层模型
 *
 */
@Type.d("UsernameAssetModel")
export class UsernameAssetModel
  extends Message<UsernameAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameAssetJSON>
{
  @Field.d(1, UsernameModel)
  username!: UsernameModel;
  toJSON() {
    return {
      username: this.username.toJSON(),
    };
  }
}
