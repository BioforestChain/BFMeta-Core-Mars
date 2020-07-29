import { Block } from "@bfchain/core-model-block-base";
import { GenesisBlockAssetModel } from "@bfchain/core-model-block-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * genesisBlock 区块模型
 *
 */
@Type.d("GenesisBlock")
export class GenesisBlock extends Block<BFChainCore.GenesisBlockAssetJSON>
  implements BFChainCore.GenesisBlockJSON {
  toJSON!: () => BFChainCore.GenesisBlockJSON;
  @Field.d(GenesisBlock.INC++, GenesisBlockAssetModel)
  asset!: GenesisBlockAssetModel;
}
