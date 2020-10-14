import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * Delegate 交易 asset 外层模型
 */
@Type.d("DelegateAssetModel")
export class DelegateAssetModel
  extends Message<DelegateAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateAssetJSON> {
  toJSON() {
    return {};
  }
}
