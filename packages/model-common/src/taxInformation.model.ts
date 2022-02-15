import { Message, Field, Type } from "@bfchain/protobuf";
/**
 * 收税模型
 */
@Type.d("TaxInformationModel")
export class TaxInformationModel
  extends Message<TaxInformationModel>
  implements BFChainUtil.JSONAble<BFChainCore.TaxInformationJson>
{
  /**收税人 */
  @Field.d(1, "string")
  taxCollector!: string;
  /**缴纳数量 */
  @Field.d(2, "string")
  taxAssetPrealnum!: string;
  toJSON() {
    return {
      taxCollector: this.taxCollector,
      taxAssetPrealnum: this.taxAssetPrealnum,
    };
  }
}
