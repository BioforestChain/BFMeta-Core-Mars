import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * acceptVote 交易 asset 模型
 *
 */
@Type.d("AcceptVoteAssetModel")
export class AcceptVoteAssetModel
  extends Message<AcceptVoteAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.AcceptVoteAssetJSON> {
  toJSON() {
    return {};
  }
}
