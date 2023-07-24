import { AbstractTransaction } from "@bfchain/core-model-transaction";
import { MacroAssetModel } from "./macro.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * macro 交易模型
 *
 */
@Type.d("MacroTransaction")
export class MacroTransaction extends AbstractTransaction<BFChainCore.MacroAssetJSON> {
  @Field.d(MacroTransaction.INC++, MacroAssetModel)
  asset!: MacroAssetModel;
}
