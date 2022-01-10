import { Block } from "@bfchain/core-model-block-base";
import { RoundLastBlockAssetModel } from "@bfchain/core-model-block-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * roundLastBlock 区块模型
 *
 */
@Type.d("RoundLastBlock")
export class RoundLastBlock
  extends Block<BFChainCore.RoundLastBlockAssetJSON>
  implements BFChainCore.RoundLastBlockJSON
{
  toJSON!: () => BFChainCore.RoundLastBlockJSON;
  @Field.d(21, RoundLastBlockAssetModel)
  asset!: RoundLastBlockAssetModel;
}
