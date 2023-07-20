import { Type, Field } from "@bfchain/protobuf";
import { IssueCertificateAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * issueCertificate 交易模型
 *
 */
@Type.d("IssueCertificateTransaction")
export class IssueCertificateTransaction
  extends AbstractTransaction<BFChainCore.IssueCertificateAssetJSON>
  implements BFChainCore.IssueCertificateTransactionJSON
{
  toJSON!: () => BFChainCore.IssueCertificateTransactionJSON;
  recipientId!: string;
  @Field.d(IssueCertificateTransaction.INC++, IssueCertificateAssetModel)
  asset!: IssueCertificateAssetModel;
}
