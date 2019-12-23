import { Block } from "@bfchain/core-model-block-base";
import { CommonBlockRemarkModel } from "@bfchain/core-model-block-remark";
import { Type, Field } from "@bfchain/protobuf";

/**
 * commonBlock 区块模型
 *
 */
@Type.d("CommonBlock")
export class CommonBlock extends Block<BFChainCore.CommonBlockRemarkJSON> {
  @Field.d(CommonBlock.INC++, CommonBlockRemarkModel)
  remark!: CommonBlockRemarkModel;
}
