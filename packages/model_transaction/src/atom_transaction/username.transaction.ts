import { Transaction } from "@bfchain/core-model-transaction-base";
import { UsernameAssetModel } from "@bfchain/core-model-transaction-asset/username";
import { Type, Field } from "@bfchain/protobuf";

/**
 * username 交易模型
 *
 */
@Type.d("UsernameTransaction")
export class UsernameTransaction extends Transaction<BFChainCore.UsernameAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.UsernameAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.UsernameAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(UsernameTransaction.INC++, UsernameAssetModel)
  asset!: UsernameAssetModel;
}
