import { Message, Type, Field } from "@bfchain/protobuf";

/**
 * CommonBlock 区块 asset 外层模型
 */
@Type.d("CommonBlockAssetModel")
export class CommonBlockAssetModel extends Message<CommonBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.CommonBlockAssetJSON> {
  toJSON() {
    return {};
  }
}
