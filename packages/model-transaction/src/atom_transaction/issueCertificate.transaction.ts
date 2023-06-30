import { Transaction } from "@bfchain/core-model-transaction-base";
import { IssueCertificateAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * issueCertificate 交易模型
 *
 */
@Type.d("IssueCertificateTransaction")
export class IssueCertificateTransaction
  extends Transaction<BFChainCore.IssueCertificateAssetJSON>
  implements BFChainCore.IssueCertificateTransactionJSON
{
  toJSON!: () => BFChainCore.IssueCertificateTransactionJSON;
  recipientId!: string;
  @Field.d(IssueCertificateTransaction.INC++, IssueCertificateAssetModel)
  asset!: IssueCertificateAssetModel;
}
