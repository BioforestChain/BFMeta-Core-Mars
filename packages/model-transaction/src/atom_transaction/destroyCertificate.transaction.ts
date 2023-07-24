import { Type, Field } from "@bfchain/protobuf";
import { DestroyCertificateAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * destroyCertificate 交易模型
 *
 */
@Type.d("DestroyCertificateTransaction")
export class DestroyCertificateTransaction
  extends AbstractTransaction<BFChainCore.DestroyCertificateAssetJSON>
  implements BFChainCore.DestroyCertificateTransactionJSON
{
  toJSON!: () => BFChainCore.DestroyCertificateTransactionJSON;
  recipientId!: string;
  @Field.d(DestroyCertificateTransaction.INC++, DestroyCertificateAssetModel)
  asset!: DestroyCertificateAssetModel;
}
