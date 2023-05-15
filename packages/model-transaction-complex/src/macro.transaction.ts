import { Transaction } from "@bfchain/core-model-transaction-base";
import { MacroAssetModel } from "./macro.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * macro 交易模型
 *
 */
@Type.d("MacroTransaction")
export class MacroTransaction extends Transaction<BFChainCore.MacroAssetJSON> {
  @Field.d(MacroTransaction.INC++, MacroAssetModel)
  asset!: MacroAssetModel;
}
