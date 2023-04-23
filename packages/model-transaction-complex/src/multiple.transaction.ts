import { Transaction } from "@bfchain/core-model-transaction-base";
import { MultipleAssetModel } from "./multiple.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * multiple 交易模型
 *
 */
@Type.d("MultipleTransaction")
export class MultipleTransaction extends Transaction<BFChainCore.MultipleAssetJSON> {
  @Field.d(MultipleTransaction.INC++, MultipleAssetModel)
  asset!: MultipleAssetModel;
}
