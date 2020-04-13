import { Block } from "@bfchain/core-model-block-base";
import { RoundLastBlockAssetModel } from "@bfchain/core-model-block-asset";
import { Type, Field } from "@bfchain/protobuf";
import { CommonBlock } from "./commonBlock.block";

/**
 * roundLastBlock 区块模型
 *
 */
@Type.d("RoundLastBlock")
export class RoundLastBlock extends Block<BFChainCore.RoundLastBlockAssetJSON>
  implements BFChainCore.RoundLastBlockBlockJSON {
  toJSON!: () => BFChainCore.RoundLastBlockBlockJSON;
  @Field.d(CommonBlock.INC++, RoundLastBlockAssetModel)
  asset!: RoundLastBlockAssetModel;
}
