import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsManagerAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * setLnsManager 交易模型
 *
 */
@Type.d("SetLnsManagerTransaction")
export class SetLnsManagerTransaction
  extends Transaction<BFChainCore.SetLnsManagerAssetJSON>
  implements BFChainCore.SetLnsManagerTransactionJSON {
  toJSON!: () => BFChainCore.SetLnsManagerTransactionJSON;
  recipientId!: string;
  @Field.d(SetLnsManagerTransaction.INC++, SetLnsManagerAssetModel)
  asset!: SetLnsManagerAssetModel;
}
