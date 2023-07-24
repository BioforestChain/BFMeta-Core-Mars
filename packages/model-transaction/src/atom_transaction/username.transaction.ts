import { Type, Field } from "@bfchain/protobuf";
import { UsernameAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * username 交易模型
 *
 */
@Type.d("UsernameTransaction")
export class UsernameTransaction
  extends AbstractTransaction<BFChainCore.UsernameAssetJSON>
  implements BFChainCore.UsernameTransactionJSON
{
  toJSON!: () => BFChainCore.UsernameTransactionJSON;
  recipientId!: undefined;
  @Field.d(UsernameTransaction.INC++, UsernameAssetModel)
  asset!: UsernameAssetModel;
}
