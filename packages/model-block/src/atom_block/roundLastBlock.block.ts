import { Block } from "@bfchain/core-model-block-base";
import { RoundLastBlockRemarkModel } from "@bfchain/core-model-block-remark";
import { Type, Field } from "@bfchain/protobuf";

/**
 * genesisBlock 区块模型
 *
 */
@Type.d("RoundLastBlock")
export class RoundLastBlock
  extends Block<BFChainCore.RoundLastBlockRemarkJSON>
  implements BFChainCore.RoundLastBlock {
  @Field.d(RoundLastBlock.INC++, RoundLastBlockRemarkModel)
  remark!: RoundLastBlockRemarkModel;
}
