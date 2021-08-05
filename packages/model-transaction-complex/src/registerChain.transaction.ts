import { Transaction } from "@bfchain/core-model-transaction-base";
import { RegisterChainAssetModel } from "./registerChain.asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * registerChain 交易模型
 *
 */
@Type.d("RegisterChainTransaction")
export class RegisterChainTransaction
  extends Transaction<BFChainCore.RegisterChainAssetJSON>
  implements BFChainCore.RegisterChainTransactionJSON
{
  recipientId!: undefined;
  @Field.d(RegisterChainTransaction.INC++, RegisterChainAssetModel)
  asset!: RegisterChainAssetModel;
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.RegisterChainAssetJSON,
    { hasRecipientId: false }
  >;
}
