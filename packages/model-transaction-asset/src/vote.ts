import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * vote 交易 asset 模型
 *
 */
@Type.d("VoteModel")
export class VoteModel
  extends Message<VoteModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.VoteJSON>
{
  /**欲转账的数字资产所属链名 */
  @Field.d(1, "string")
  equity!: string;
  toJSON() {
    return {
      equity: this.equity,
    };
  }
}

/**
 * vote 交易 asset 外层模型
 *
 */
@Type.d("VoteAssetModel")
export class VoteAssetModel
  extends Message<VoteAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.VoteAssetJSON>
{
  @Field.d(1, VoteModel)
  vote!: VoteModel;
  toJSON() {
    return {
      vote: this.vote.toJSON(),
    };
  }
}
