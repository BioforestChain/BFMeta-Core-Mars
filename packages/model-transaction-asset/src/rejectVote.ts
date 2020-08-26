import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * rejectVote 交易 asset 模型
 *
 */
@Type.d("RejectVoteAssetModel")
export class RejectVoteAssetModel
  extends Message<RejectVoteAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.RejectVoteAssetJSON> {
  toJSON() {
    return {};
  }
}
