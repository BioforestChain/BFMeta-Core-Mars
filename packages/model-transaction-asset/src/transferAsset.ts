import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * transferAsset 交易 asset 模型
 *
 */
@Type.d("TransferAssetModel")
export class TransferAssetModel
  extends Message<TransferAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAssetJSON> {
  /**欲转账的数字资产所属链名 */
  @Field.d(1, "string")
  sourceChainName!: string;
  /**欲转账的数字资产所属链网络标识符 */
  @Field.d(2, "string")
  sourceChainMagic!: string;
  @Field.d(3, "string")
  assetType!: string;
  @Field.d(4, "string")
  amount!: string;
  toJSON() {
    return {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      amount: this.amount,
    };
  }
}

/**
 * transferAsset 交易 asset 外层模型
 *
 */
@Type.d("TransferAssetAssetModel")
export class TransferAssetAssetModel
  extends Message<TransferAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAssetAssetJSON> {
  @Field.d(1, TransferAssetModel)
  transferAsset!: TransferAssetModel;
  toJSON() {
    return {
      transferAsset: this.transferAsset.toJSON(),
    };
  }
}
