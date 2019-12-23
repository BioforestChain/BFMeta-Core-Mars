import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * setLnsManager 交易 asset 模型
 *
 */
@Type.d("SetLnsManagerModel")
export class SetLnsManagerModel extends Message<SetLnsManagerModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsManagerJSON> {
  /**欲设置管理员的链域名 */
  @Field.d(1, "string")
  name!: string;
  /**欲设置管理员的链域名所属的链名称 */
  @Field.d(2, "string")
  sourceChainName!: string;
  /**欲设置管理员的链域名所属的链网络标识符 */
  @Field.d(3, "string")
  sourceChainMagic!: string;
  /**新的链域名管理者地址 */
  @Field.d(4, "string")
  manager!: string;
  toJSON() {
    return {
      name: this.name,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      manager: this.manager,
    };
  }
}

/**
 * setLnsManager 交易 asset 外层模型
 *
 */
@Type.d("SetLnsManagerAssetModel")
export class SetLnsManagerAssetModel extends Message<SetLnsManagerAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsManagerAssetJSON> {
  @Field.d(1, SetLnsManagerModel)
  lnsManager!: SetLnsManagerModel;
  toJSON() {
    return {
      lnsManager: this.lnsManager.toJSON(),
    };
  }
}
