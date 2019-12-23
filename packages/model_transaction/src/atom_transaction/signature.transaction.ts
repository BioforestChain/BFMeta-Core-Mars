import { Transaction } from "@bfchain/core-model-transaction-base";
import { SignatureAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * signature 交易模型
 *
 */
@Type.d("SignatureTransaction")
export class SignatureTransaction extends Transaction<BFChainCore.SignatureAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.SignatureAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.SignatureAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(SignatureTransaction.INC++, SignatureAssetModel)
  asset!: SignatureAssetModel;
}
