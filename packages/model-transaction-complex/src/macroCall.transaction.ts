import { Transaction } from "@bfchain/core-model-transaction-base";
import { MacroCallAssetModel } from "./macroCall.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * macro call 交易模型
 *
 */
@Type.d("MacroCallTransaction")
export class MacroCallTransaction extends Transaction<BFChainCore.MacroCallAssetJSON> {
  @Field.d(MacroCallTransaction.INC++, MacroCallAssetModel)
  asset!: MacroCallAssetModel;
}
