import { Message, Field, Type } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";

/**
 * mark 交易 asset 模型
 *
 */
@Type.d("MarkModel")
export class MarkModel
  extends Message<MarkModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MarkJSON> {
  static INC = 1;
  /**存证数据 */
  @Field.d(MarkModel.INC++, "string")
  content!: string;
  /**数据操作类型 get/put/post... */
  @Field.d(MarkModel.INC++, "string")
  action!: string;
  /**存证所属的 dapp */
  @Field.d(MarkModel.INC++, DAppModel)
  dapp!: DAppModel;
  toJSON() {
    return {
      content: this.content,
      action: this.action,
      dapp: this.dapp.toJSON(),
    };
  }
}

/**
 * mark 交易 asset 外层模型
 *
 */
@Type.d("MarkAssetModel")
export class MarkAssetModel
  extends Message<MarkAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.MarkAssetJSON> {
  @Field.d(1, MarkModel)
  mark!: MarkModel;
  toJSON() {
    return {
      mark: this.mark.toJSON(),
    };
  }
}
