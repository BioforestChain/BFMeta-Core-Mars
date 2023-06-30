import { Transaction } from "@bfchain/core-model-transaction-base";
import { DestroyCertificateAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * destroyCertificate 交易模型
 *
 */
@Type.d("DestroyCertificateTransaction")
export class DestroyCertificateTransaction
  extends Transaction<BFChainCore.DestroyCertificateAssetJSON>
  implements BFChainCore.DestroyCertificateTransactionJSON
{
  toJSON!: () => BFChainCore.DestroyCertificateTransactionJSON;
  recipientId!: string;
  @Field.d(DestroyCertificateTransaction.INC++, DestroyCertificateAssetModel)
  asset!: DestroyCertificateAssetModel;
}
