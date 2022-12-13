import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * registerChain 交易 asset 模型
 *
 */
@Type.d("RegisterChainModel")
export class RegisterChainModel
  extends Message<RegisterChainModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RegisterChainJSON>
{
  /**创世块 */
  @Field.d(1, "string")
  genesisBlock!: string;
  toJSON() {
    return {
      genesisBlock: this.genesisBlock,
    };
  }
}

/**
 * registerChain 交易 asset 外层模型
 *
 */
@Type.d("RegisterChainAssetModel")
export class RegisterChainAssetModel
  extends Message<RegisterChainAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RegisterChainAssetJSON>
{
  @Field.d(1, RegisterChainModel)
  registerChain!: RegisterChainModel;
  toJSON() {
    return {
      registerChain: this.registerChain.toJSON(),
    };
  }
}
