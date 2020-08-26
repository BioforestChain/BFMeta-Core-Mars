import { Transaction } from "@bfchain/core-model-transaction-base";
import { UsernameAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * username 交易模型
 *
 */
@Type.d("UsernameTransaction")
export class UsernameTransaction
  extends Transaction<BFChainCore.UsernameAssetJSON>
  implements BFChainCore.UsernameTransactionJSON {
  toJSON!: () => BFChainCore.UsernameTransactionJSON;
  recipientId!: undefined;
  @Field.d(UsernameTransaction.INC++, UsernameAssetModel)
  asset!: UsernameAssetModel;
}
