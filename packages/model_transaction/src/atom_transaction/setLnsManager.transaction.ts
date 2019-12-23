import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsManagerAssetModel } from "@bfchain/core-model-transaction-asset/setLnsManager";
import { Type, Field } from "@bfchain/protobuf";

/**
 * setLnsManager 交易模型
 *
 */
@Type.d("SetLnsManagerTransaction")
export class SetLnsManagerTransaction extends Transaction<BFChainCore.SetLnsManagerAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.SetLnsManagerAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.SetLnsManagerAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(SetLnsManagerTransaction.INC++, SetLnsManagerAssetModel)
  asset!: SetLnsManagerAssetModel;
}
