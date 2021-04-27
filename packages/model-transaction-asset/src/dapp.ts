import { Message, Field, Type } from "@bfchain/protobuf";
import type { DAPP_TYPE } from "@bfchain/core-model-constants";

/**
 * dapp 交易 asset 模型
 *
 */
@Type.d("DAppModel")
export class DAppModel
  extends Message<DAppModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppJSON> {
  static INC = 1;
  /**dapp 的所属链名 */
  @Field.d(DAppModel.INC++, "string")
  sourceChainName!: string;
  /**dapp 的所属链网络标识符 */
  @Field.d(DAppModel.INC++, "string")
  sourceChainMagic!: string;
  /**dapp 的 id */
  @Field.d(DAppModel.INC++, "string")
  dappid!: string;
  /**dapp 的类型 */
  @Field.d(DAppModel.INC++, "uint32")
  type!: DAPP_TYPE;
  /**指定购买资产和数量 */
  @Field.d(DAppModel.INC++, "string", "optional")
  purchaseAsset?: string;
  toJSON() {
    const res: BFChainCore.DAppJSON = {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      dappid: this.dappid,
      type: this.type,
    };
    this.purchaseAsset && (res.purchaseAsset = this.purchaseAsset);

    return res;
  }
}

/**
 * dapp 交易 asset 外层模型
 *
 */
@Type.d("DAppAssetModel")
export class DAppAssetModel
  extends Message<DAppAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppAssetJSON> {
  @Field.d(1, DAppModel)
  dapp!: DAppModel;
  toJSON() {
    return {
      dapp: this.dapp.toJSON(),
    };
  }
}
