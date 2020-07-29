import { Block } from "@bfchain/core-model-block-base";
import { CommonBlockAssetModel } from "@bfchain/core-model-block-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * commonBlock 区块模型
 *
 */
@Type.d("CommonBlock")
export class CommonBlock extends Block<BFChainCore.CommonBlockAssetJSON>
  implements BFChainCore.CommonBlockJSON {
  toJSON!: () => BFChainCore.CommonBlockJSON;
  @Field.d(CommonBlock.INC++, CommonBlockAssetModel)
  asset!: CommonBlockAssetModel;
}
