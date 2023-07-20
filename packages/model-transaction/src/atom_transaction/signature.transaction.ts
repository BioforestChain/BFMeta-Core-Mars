import { Type, Field } from "@bfchain/protobuf";
import { SignatureAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * signature 交易模型
 *
 */
@Type.d("SignatureTransaction")
export class SignatureTransaction
  extends AbstractTransaction<BFChainCore.SignatureAssetJSON>
  implements BFChainCore.SignatureTransactionJSON
{
  toJSON!: () => BFChainCore.SignatureTransactionJSON;
  recipientId!: undefined;
  @Field.d(SignatureTransaction.INC++, SignatureAssetModel)
  asset!: SignatureAssetModel;
}
