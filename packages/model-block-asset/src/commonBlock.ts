import { Message, Type } from "@bfchain/protobuf";

/**
 * CommonBlock 区块 asset 外层模型
 */
@Type.d("CommonBlockAssetModel")
export class CommonBlockAssetModel
  extends Message<CommonBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.CommonBlockAssetJSON>
{
  toJSON() {
    const res: BFChainCore.CommonBlockAssetJSON = {};
    return res;
  }
}
