import { Block } from "@bfchain/core-model-block-base";
import { GenesisBlockRemarkModel } from "@bfchain/core-model-block-remark";
import { Type, Field } from "@bfchain/protobuf";

/**
 * genesisBlock 区块模型
 *
 */
@Type.d("GenesisBlock")
export class GenesisBlock
  extends Block<BFChainCore.GenesisBlockRemarkJSON>
  implements BFChainCore.GenesisBlock {
  @Field.d(GenesisBlock.INC++, GenesisBlockRemarkModel)
  remark!: GenesisBlockRemarkModel;
}
