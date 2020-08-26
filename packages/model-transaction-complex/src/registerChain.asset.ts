import { Message, Field, Type } from "@bfchain/protobuf";
import { GenesisBlock } from "@bfchain/core-model-block";

let register_chain_field_index_acc = 1;
/**
 * registerChain 交易 asset 模型
 *
 */
@Type.d("RegisterChainModel")
export class RegisterChainModel
  extends Message<RegisterChainModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RegisterChainJSON> {
  /**创世块 */
  @Field.d(register_chain_field_index_acc++, GenesisBlock)
  genesisBlock!: GenesisBlock;
  toJSON() {
    return {
      genesisBlock: this.genesisBlock.toJSON(),
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
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RegisterChainAssetJSON> {
  @Field.d(1, RegisterChainModel)
  registerChain!: RegisterChainModel;
  toJSON() {
    return {
      registerChain: this.registerChain.toJSON(),
    };
  }
}
