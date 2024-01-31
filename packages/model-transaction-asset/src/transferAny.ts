import { TaxInformationModel } from "@bfchain/core-model-common";
import { PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";
import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * transferAny 交易 asset 模型
 *
 */
@Type.d("TransferAnyModel")
export class TransferAnyModel
  extends Message<TransferAnyModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAnyJSON>
{
  /**欲转账的同质资产所属链名 */
  @Field.d(1, "string")
  sourceChainName!: string;
  /**欲转账的同质资产所属链网络标识符 */
  @Field.d(2, "string")
  sourceChainMagic!: string;
  /**转移的资产所属大类 */
  @Field.d(3, PARENT_ASSET_TYPE)
  parentAssetType!: PARENT_ASSET_TYPE;
  /**转移的权益名称，大写字母组成，3-10 个字符 */
  @Field.d(4, "string")
  assetType!: string;
  /**转移的权益数量，0-9 组成并且不包含小数点，必须大于0 */
  @Field.d(5, "string")
  amount!: string;
  /**收税信息 */
  @Field.d(6, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;
  toJSON() {
    const res: BFChainCore.TransferAnyJSON = {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      parentAssetType: this.parentAssetType,
      assetType: this.assetType,
      amount: this.amount,
    };

    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());

    return res;
  }
}

/**
 * transferAny 交易 asset 外层模型
 *
 */
@Type.d("TransferAnyAssetModel")
export class TransferAnyAssetModel
  extends Message<TransferAnyAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAnyAssetJSON>
{
  @Field.d(1, TransferAnyModel)
  transferAny!: TransferAnyModel;
  toJSON() {
    return {
      transferAny: this.transferAny.toJSON(),
    };
  }
}
