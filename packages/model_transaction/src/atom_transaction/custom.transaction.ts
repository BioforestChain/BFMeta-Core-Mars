import { Transaction } from "@bfchain/core-model-transaction-base";
import { CustomAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * custom 交易模型
 *
 */
@Type.d("CustomTransaction")
export class CustomTransaction extends Transaction<BFChainCore.CustomAssetJSON> {
  @Field.d(CustomTransaction.INC++, CustomAssetModel)
  asset!: CustomAssetModel;
}
